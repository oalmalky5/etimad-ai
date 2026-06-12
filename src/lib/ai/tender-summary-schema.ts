import { z } from "zod";

const conciseText = z.string().trim().min(1).max(2_000);
const conciseList = z.array(conciseText).max(8);

export const tenderAiSummarySchema = z.object({
  summary: conciseText,
  requirements: conciseList,
  deadlineNotes: conciseList,
  risks: conciseList,
  fitNotes: conciseList,
  questionsToAsk: conciseList,
  nextActions: conciseList,
  missingInformation: conciseList,
});

export type TenderAiSummaryContent = z.infer<typeof tenderAiSummarySchema>;

const stringArraySchema = {
  type: "array",
  maxItems: 8,
  items: { type: "string" },
} as const;

export const tenderAiSummaryJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    requirements: stringArraySchema,
    deadlineNotes: stringArraySchema,
    risks: stringArraySchema,
    fitNotes: stringArraySchema,
    questionsToAsk: stringArraySchema,
    nextActions: stringArraySchema,
    missingInformation: stringArraySchema,
  },
  required: [
    "summary",
    "requirements",
    "deadlineNotes",
    "risks",
    "fitNotes",
    "questionsToAsk",
    "nextActions",
    "missingInformation",
  ],
} as const;
