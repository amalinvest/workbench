use keyring::Entry;

use crate::AppError;

/// Service name registered with the OS credential store. Keep this stable —
/// changing it would orphan previously saved entries.
const SERVICE: &str = "dev.getworkbench.desktop";

/// Account key used for the single persisted Redis password. We support
/// exactly one saved connection in v1; if we ever add multi-connection
/// support, switch this to a hash of the URL (or the URL itself).
const ACCOUNT: &str = "redis-password";

/// Save (or overwrite) the password in the OS keychain. Pass `None` to
/// delete any existing entry — keeps the call sites flat ("save with no
/// password" == "clear it").
pub fn save_password(value: Option<&str>) -> Result<(), AppError> {
    let entry = Entry::new(SERVICE, ACCOUNT).map_err(map_err)?;
    match value {
        Some(secret) if !secret.is_empty() => entry.set_password(secret).map_err(map_err),
        _ => {
            // Idempotent delete: NoEntry is fine (user never had one stored).
            match entry.delete_credential() {
                Ok(()) => Ok(()),
                Err(keyring::Error::NoEntry) => Ok(()),
                Err(e) => Err(map_err(e)),
            }
        }
    }
}

/// Load the saved password. Returns `Ok(None)` when nothing is stored — this
/// is the common path during fresh launches and after `clear_password`.
pub fn load_password() -> Result<Option<String>, AppError> {
    let entry = Entry::new(SERVICE, ACCOUNT).map_err(map_err)?;
    match entry.get_password() {
        Ok(s) => Ok(Some(s)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(map_err(e)),
    }
}

fn map_err(e: keyring::Error) -> AppError {
    let code = match e {
        keyring::Error::NoEntry => "KEYCHAIN_MISS",
        keyring::Error::Ambiguous(_) => "KEYCHAIN_AMBIGUOUS",
        keyring::Error::PlatformFailure(_) => "KEYCHAIN_PLATFORM",
        keyring::Error::NoStorageAccess(_) => "KEYCHAIN_LOCKED",
        keyring::Error::BadEncoding(_) => "KEYCHAIN_ENCODING",
        keyring::Error::TooLong(_, _) => "KEYCHAIN_TOO_LONG",
        keyring::Error::Invalid(_, _) => "KEYCHAIN_INVALID",
        _ => "KEYCHAIN_UNKNOWN",
    };
    AppError::new(code, e.to_string())
}
