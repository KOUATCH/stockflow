# Graph Report - app  (2026-06-03)

## Corpus Check
- Corpus is ~48,014 words - fits in a single context window. You may not need a graph.

## Summary
- 348 nodes · 198 edges · 12 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Addsupplierstoitemmodal Confirmclose Handleclose Handlekeydown|Addsupplierstoitemmodal Confirmclose Handleclose Handlekeydown]]
- [[_COMMUNITY_Suppliereditform Generatesimplesku Handlegeneratesku Handlereset|Suppliereditform Generatesimplesku Handlegeneratesku Handlereset]]
- [[_COMMUNITY_Image Blue Dollar Sign|Image Blue Dollar Sign]]
- [[_COMMUNITY_Dashboardpage Dashboardsessionrecovery Isrecoverabledashboardsessionerror|Dashboardpage Dashboardsessionrecovery Isrecoverabledashboardsessionerror]]
- [[_COMMUNITY_Createtaxratepage Handlecreatetaxrate|Createtaxratepage Handlecreatetaxrate]]
- [[_COMMUNITY_Project Structure|Project Structure]]
- [[_COMMUNITY_Project Structure|Project Structure]]
- [[_COMMUNITY_Project Structure|Project Structure]]
- [[_COMMUNITY_Project Structure|Project Structure]]
- [[_COMMUNITY_Project Structure|Project Structure]]
- [[_COMMUNITY_Route Post|Route Post]]
- [[_COMMUNITY_Handlesubmit Localizedhref|Handlesubmit Localizedhref]]

## God Nodes (most connected - your core abstractions)
1. `Open Graph Image` - 4 edges
2. `Twitter Image` - 4 edges
3. `page()` - 2 edges
4. `Page()` - 2 edges
5. `Page()` - 2 edges
6. `page()` - 2 edges
7. `Page()` - 2 edges
8. `POST()` - 2 edges
9. `isRecoverableDashboardSessionError()` - 2 edges
10. `DashboardPage()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Open Graph Image` --semantically_similar_to--> `Twitter Image`  [INFERRED] [semantically similar]
  app/opengraph-image.png → app/twitter-image.png
- `Twitter Image` --references--> `Gonzaga Fit Savers Brand`  [EXTRACTED]
  app/twitter-image.png → app/opengraph-image.png
- `Twitter Image` --references--> `Social Preview Assets`  [EXTRACTED]
  app/twitter-image.png → app/opengraph-image.png
- `Twitter Image` --references--> `Blue Dollar Sign Mark`  [EXTRACTED]
  app/twitter-image.png → app/opengraph-image.png

## Hyperedges (group relationships)
- **Gonzaga Fit Savers Social Card Assets** — app_opengraph_image, app_twitter_image, app_gonzaga_fit_savers_brand, app_blue_dollar_mark [EXTRACTED 1.00]

## Communities

### Community 2 - "Addsupplierstoitemmodal Confirmclose Handleclose Handlekeydown"
Cohesion: 0.4
Nodes (2): handleClose(), handleKeyDown()

### Community 4 - "Suppliereditform Generatesimplesku Handlegeneratesku Handlereset"
Cohesion: 0.5
Nodes (2): generateSimpleSKU(), handleGenerateSKU()

### Community 5 - "Image Blue Dollar Sign"
Cohesion: 0.7
Nodes (5): Blue Dollar Sign Mark, Gonzaga Fit Savers Brand, Open Graph Image, Social Preview Assets, Twitter Image

### Community 6 - "Dashboardpage Dashboardsessionrecovery Isrecoverabledashboardsessionerror"
Cohesion: 0.67
Nodes (2): DashboardPage(), isRecoverableDashboardSessionError()

### Community 10 - "Createtaxratepage Handlecreatetaxrate"
Cohesion: 0.5
Nodes (1): CreateTaxRatePage()

### Community 11 - "Project Structure"
Cohesion: 0.67
Nodes (1): page()

### Community 12 - "Project Structure"
Cohesion: 0.67
Nodes (1): Page()

### Community 13 - "Project Structure"
Cohesion: 0.67
Nodes (1): Page()

### Community 14 - "Project Structure"
Cohesion: 0.67
Nodes (1): page()

### Community 15 - "Project Structure"
Cohesion: 0.67
Nodes (1): Page()

### Community 17 - "Route Post"
Cohesion: 0.67
Nodes (1): POST()

### Community 25 - "Handlesubmit Localizedhref"
Cohesion: 1.0
Nodes (2): handleSubmit(), localizedHref()

## Knowledge Gaps
- **Thin community `Addsupplierstoitemmodal Confirmclose Handleclose Handlekeydown`** (6 nodes): `AddSuppliersToItemModal.tsx`, `confirmClose()`, `handleClose()`, `handleKeyDown()`, `handleSubmit()`, `useDebounce()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Suppliereditform Generatesimplesku Handlegeneratesku Handlereset`** (5 nodes): `SupplierEditForm.tsx`, `cn()`, `generateSimpleSKU()`, `handleGenerateSKU()`, `handleReset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboardpage Dashboardsessionrecovery Isrecoverabledashboardsessionerror`** (4 nodes): `DashboardPage()`, `DashboardSessionRecovery()`, `isRecoverableDashboardSessionError()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Createtaxratepage Handlecreatetaxrate`** (4 nodes): `CreateTaxRatePage()`, `handleCreateTaxRate()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Structure`** (3 nodes): `page.tsx`, `page()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Structure`** (3 nodes): `page.tsx`, `page.tsx`, `Page()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Structure`** (3 nodes): `page.tsx`, `page.tsx`, `Page()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Structure`** (3 nodes): `page.tsx`, `page.tsx`, `page()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Structure`** (3 nodes): `page.tsx`, `page.tsx`, `Page()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Route Post`** (3 nodes): `route.ts`, `route.ts`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Handlesubmit Localizedhref`** (3 nodes): `handleSubmit()`, `localizedHref()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Createsupplier Deleteitemsupplierlink Deletesupplier Getrecentpoitemsforsupplier` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._