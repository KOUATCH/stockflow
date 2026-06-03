# Graph Report - hooks  (2026-06-03)

## Corpus Check
- 172 files · ~70,531 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 732 nodes · 725 edges · 28 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Usesessionmanagement Useorganizationsettings Usestocktransfer Usestorageconfiguration|Usesessionmanagement Useorganizationsettings Usestocktransfer Usestorageconfiguration]]
- [[_COMMUNITY_Bulkdeletepurchaseorders Getbasemutationoptions Handlemutationerror Useapprovepurchaseorder|Bulkdeletepurchaseorders Getbasemutationoptions Handlemutationerror Useapprovepurchaseorder]]
- [[_COMMUNITY_Useattendanceanalytics Useattendancereport Useclockin Useclockout|Useattendanceanalytics Useattendancereport Useclockin Useclockout]]
- [[_COMMUNITY_Useinventoryintegration Getactionerrormessage Useinventoryhooks Usecreateitem|Useinventoryintegration Getactionerrormessage Useinventoryhooks Usecreateitem]]
- [[_COMMUNITY_Actiondata Useactivesession Usecashdrawer Usecashdraweroperation|Actiondata Useactivesession Usecashdrawer Usecashdraweroperation]]
- [[_COMMUNITY_Findorganizationidindata Findsupplierorganizationid Iswrappedupdate Normalizedeleteinput|Findorganizationidindata Findsupplierorganizationid Iswrappedupdate Normalizedeleteinput]]
- [[_COMMUNITY_Tobriefitemsupplierdto Toitemsupplieractiondata Toitemsupplierdto Tonumberorundefined|Tobriefitemsupplierdto Toitemsupplieractiondata Toitemsupplierdto Tonumberorundefined]]
- [[_COMMUNITY_Useposhooks Useallcategoriesqueries Useallitemqueries Usealllocationsqueries|Useposhooks Useallcategoriesqueries Useallitemqueries Usealllocationsqueries]]
- [[_COMMUNITY_Findorganizationidindata Findsupplierorganizationid Iswrappedupdate Normalizedeleteinput|Findorganizationidindata Findsupplierorganizationid Iswrappedupdate Normalizedeleteinput]]
- [[_COMMUNITY_Uselocations Useactivelocations Useallorglocations Usebrieflocationsbyorgid|Uselocations Useactivelocations Useallorglocations Usebrieflocationsbyorgid]]
- [[_COMMUNITY_Getbasemutationoptions Usecompletesalesorder Usecreatesalesorder Usesalesactions|Getbasemutationoptions Usecompletesalesorder Usecreatesalesorder Usesalesactions]]
- [[_COMMUNITY_Useallcashdrawerhooks Useaddcashtodrawer Usecashdraweranalytics Usecashdrawerreport|Useallcashdrawerhooks Useaddcashtodrawer Usecashdraweranalytics Usecashdrawerreport]]
- [[_COMMUNITY_Use Mobile Useismobile|Use Mobile Useismobile]]
- [[_COMMUNITY_Invalidatebrandlists Useallorgbrands Usebrand Usebriefbrandsbyorgid|Invalidatebrandlists Useallorgbrands Usebrand Usebriefbrandsbyorgid]]
- [[_COMMUNITY_Invalidatecategorylists Useallorgcategories Usebriefcategoriesbyorgid Usecategory|Invalidatecategorylists Useallorgcategories Usebriefcategoriesbyorgid Usecategory]]
- [[_COMMUNITY_Useitemsuppliers Useadditemsuppliers Usecreateitemsupplier Useitemsuppliersbyitemid|Useitemsuppliers Useadditemsuppliers Usecreateitemsupplier Useitemsuppliersbyitemid]]
- [[_COMMUNITY_Useallorgtaxrates Usebrieftaxratesbyorgid Usecreatetaxrate Usedeletetaxrate|Useallorgtaxrates Usebrieftaxratesbyorgid Usecreatetaxrate Usedeletetaxrate]]
- [[_COMMUNITY_Useitems Useactiveproducts Useallproducts Useavailableproducts|Useitems Useactiveproducts Useallproducts Useavailableproducts]]
- [[_COMMUNITY_Useorganizations Usecreateorganization Usedeleteorganization Useoptimisticorganizations|Useorganizations Usecreateorganization Usedeleteorganization Useoptimisticorganizations]]
- [[_COMMUNITY_Useallorgunits Usebriefunitsbyorgid Usecreateunit Usedeleteunit|Useallorgunits Usebriefunitsbyorgid Usecreateunit Usedeleteunit]]
- [[_COMMUNITY_Usedebounced Usedeletesupplier Usesuppliersearch Usetogglesupplieractive|Usedebounced Usedeletesupplier Usesuppliersearch Usetogglesupplieractive]]
- [[_COMMUNITY_Itemapierror Constructor Useitemapicache Useitemapierror|Itemapierror Constructor Useitemapicache Useitemapierror]]
- [[_COMMUNITY_Useentitymutation Useupdatelocation Updatelocation|Useentitymutation Useupdatelocation Updatelocation]]
- [[_COMMUNITY_Cleardatabase Generatecredentialsfile Main Seed|Cleardatabase Generatecredentialsfile Main Seed]]
- [[_COMMUNITY_Toitemsupplierdto Tonumberorundefined Useupdateitemsupplier Useallitemsuppliers|Toitemsupplierdto Tonumberorundefined Useupdateitemsupplier Useallitemsuppliers]]
- [[_COMMUNITY_Useauth Usepurchaseordermodalworkflowaction|Useauth Usepurchaseordermodalworkflowaction]]
- [[_COMMUNITY_Useclientauth Useorgauth|Useclientauth Useorgauth]]
- [[_COMMUNITY_Use Query Queryprovider|Use Query Queryprovider]]

## God Nodes (most connected - your core abstractions)
1. `useNotifications()` - 64 edges
2. `usePurchaseOrderActions()` - 11 edges
3. `useIsMobile()` - 8 edges
4. `useAvailableProducts()` - 6 edges
5. `getBaseMutationOptions()` - 6 edges
6. `useItemSuppliers()` - 5 edges
7. `useCurrentPresenceStatus()` - 5 edges
8. `useCurrentPresenceStatus()` - 5 edges
9. `getBaseMutationOptions()` - 5 edges
10. `useSalesActions()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `useCreateOrganization()` --calls--> `useNotifications()`  [INFERRED]
  useOrganizations.ts → hooks\posSalesProcess\usePOSHooks.ts
- `useUpdateOrganization()` --calls--> `useNotifications()`  [INFERRED]
  useOrganizations.ts → hooks\posSalesProcess\usePOSHooks.ts
- `useDeleteOrganization()` --calls--> `useNotifications()`  [INFERRED]
  useOrganizations.ts → hooks\posSalesProcess\usePOSHooks.ts
- `useClockIn()` --calls--> `useNotifications()`  [INFERRED]
  usePresenceQueries2.ts → hooks\posSalesProcess\usePOSHooks.ts
- `useClockOut()` --calls--> `useNotifications()`  [INFERRED]
  usePresenceQueries2.ts → hooks\posSalesProcess\usePOSHooks.ts

## Communities

### Community 0 - "Usesessionmanagement Useorganizationsettings Usestocktransfer Usestorageconfiguration"
Cohesion: 0.03
Nodes (53): useCreateALocation(), useDeleteLocation(), useOrgLocationsNew(), useUpdateALocation(), useUpdateLocationBasicInfo(), useUpdateLocationOthers(), useArchiveManagedLocation(), useCreateManagedLocation() (+45 more)

### Community 1 - "Bulkdeletepurchaseorders Getbasemutationoptions Handlemutationerror Useapprovepurchaseorder"
Cohesion: 0.17
Nodes (14): getBaseMutationOptions(), useApprovePurchaseOrder(), useBulkDeletePurchaseOrders(), useBulkUpdatePurchaseOrderStatus(), useCancelPurchaseOrder(), useClosePurchaseOrder(), useCreatePurchaseOrder(), useDeletePurchaseOrder() (+6 more)

### Community 2 - "Useattendanceanalytics Useattendancereport Useclockin Useclockout"
Cohesion: 0.12
Nodes (13): useClockIn(), useClockOut(), useCreateSchedule(), useCurrentPresenceStatus(), useCurrentWorkDuration(), useEndBreak(), useGenerateAttendanceReport(), useIsOnBreak() (+5 more)

### Community 3 - "Useinventoryintegration Getactionerrormessage Useinventoryhooks Usecreateitem"
Cohesion: 0.14
Nodes (7): useInventoryHelpers(), useInventoryLevels(), useItems(), useReleaseInventory(), useReserveInventory(), useUpdateInventoryLevel(), useInventoryIntegration()

### Community 4 - "Actiondata Useactivesession Usecashdrawer Usecashdraweroperation"
Cohesion: 0.15
Nodes (6): actionData(), useActiveSession(), usePOSMetrics(), usePOSSession(), usePOSStation(), usePOSSummary()

### Community 5 - "Findorganizationidindata Findsupplierorganizationid Iswrappedupdate Normalizedeleteinput"
Cohesion: 0.2
Nodes (12): findOrganizationIdInData(), findSupplierOrganizationId(), isWrappedUpdate(), normalizeDeleteInput(), normalizeUpdateInput(), useAllOrgSuppliers(), useOrgSuppliers(), useSuppliersByOrgId() (+4 more)

### Community 6 - "Tobriefitemsupplierdto Toitemsupplieractiondata Toitemsupplierdto Tonumberorundefined"
Cohesion: 0.15
Nodes (3): toBriefItemSupplierDTO(), toItemSupplierDTO(), toNumberOrUndefined()

### Community 8 - "Useposhooks Useallcategoriesqueries Useallitemqueries Usealllocationsqueries"
Cohesion: 0.15
Nodes (2): usePosStations(), usePOSTerminals()

### Community 10 - "Findorganizationidindata Findsupplierorganizationid Iswrappedupdate Normalizedeleteinput"
Cohesion: 0.24
Nodes (9): findOrganizationIdInData(), findSupplierOrganizationId(), isWrappedUpdate(), normalizeDeleteInput(), normalizeUpdateInput(), useUpdateSupplier(), useUpdateSupplierBasicInfo(), useUpdateSupplierDetails() (+1 more)

### Community 13 - "Uselocations Useactivelocations Useallorglocations Usebrieflocationsbyorgid"
Cohesion: 0.25
Nodes (6): useActiveLocations(), useAllOrgLocations(), useBriefLocationsByOrgId(), useDefaultLocation(), useLocations(), useOrgLocations()

### Community 14 - "Getbasemutationoptions Usecompletesalesorder Usecreatesalesorder Usesalesactions"
Cohesion: 0.38
Nodes (6): getBaseMutationOptions(), useCompleteSalesOrder(), useCreateSalesOrder(), useSalesActions(), useUpdatePaymentStatus(), useUpdateSalesOrderStatus()

### Community 16 - "Useallcashdrawerhooks Useaddcashtodrawer Usecashdraweranalytics Usecashdrawerreport"
Cohesion: 0.24
Nodes (7): useAddCashToDrawer(), useCashDrawerAnalytics(), useCashDrawers(), useCashDrawerStatus(), useCreateCashDrawer(), useReconcileCashDrawer(), useRemoveCashFromDrawer()

### Community 19 - "Use Mobile Useismobile"
Cohesion: 0.22
Nodes (1): useIsMobile()

### Community 21 - "Invalidatebrandlists Useallorgbrands Usebrand Usebriefbrandsbyorgid"
Cohesion: 0.28
Nodes (3): useAllOrgBrands(), useBriefBrandsByOrgId(), useOrgBrands()

### Community 22 - "Invalidatecategorylists Useallorgcategories Usebriefcategoriesbyorgid Usecategory"
Cohesion: 0.28
Nodes (3): useAllOrgCategories(), useBriefCategoriesByOrgId(), useOrgCategories()

### Community 23 - "Useitemsuppliers Useadditemsuppliers Usecreateitemsupplier Useitemsuppliersbyitemid"
Cohesion: 0.33
Nodes (5): useItemSuppliers(), useItemSuppliersByItemId(), useItemWithSuppliers(), usePreferredSupplier(), useSuppliersByItem()

### Community 24 - "Useallorgtaxrates Usebrieftaxratesbyorgid Usecreatetaxrate Usedeletetaxrate"
Cohesion: 0.31
Nodes (5): useAllOrgTaxRates(), useBriefTaxRatesByOrgId(), useCreateTaxRate(), useNewTaxRate(), useOrgTaxRates()

### Community 27 - "Useitems Useactiveproducts Useallproducts Useavailableproducts"
Cohesion: 0.43
Nodes (6): useActiveProducts(), useAllProducts(), useAvailableProducts(), useProductsByCategory(), useProductSearch(), useProductsInStock()

### Community 28 - "Useorganizations Usecreateorganization Usedeleteorganization Useoptimisticorganizations"
Cohesion: 0.29
Nodes (5): useCreateOrganization(), useDeleteOrganization(), useOrganization(), useOrganizationStats(), useUpdateOrganization()

### Community 29 - "Useallorgunits Usebriefunitsbyorgid Usecreateunit Usedeleteunit"
Cohesion: 0.32
Nodes (3): useAllOrgUnits(), useBriefUnitsByOrgId(), useOrgUnits()

### Community 35 - "Usedebounced Usedeletesupplier Usesuppliersearch Usetogglesupplieractive"
Cohesion: 0.4
Nodes (2): useDebounced(), useSupplierSearch()

### Community 36 - "Itemapierror Constructor Useitemapicache Useitemapierror"
Cohesion: 0.33
Nodes (1): ItemAPIError

### Community 46 - "Useentitymutation Useupdatelocation Updatelocation"
Cohesion: 0.4
Nodes (2): useEntityMutation(), useUpdateLocation()

### Community 48 - "Cleardatabase Generatecredentialsfile Main Seed"
Cohesion: 0.83
Nodes (3): clearDatabase(), generateCredentialsFile(), main()

### Community 50 - "Toitemsupplierdto Tonumberorundefined Useupdateitemsupplier Useallitemsuppliers"
Cohesion: 0.67
Nodes (2): toItemSupplierDTO(), toNumberOrUndefined()

### Community 55 - "Useauth Usepurchaseordermodalworkflowaction"
Cohesion: 0.5
Nodes (2): usePurchaseOrderModalWorkflowAction(), useAuth()

### Community 56 - "Useclientauth Useorgauth"
Cohesion: 1.0
Nodes (2): useClientAuth(), useOrgAuth()

### Community 58 - "Use Query Queryprovider"
Cohesion: 0.67
Nodes (1): QueryProvider()

## Knowledge Gaps
- **Thin community `Useposhooks Useallcategoriesqueries Useallitemqueries Usealllocationsqueries`** (14 nodes): `usePOSHooks.ts`, `useAllCategoriesQueries()`, `useAllItemQueries()`, `useAllLocationsQueries()`, `useCashDrawer()`, `useCustomer()`, `useCustomers()`, `useIsMobile()`, `useItem()`, `usePOSStation()`, `usePosStations()`, `usePOSTerminals()`, `useRealTimeTracking()`, `useSessionManagement()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Use Mobile Useismobile`** (9 nodes): `use-mobile.tsx`, `use-mobile.ts`, `use-mobile.tsx`, `use-mobile.tsx`, `use-mobile.ts`, `use-mobile.tsx`, `use-mobile.tsx`, `use-mobile.ts`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Usedebounced Usedeletesupplier Usesuppliersearch Usetogglesupplieractive`** (6 nodes): `useDebounced()`, `useDeleteSupplier()`, `useSupplierSearch()`, `useToggleSupplierActive()`, `useUpsertSupplier()`, `supplierSystemHooks.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Itemapierror Constructor Useitemapicache Useitemapierror`** (6 nodes): `ItemAPIError`, `.constructor()`, `useItemAPICache()`, `useItemAPIError()`, `useItemAPIPrefetch()`, `use-item-api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Useentitymutation Useupdatelocation Updatelocation`** (5 nodes): `useEntityMutation.ts`, `useEntityMutation()`, `useUpdateLocation.ts`, `updateLocation()`, `useUpdateLocation()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Toitemsupplierdto Tonumberorundefined Useupdateitemsupplier Useallitemsuppliers`** (4 nodes): `toItemSupplierDTO()`, `toNumberOrUndefined()`, `useUpdateItemSupplier()`, `useAllItemSuppliers.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Useauth Usepurchaseordermodalworkflowaction`** (4 nodes): `useAuth.ts`, `usePurchaseOrderModalWorkflowAction.ts`, `usePurchaseOrderModalWorkflowAction()`, `useAuth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Useclientauth Useorgauth`** (3 nodes): `useClientAuth.ts`, `useClientAuth()`, `useOrgAuth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Use Query Queryprovider`** (3 nodes): `use-query.tsx`, `use-query.tsx`, `QueryProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useNotifications()` connect `Usesessionmanagement Useorganizationsettings Usestocktransfer Usestorageconfiguration` to `Useattendanceanalytics Useattendancereport Useclockin Useclockout`, `Useposhooks Useallcategoriesqueries Useallitemqueries Usealllocationsqueries`, `Useallcashdrawerhooks Useaddcashtodrawer Usecashdraweranalytics Usecashdrawerreport`, `Useauth Usepurchaseordermodalworkflowaction`, `Useorganizations Usecreateorganization Usedeleteorganization Useoptimisticorganizations`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `usePurchaseOrderModalWorkflowAction()` connect `Useauth Usepurchaseordermodalworkflowaction` to `Usesessionmanagement Useorganizationsettings Usestocktransfer Usestorageconfiguration`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 63 inferred relationships involving `useNotifications()` (e.g. with `useOrgLocationsNew()` and `useCreateALocation()`) actually correct?**
  _`useNotifications()` has 63 INFERRED edges - model-reasoned connections that need verification._
- **Should `Usesessionmanagement Useorganizationsettings Usestocktransfer Usestorageconfiguration` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Useattendanceanalytics Useattendancereport Useclockin Useclockout` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Useinventoryintegration Getactionerrormessage Useinventoryhooks Usecreateitem` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Usepayments Usecreatepayment Usecreaterefund Useorderpayments` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._