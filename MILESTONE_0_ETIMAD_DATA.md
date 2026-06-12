# Milestone 0 - Etimad Data Access Investigation

Investigation date: 2026-06-12

## Decision

Etimad tender data can currently be collected from Etimad's public visitor
pages without logging in.

The best initial ingestion path is:

1. Use Etimad's public JSON visitor endpoint to discover and monitor tenders.
2. Fetch public tender detail pages only for new or changed tenders.
3. Parse the detail page and its public detail components into structured data.
4. Keep the original Etimad reference number and source URL for attribution.
5. Ask Etimad/NCGR for written confirmation before running this ingestion in
   production or offering it to clients.

This is technically closer to consuming undocumented public endpoints than
scraping rendered tender cards. It is still not a documented or guaranteed
public API, so it must be treated as an unstable external integration.

## Confirmed Public Sources

Base URL:

```text
https://tenders.etimad.sa
```

### Tender List

```text
GET /Tender/AllSupplierTendersForVisitorAsync
```

Example for currently active tenders published in the last three months:

```text
/Tender/AllSupplierTendersForVisitorAsync?PageSize=24&PublishDateId=5&TenderCategory=2&PageNumber=1
```

Confirmed response shape

```json
{
  "data": [],
  "totalCount": 1196,
  "pageSize": 24,
  "queryString": null,
  "currentPage": 1
}
```

The `totalCount` value is live and will change. On 2026-06-12, the active
tender query returned 1,196 records.

The visitor UI offers page sizes up to 24. Sending a larger page size still
returned only 24 records, so ingestion should use 24 records per page.

### Tender Details

The list response contains an opaque `tenderIdString` used by public detail
pages:

```text
GET /Tender/DetailsForVisitor?STenderId={tenderIdString}
```

Additional public detail components:

```text
GET /Tender/GetTenderDatesViewComponenet?tenderIdStr={tenderIdString}
GET /Tender/GetRelationsDetailsViewComponenet?tenderIdStr={tenderIdString}
GET /Tender/GetAttachmentsViewComponenet?tenderIdStr={tenderIdString}
GET /Tender/GetLocalContentDetailsViewComponenet?tenderIdStr={tenderIdString}
GET /Tender/GetAwardingTenderGroupsForVisitorViewComponent?tenderIdStr={tenderIdString}
GET /Tender/GetAwardingResultsForVisitorViewComponenet?tenderIdStr={tenderIdString}
```

These endpoints return HTML fragments rather than JSON. They can be parsed,
but their markup may change without notice.

### Lookups

```text
GET /Tender/GetAreasAsync
GET /Tender/GetMainActivitiesAsync
GET /Tender/GetSubActivitiesAsync?mainAcivityId={activityId}
GET /Tender/GetAllAgenciesAsync
GET /Qualification/GetTenderTypes
```

Confirmed on 2026-06-12:

- 13 regions
- 21 main activities
- 1,772 agency records

## Confirmed List Fields

The list endpoint currently exposes:

```text
tenderId
tenderIdString
referenceNumber
tenderNumber
tenderName
agencyCode
agencyName
branchId
branchName
tenderStatusId
tenderStatusIdString
tenderStatusName
tenderTypeId
tenderTypeName
tenderActivityId
tenderActivityName
submitionDate
lastEnqueriesDate
lastOfferPresentationDate
offersOpeningDate
condetionalBookletPrice
financialFees
invitationCost
buyingCost
hasInvitations
remainingDays
remainingHours
remainingMins
isUGRP
ugrpRfxUrl
```

Some fields are frequently null or contain placeholder values. We should store
raw source data alongside normalized fields during early development.

## Confirmed Detail Fields

Public detail pages and components can expose:

- tender purpose/description
- contract duration
- tender document price
- tender status
- submission method
- initial guarantee requirement
- insurance requirement
- last enquiry date
- last offer submission date and time
- offer opening date
- expected award date
- expected work/service start date
- question and clarification period
- contractor classification requirement
- execution country, region, and city
- tender activity
- whether supply, construction, or maintenance work is included
- local-content mechanisms
- public attachments, when present
- public award information, when present

The exact fields available vary by tender.

## Confirmed Search Filters

Etimad's public visitor endpoint supports filters used by its own UI:

- keyword/multiple search
- tender status/category
- region
- main activity
- sub-activity
- reference number
- tender number
- tender type
- government agency
- tender document price range
- publication date range preset
- offer submission deadline range
- sorting by publication or offer-opening date

## Language Finding

Setting Etimad's language cookie to `en-US` did not translate tender names,
agency names, tender types, or activities in the JSON response. Tender source
data should therefore be treated as Arabic-first.

The product can remain English-first, but English tender content will require
our own translation layer and must preserve the original Arabic text.

## Access Constraints and Risks

### Undocumented Integration

The visitor endpoints are public and unauthenticated, but no official API
documentation or service-level guarantee was found during this investigation.
Etimad may rename, restrict, or remove them.

### Rate Limiting

Responses include rate-limit headers. Observed responses indicated a
per-minute window and approximately 20 available requests in that window.
This is an inference from the headers, not published documentation.

The ingestion worker must:

- use a conservative request rate
- honor rate-limit headers
- retry with exponential backoff
- avoid repeatedly fetching unchanged tender details
- stop and alert on access-denied or markup-change responses

### Terms and Permission

Etimad links to a usage/disclaimer policy, but that policy redirected to login
during the investigation. No useful `robots.txt` policy was exposed.

Public visibility does not automatically mean unrestricted automated
commercial reuse. Before production use, Catalyft should contact Etimad or the
National Center for Government Resources Systems to:

- ask whether these public endpoints may be consumed automatically
- request official API or integration access
- confirm attribution and redistribution requirements
- confirm acceptable polling frequency

Until then, this integration should be used only for local development and a
limited internal proof of concept.

### External/Legacy Records

The list model includes `isUGRP` and `ugrpRfxUrl`, indicating that some records
may link to another procurement system. The linked legacy competition system
also presented an expired TLS certificate during this investigation.

The first ingestion version should flag external records instead of assuming
all tender details are available through the normal visitor detail page.

## Recommended Ingestion Design

### Phase 0A - Local Proof

Build a small read-only importer that:

1. Fetches active tender list pages at a conservative rate.
2. Saves the raw JSON response.
3. Normalizes list fields into tender records.
4. Upserts records using `referenceNumber` as the stable business identifier.
5. Records `source_tender_id`, `tenderIdString`, and source URL.
6. Produces an import summary without fetching every detail page.

This is enough to unblock the tender browser.

### Phase 0B - Detail Enrichment

For only new or changed tenders:

1. Fetch the public detail page.
2. Fetch the relevant public detail components.
3. Parse and normalize the available detail fields.
4. Store the raw source snapshot for debugging.
5. Mark missing fields as unknown rather than empty or false.

### Phase 0C - Continuous Monitoring

After manual matching works:

1. Poll the active-tender list on a schedule.
2. Detect new records and meaningful updates.
3. Enrich changed records.
4. Re-run matching only for affected tenders and companies.
5. Create notifications after matching thresholds are met.

## Schema Implications

The roadmap's initial tender schema needs to account for real Etimad data.
Important additions include:

```text
reference_number
tender_number
source_tender_id
source_tender_id_string
source_url
source_system
source_payload
title_ar
description_ar
agency_name_ar
branch_name_ar
tender_type_id
tender_type_name_ar
tender_status_id
activity_id
activity_name_ar
published_at
enquiries_deadline
submission_deadline
offers_opening_at
document_price
financial_fees
invitation_cost
contract_duration
execution_regions
execution_cities
initial_guarantee_required
insurance_required
last_seen_at
source_updated_at
ingestion_status
```

English translations should be stored separately from original source fields.

## What Milestone 0 Proved

- Real Etimad tender data is accessible without fabricated sample data.
- A structured public JSON source exists for discovery and monitoring.
- Active tender filtering is possible.
- Public details are rich enough to support an initial tender browser.
- Public details may later support basic relevance, eligibility, and readiness
  analysis.
- English tender data is not natively provided by changing the language cookie.
- Production automation still requires permission review and resilient parsing.

## Remaining Milestone 0 Questions

These do not block the local proof of concept:

- Can Etimad/NCGR provide documented API or integration access?
- What automated polling frequency is explicitly permitted?
- Are tender attachments consistently public and downloadable?
- How often do existing tender records change after publication?
- Which records use external/UGRP detail URLs?
- Are historical records older than the visitor UI's date presets accessible?

## Milestone 0 Completion Recommendation

The investigation portion of Milestone 0 is complete.

Before Milestone 1, the next implementation task should be a narrowly scoped
local ingestion proof that imports active list records from the public JSON
endpoint. It should not yet fetch every tender detail, run continuously, or
send notifications.
