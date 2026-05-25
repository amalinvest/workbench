mod redis_ping;
mod secrets;
mod sidecar;

use std::sync::Mutex;

use serde::Serialize;
use sidecar::{SidecarHandle, SidecarManager};
use tauri::{Emitter, Manager, RunEvent};

/// Result of a successful `connect` call: the loopback port the sidecar is
/// listening on plus discovery stats so the onboarding pill can show
/// "N queues found".
///
/// `password_saved` is `None` when the user opted out of remember-password,
/// `Some(true)` on successful keychain write, and `Some(false)` when the
/// keychain was unavailable (headless Linux without Secret Service, user
/// clicked Deny on the macOS prompt, etc.). The UI uses this to surface a
/// one-time toast.
#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResult {
    pub port: u16,
    pub queues: u32,
    pub discovery_total: Option<u32>,
    pub discovery_capped: bool,
    pub password_saved: Option<bool>,
    pub password_save_error: Option<String>,
}

/// Structured failure shape returned to the UI. `code` drives which onboarding
/// error pill renders.
#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppError {
    pub code: String,
    pub message: String,
}

impl AppError {
    fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
        }
    }
}

/// Snapshot of the current sidecar state for `get_status`.
#[derive(Debug, Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionStatus {
    pub connected: bool,
    pub port: Option<u16>,
    pub queues: Option<u32>,
}

/// App-wide state container — keyed by a single `Mutex` since transitions
/// between connected / disconnected are infrequent (user action).
pub struct AppState {
    pub sidecar: Mutex<Option<SidecarHandle>>,
}

#[tauri::command]
async fn ping(redis_url: String) -> Result<(), AppError> {
    redis_ping::ping(&redis_url).await
}

#[tauri::command]
async fn connect(
    app: tauri::AppHandle,
    redis_url: String,
    prefix: Option<String>,
    max_queues: Option<u32>,
    username: Option<String>,
    password: Option<String>,
    remember_password: Option<bool>,
) -> Result<ConnectResult, AppError> {
    let state = app.state::<AppState>();

    // Tear down any prior sidecar before spawning a new one. We hold the
    // mutex only long enough to take the handle so the slow `kill` doesn't
    // block other commands.
    let prior = {
        let mut guard = state.sidecar.lock().expect("sidecar mutex");
        guard.take()
    };
    if let Some(handle) = prior {
        handle.shutdown().await;
    }

    let manager = SidecarManager::new(app.clone());
    let handle = manager
        .spawn(
            redis_url,
            prefix,
            max_queues,
            username,
            password.clone(),
        )
        .await?;

    let mut result = ConnectResult {
        port: handle.port,
        queues: handle.queues,
        discovery_total: handle.discovery_total,
        discovery_capped: handle.discovery_capped,
        password_saved: None,
        password_save_error: None,
    };

    {
        let mut guard = state.sidecar.lock().expect("sidecar mutex");
        *guard = Some(handle);
    }

    // Persist the password to the OS keychain only AFTER a successful
    // connect — so we never save credentials that don't work. Surface the
    // outcome to the UI so it can warn the user when the keychain is
    // unavailable (headless Linux, user-denied macOS prompt), instead of
    // silently failing remember-password.
    if remember_password.unwrap_or(true) {
        match secrets::save_password(password.as_deref()) {
            Ok(()) => {
                result.password_saved = Some(true);
            }
            Err(e) => {
                log::warn!("could not persist password to keychain: {}", e.message);
                result.password_saved = Some(false);
                result.password_save_error = Some(format!("{}: {}", e.code, e.message));
            }
        }
    }

    Ok(result)
}

#[tauri::command]
async fn disconnect(app: tauri::AppHandle) -> Result<(), AppError> {
    let state = app.state::<AppState>();
    let handle = {
        let mut guard = state.sidecar.lock().expect("sidecar mutex");
        guard.take()
    };
    if let Some(handle) = handle {
        handle.shutdown().await;
    }
    Ok(())
}

/// Read the saved Redis password from the OS keychain. Called by the
/// onboarding flow on launch so auto-reconnect doesn't need the user to
/// retype. Returns an empty string when nothing is stored.
#[tauri::command]
fn load_saved_password() -> Result<Option<String>, AppError> {
    secrets::load_password()
}

/// Drop the saved Redis password from the OS keychain. Called when the
/// user clicks "Switch connection" so the next launch starts clean.
#[tauri::command]
fn clear_saved_password() -> Result<(), AppError> {
    secrets::save_password(None)
}

#[tauri::command]
fn get_status(state: tauri::State<'_, AppState>) -> ConnectionStatus {
    let guard = state.sidecar.lock().expect("sidecar mutex");
    match guard.as_ref() {
        Some(handle) => ConnectionStatus {
            connected: true,
            port: Some(handle.port),
            queues: Some(handle.queues),
        },
        None => ConnectionStatus::default(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                // Focus the existing window and emit an event the frontend can
                // use to re-process the launch (e.g. apply a deep link).
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                let _ = app.emit("workbench://second-instance", ());
            }))
            .plugin(tauri_plugin_updater::Builder::new().build());
    }

    builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(AppState {
            sidecar: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            ping,
            connect,
            disconnect,
            get_status,
            load_saved_password,
            clear_saved_password,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let RunEvent::ExitRequested { .. } = event {
                // Best-effort kill on quit. The handler is sync, so we use
                // `shutdown_blocking` which falls back to a one-shot block_on
                // if the async mutex is contended.
                let state = app.state::<AppState>();
                let taken = {
                    let mut guard = match state.sidecar.lock() {
                        Ok(g) => g,
                        Err(_) => return,
                    };
                    guard.take()
                };
                if let Some(handle) = taken {
                    handle.shutdown_blocking();
                }
            }
        });
}
