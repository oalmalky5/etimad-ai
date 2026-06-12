import assert from "node:assert/strict";
import test from "node:test";

import { buildTenderSummaryContext } from "./tender-summary-context";

test("serializes normalized tender fields without raw source payloads", () => {
  const context = buildTenderSummaryContext(
    {
      referenceNumber: "REF-1",
      tenderNumber: null,
      sourceUrl: "https://example.com/tender",
      titleArabic: "عنوان",
      titleEnglish: null,
      descriptionArabic: null,
      descriptionEnglish: null,
      agencyNameArabic: "جهة",
      branchNameArabic: null,
      tenderTypeNameArabic: "منافسة عامة",
      tenderStatusNameArabic: null,
      activityNameArabic: null,
      classificationFieldArabic: null,
      executionRegionArabic: null,
      executionCityArabic: null,
      executionDetailsArabic: null,
      publishedAt: new Date("2026-06-12T10:00:00.000Z"),
      enquiriesDeadline: null,
      submissionDeadline: null,
      offersOpeningAt: null,
      expectedAwardAt: null,
      workStartsAt: null,
      contractDurationArabic: null,
      submissionMethodArabic: null,
      documentPrice: null,
      financialFees: null,
      invitationCost: null,
      initialGuaranteeRequired: null,
      finalGuaranteePercentage: null,
      insuranceRequired: null,
      localContentRequirementsArabic: null,
      detailEnrichmentStatus: "pending",
      detailsEnrichedAt: null,
      attachments: [{ nameArabic: "مرفق عام" }],
    },
    null,
  );

  assert.equal(context.companyProfile, null);
  assert.equal(context.tender.publishedAt, "2026-06-12T13:00:00+03:00");
  assert.deepEqual(context.tender.publicAttachmentNamesArabic, ["مرفق عام"]);
  assert.equal("sourcePayload" in context.tender, false);
  assert.deepEqual(context.knownMissingInformation, [
    "Purchased tender-document contents are unavailable.",
    "Public tender details have not been enriched.",
    "No public tender description is stored.",
    "The enquiries deadline is not publicly provided.",
    "The submission deadline is not publicly provided.",
    "The offers-opening date is not publicly provided.",
    "The expected-award date is not publicly provided.",
    "The expected work-start date is not publicly provided.",
  ]);
});
