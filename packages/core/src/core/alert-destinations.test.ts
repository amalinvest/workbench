import { describe, expect, test } from "bun:test";
import {
  formatSlackPayload,
  isSlackIncomingWebhookUrl,
  validateContactPointUrl,
} from "./alert-destinations";
import type { AlertContactPoint, AlertEvent } from "./types";

const slackCp: AlertContactPoint = {
  id: "cp-1",
  name: "Slack #ops",
  preset: "slack",
  url: "https://hooks.slack.com/services/T000/B000/XXXXXXXX",
  enabled: true,
  createdAt: 0,
  updatedAt: 0,
};

const sampleEvent: AlertEvent = {
  id: "evt-1",
  ruleId: "rule-1",
  ruleName: "Job failed",
  trigger: "job_failed",
  severity: "warning",
  status: "firing",
  fingerprint: "fp-1",
  queue: "email",
  jobId: "42",
  jobName: "sendReceipt",
  message: "Job sendReceipt failed in email",
  failedReason: "SMTP timeout",
  firedAt: Date.now(),
};

describe("isSlackIncomingWebhookUrl", () => {
  test("accepts standard Slack webhook URLs", () => {
    expect(
      isSlackIncomingWebhookUrl(
        "https://hooks.slack.com/services/T000/B000/XXXXXXXX",
      ),
    ).toBe(true);
  });

  test("accepts GovSlack webhook URLs", () => {
    expect(
      isSlackIncomingWebhookUrl(
        "https://hooks.slack-gov.com/services/T000/B000/XXXXXXXX",
      ),
    ).toBe(true);
  });

  test("rejects non-Slack URLs", () => {
    expect(isSlackIncomingWebhookUrl("https://example.com/webhook")).toBe(
      false,
    );
  });
});

describe("validateContactPointUrl", () => {
  test("requires Slack webhook host for slack preset", () => {
    expect(
      validateContactPointUrl("slack", "https://example.com/hook"),
    ).toContain("incoming webhook");
  });

  test("allows generic https URLs for webhook preset", () => {
    expect(
      validateContactPointUrl("webhook", "https://example.com/hook"),
    ).toBeUndefined();
  });
});

describe("formatSlackPayload", () => {
  test("includes required text fallback and Block Kit blocks", () => {
    const { url, headers, body } = formatSlackPayload(slackCp, sampleEvent);

    expect(url).toBe(slackCp.url);
    expect(headers["Content-Type"]).toBe("application/json");

    const payload = body as {
      text: string;
      blocks: Array<{ type: string }>;
    };
    expect(payload.text).toContain("Job failed");
    expect(payload.blocks.some((b) => b.type === "header")).toBe(true);
    expect(payload.blocks.some((b) => b.type === "section")).toBe(true);
  });

  test("uses a button for https dashboard links", () => {
    const { body } = formatSlackPayload(
      slackCp,
      sampleEvent,
      "https://jobs.example.com/jobs",
    );
    const payload = body as { blocks: Array<{ type: string }> };
    expect(payload.blocks.some((b) => b.type === "actions")).toBe(true);
  });

  test("uses a text link for http dev dashboard URLs", () => {
    const { body } = formatSlackPayload(
      slackCp,
      sampleEvent,
      "http://localhost:3010/jobs",
    );
    const payload = body as {
      blocks: Array<{ type: string; elements?: unknown[] }>;
    };
    expect(payload.blocks.some((b) => b.type === "actions")).toBe(false);
    const context = payload.blocks.find((b) => b.type === "context");
    expect(context?.elements).toBeDefined();
  });
});
