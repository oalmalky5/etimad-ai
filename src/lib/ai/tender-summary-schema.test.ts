import assert from "node:assert/strict";
import test from "node:test";

import {
  estimateOpenAiCostUsd,
  extractResponseText,
  generateTenderSummary,
} from "./generate-tender-summary";
import { tenderAiSummarySchema } from "./tender-summary-schema";

const validSummary = {
  summary: "A concise summary.",
  requirements: [],
  deadlineNotes: [],
  risks: [],
  fitNotes: [],
  questionsToAsk: [],
  nextActions: [],
  missingInformation: ["The submission deadline is not publicly provided."],
};

test("validates the complete structured summary contract", () => {
  assert.equal(tenderAiSummarySchema.parse(validSummary).summary, validSummary.summary);
});

test("rejects a summary that omits missing-information reporting", () => {
  const incompleteSummary = { ...validSummary } as Partial<typeof validSummary>;
  delete incompleteSummary.missingInformation;

  assert.equal(tenderAiSummarySchema.safeParse(incompleteSummary).success, false);
});

test("extracts output text from a Responses API payload", () => {
  const text = extractResponseText({
    output: [{ content: [{ type: "output_text", text: JSON.stringify(validSummary) }] }],
  });

  assert.equal(text, JSON.stringify(validSummary));
});

test("estimates standard gpt-5-mini token cost", () => {
  assert.equal(estimateOpenAiCostUsd("gpt-5-mini", 1_000_000, 1_000_000), 2.25);
  assert.equal(estimateOpenAiCostUsd("custom-model", 1_000, 1_000), null);
});

test("fails before an API request when no OpenAI key is configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  await assert.rejects(
    generateTenderSummary({}),
    /OPENAI_API_KEY is not configured/,
  );

  if (previousKey) {
    process.env.OPENAI_API_KEY = previousKey;
  }
});
