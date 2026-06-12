import assert from "node:assert/strict";
import test from "node:test";

import { scoreTenderMatch, type MatchProfile, type MatchTender } from "./score-tender";

const profile: MatchProfile = {
  services: ["digital transformation"],
  activities: ["Information technology"],
  industries: ["government"],
  targetGovernmentEntities: ["Digital Government Authority"],
  regions: ["Riyadh"],
  preferredKeywords: ["innovation"],
  excludedKeywords: ["construction"],
  preferredOpportunityTypes: ["Public tender"],
};

const tender: MatchTender = {
  titleArabic: "Digital transformation and innovation services",
  descriptionArabic: "Supporting government services",
  agencyNameArabic: "Digital Government Authority",
  activityNameArabic: "Information technology",
  classificationFieldArabic: null,
  executionRegionArabic: "Riyadh",
  tenderTypeNameArabic: "Public tender",
  submissionDeadline: new Date("2026-06-25T12:00:00.000Z"),
  detailEnrichmentStatus: "complete",
};

test("scores and explains a strong deterministic match", () => {
  const match = scoreTenderMatch(
    profile,
    tender,
    new Date("2026-06-12T12:00:00.000Z"),
  );

  assert.equal(match.score, 100);
  assert.equal(match.reasons.length, 6);
  assert.deepEqual(match.matchedTerms, [
    "innovation",
    "digital transformation",
    "government",
  ]);
});

test("strongly penalizes excluded terms", () => {
  const match = scoreTenderMatch(
    profile,
    { ...tender, titleArabic: `${tender.titleArabic} construction` },
    new Date("2026-06-12T12:00:00.000Z"),
  );

  assert.equal(match.score, 40);
  assert.match(match.concerns[0] ?? "", /Excluded terms found/);
});

test("does not invent a region match for an unenriched tender", () => {
  const match = scoreTenderMatch(profile, {
    ...tender,
    executionRegionArabic: null,
    detailEnrichmentStatus: "pending",
  });

  assert.equal(match.score, 90);
  assert.ok(match.concerns.includes("Region is unknown until public details are enriched."));
});

test("deadline urgency cannot create relevance by itself", () => {
  const match = scoreTenderMatch(
    {
      ...profile,
      services: [],
      activities: [],
      industries: [],
      targetGovernmentEntities: [],
      regions: [],
      preferredKeywords: [],
      preferredOpportunityTypes: [],
    },
    tender,
    new Date("2026-06-12T12:00:00.000Z"),
  );

  assert.equal(match.score, 0);
  assert.deepEqual(match.reasons, []);
});
