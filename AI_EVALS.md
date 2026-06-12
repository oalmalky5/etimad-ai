# Milestone 7 AI Evaluation Checklist

AI evaluation checks whether a model output follows the product contract. It is
different from normal code testing because a structurally valid answer can
still be factually wrong or unhelpful.

## Evaluation Set

Manually generate summaries for approximately 10 representative tenders:

1. An enriched tender with a clear description and deadline.
2. An unenriched tender with list-page data only.
3. A tender with no public submission deadline.
4. A tender with several important public dates.
5. A tender with guarantee or insurance requirements.
6. A tender with local-content requirements.
7. A tender with public attachment names.
8. A tender clearly relevant to the current company profile.
9. A tender clearly irrelevant to the current company profile.
10. A tender with confusing, sparse, or duplicated source fields.

Do not generate all ten automatically. Manual generation keeps API spending
intentional during development.

Generate and store one evaluation summary by reference number:

```bash
npm run ai:evaluate -- 260639003513
```

The command prints the structured output, deterministic checks, token usage,
and estimated cost. It makes one paid API request.

## Review Each Output

- Every factual statement is supported by stored tender or profile data.
- Missing details are identified instead of invented.
- Dates and requirements match the tender detail page.
- Fee and cost labels are not converted into unsupported payment instructions.
- General due-diligence questions are not mislabeled as confirmed missing data.
- Fit notes discuss relevance only, not eligibility or winning probability.
- An unenriched tender clearly communicates its limitations.
- An absent company profile produces no fit notes.
- Questions and next actions are useful without pretending to know hidden
  tender-document requirements.
- The structured output is complete and readable.

## Deterministic Checks

`src/lib/ai/evaluate-tender-summary.ts` checks schema validity, obvious
eligibility overclaims, fit notes without a profile, and missing-data honesty.
These checks catch repeatable contract violations. Human review remains
necessary for factual accuracy and usefulness.

## Evaluation Run Log

### 2026-06-12 — Tender 260639003513

- First request exposed a schema mismatch: the model returned more requirement
  items than local validation allowed. The response was rejected and not stored.
- Prompt `v1` passed deterministic checks and cost an estimated `$0.003504`,
  but human review found unsupported payment instructions and overly broad
  missing-information claims.
- The first prompt `v2` request ended mid-JSON at the output-token limit. It was
  rejected and not stored.
- The corrected prompt `v2` response passed deterministic checks and cost an
  estimated `$0.002562`. Riyadh dates and fee wording improved, but human review
  still found unsupported document-download advice and inferred missing fields.
- Prompt `v3` now receives an application-derived `knownMissingInformation`
  list and tighter action rules. It has not made a paid API request yet.

This run demonstrates why deterministic checks are useful but cannot replace
human evaluation.
