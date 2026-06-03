# Graph Report - _legacy-dashboard  (2026-06-03)

## Corpus Check
- Large corpus: 275 files · ~185,786 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 776 nodes · 542 edges · 23 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Formatcurrency Formatdate Getstatusbadge Enhanced|Formatcurrency Formatdate Getstatusbadge Enhanced]]
- [[_COMMUNITY_Additemtoorder Addnewitem Fetchavailableproducts Fetchpurchaseorder|Additemtoorder Addnewitem Fetchavailableproducts Fetchpurchaseorder]]
- [[_COMMUNITY_Formatcurrency Formatdate Enhanced Columns|Formatcurrency Formatdate Enhanced Columns]]
- [[_COMMUNITY_Enhanced Columns Formatcurrency Formatdate|Enhanced Columns Formatcurrency Formatdate]]
- [[_COMMUNITY_Addbudgetcategory Budgetmanagementpage Getbudgetsummary Getstatusbadge|Addbudgetcategory Budgetmanagementpage Getbudgetsummary Getstatusbadge]]
- [[_COMMUNITY_Addlineitem Calculatetotals Handleapproveentry Handlecreateentry|Addlineitem Calculatetotals Handleapproveentry Handlecreateentry]]
- [[_COMMUNITY_Copydigitalreceiptlink Formatcurrency Formatdate Generateqrcode|Copydigitalreceiptlink Formatcurrency Formatdate Generateqrcode]]
- [[_COMMUNITY_Addsupplierstoitemmodal Confirmclose Handleclose Handlekeydown|Addsupplierstoitemmodal Confirmclose Handleclose Handlekeydown]]
- [[_COMMUNITY_Suppliereditform Generatesimplesku Handlegeneratesku Handlereset|Suppliereditform Generatesimplesku Handlegeneratesku Handlereset]]
- [[_COMMUNITY_Itemspage Tonumberparam Tostringparam|Itemspage Tonumberparam Tostringparam]]
- [[_COMMUNITY_Formatcurrency Formatdate Getpaymentbadge Getstatusbadge|Formatcurrency Formatdate Getpaymentbadge Getstatusbadge]]
- [[_COMMUNITY_Dashboardpage Dashboardsessionrecovery Isrecoverabledashboardsessionerror|Dashboardpage Dashboardsessionrecovery Isrecoverabledashboardsessionerror]]
- [[_COMMUNITY_Item Performance Report Formatcurrency|Item Performance Report Formatcurrency]]
- [[_COMMUNITY_Createtaxratepage Handlecreatetaxrate|Createtaxratepage Handlecreatetaxrate]]
- [[_COMMUNITY_Currentstockpage Tonumberparam Tostringparam|Currentstockpage Tonumberparam Tostringparam]]
- [[_COMMUNITY_Secondpagefo Itemspage Tonumberparam Tostringparam|Secondpagefo Itemspage Tonumberparam Tostringparam]]
- [[_COMMUNITY_Purchaseorderspage Tonumberparam Tostringparam|Purchaseorderspage Tonumberparam Tostringparam]]
- [[_COMMUNITY_Loading|Loading]]
- [[_COMMUNITY_Project Structure|Project Structure]]
- [[_COMMUNITY_Oldpage Newitempage|Oldpage Newitempage]]
- [[_COMMUNITY_Basicz Infox Tabq Fetchdata|Basicz Infox Tabq Fetchdata]]
- [[_COMMUNITY_Movementspage|Movementspage]]
- [[_COMMUNITY_Transferspage|Transferspage]]

## God Nodes (most connected - your core abstractions)
1. `formatDate()` - 6 edges
2. `ItemsPage()` - 4 edges
3. `formatCurrency()` - 4 edges
4. `ItemsPage()` - 3 edges
5. `PurchaseOrdersPage()` - 3 edges
6. `loadData()` - 3 edges
7. `isRecoverableDashboardSessionError()` - 2 edges
8. `DashboardPage()` - 2 edges
9. `getStockStatusBadge()` - 2 edges
10. `getTrendIcon()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `getStatusBadge()` --calls--> `getPriorityBadge()`  [INFERRED]
  dashboard\purchases\orders\[id]\page.tsx → dashboard\app\purchases\orders\enhanced-columns.tsx
- `getStatusBadge()` --calls--> `getPaymentStatusBadge()`  [INFERRED]
  dashboard\purchases\suppliers\[id]\purchase-history\enhanced-columns.tsx → dashboard\purchases\suppliers\[id]\financial\page.tsx

## Communities

### Community 0 - "Formatcurrency Formatdate Getstatusbadge Enhanced"
Cohesion: 0.06
Nodes (4): formatCurrency(), formatDate(), getStatusBadge(), getPriorityBadge()

### Community 1 - "Additemtoorder Addnewitem Fetchavailableproducts Fetchpurchaseorder"
Cohesion: 0.15
Nodes (9): addItemToOrder(), addNewItem(), fetchAvailableProducts(), fetchPurchaseOrder(), handleSave(), loadData(), removeItem(), removeItemFromOrder() (+1 more)

### Community 2 - "Formatcurrency Formatdate Enhanced Columns"
Cohesion: 0.12
Nodes (4): FinancialPage(), formatCurrency(), getPaymentStatusBadge(), getStatusBadge()

### Community 3 - "Enhanced Columns Formatcurrency Formatdate"
Cohesion: 0.18
Nodes (2): formatCurrency(), formatDate()

### Community 6 - "Addbudgetcategory Budgetmanagementpage Getbudgetsummary Getstatusbadge"
Cohesion: 0.22
Nodes (2): getStatusBadge(), getVarianceBadge()

### Community 9 - "Addlineitem Calculatetotals Handleapproveentry Handlecreateentry"
Cohesion: 0.25
Nodes (2): calculateTotals(), handleCreateEntry()

### Community 17 - "Copydigitalreceiptlink Formatcurrency Formatdate Generateqrcode"
Cohesion: 0.33
Nodes (2): formatCurrency(), handleWhatsAppShare()

### Community 25 - "Addsupplierstoitemmodal Confirmclose Handleclose Handlekeydown"
Cohesion: 0.4
Nodes (2): handleClose(), handleKeyDown()

### Community 32 - "Suppliereditform Generatesimplesku Handlegeneratesku Handlereset"
Cohesion: 0.5
Nodes (2): generateSimpleSKU(), handleGenerateSKU()

### Community 33 - "Itemspage Tonumberparam Tostringparam"
Cohesion: 0.6
Nodes (3): ItemsPage(), toNumberParam(), toStringParam()

### Community 37 - "Formatcurrency Formatdate Getpaymentbadge Getstatusbadge"
Cohesion: 0.5
Nodes (2): getPaymentBadge(), getStatusBadge()

### Community 39 - "Dashboardpage Dashboardsessionrecovery Isrecoverabledashboardsessionerror"
Cohesion: 0.67
Nodes (2): DashboardPage(), isRecoverableDashboardSessionError()

### Community 41 - "Item Performance Report Formatcurrency"
Cohesion: 0.67
Nodes (2): getStockStatusBadge(), getTrendIcon()

### Community 45 - "Createtaxratepage Handlecreatetaxrate"
Cohesion: 0.5
Nodes (1): CreateTaxRatePage()

### Community 49 - "Currentstockpage Tonumberparam Tostringparam"
Cohesion: 0.67
Nodes (2): CurrentStockPage(), toStringParam()

### Community 51 - "Secondpagefo Itemspage Tonumberparam Tostringparam"
Cohesion: 0.83
Nodes (3): ItemsPage(), toNumberParam(), toStringParam()

### Community 52 - "Purchaseorderspage Tonumberparam Tostringparam"
Cohesion: 0.83
Nodes (3): PurchaseOrdersPage(), toNumberParam(), toStringParam()

### Community 62 - "Loading"
Cohesion: 0.67
Nodes (1): Loading()

### Community 63 - "Project Structure"
Cohesion: 0.67
Nodes (1): page()

### Community 66 - "Oldpage Newitempage"
Cohesion: 0.67
Nodes (1): NewItemPage()

### Community 69 - "Basicz Infox Tabq Fetchdata"
Cohesion: 0.67
Nodes (1): fetchData()

### Community 71 - "Movementspage"
Cohesion: 0.67
Nodes (1): MovementsPage()

### Community 73 - "Transferspage"
Cohesion: 0.67
Nodes (1): TransfersPage()

## Knowledge Gaps
- **Thin community `Enhanced Columns Formatcurrency Formatdate`** (12 nodes): `formatCurrency()`, `formatDate()`, `getCustomerStatus()`, `getCustomerTier()`, `getStatusColor()`, `getStatusIcon()`, `getTierColor()`, `getTierIcon()`, `handleCopyEmail()`, `handleCopyId()`, `enhanced-columns.tsx`, `enhanced-columns.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Addbudgetcategory Budgetmanagementpage Getbudgetsummary Getstatusbadge`** (10 nodes): `addBudgetCategory()`, `BudgetManagementPage()`, `getBudgetSummary()`, `getStatusBadge()`, `getVarianceBadge()`, `handleApproveBudget()`, `handleCreateBudget()`, `removeBudgetCategory()`, `updateBudgetCategory()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Addlineitem Calculatetotals Handleapproveentry Handlecreateentry`** (9 nodes): `page.tsx`, `addLineItem()`, `calculateTotals()`, `handleApproveEntry()`, `handleCreateEntry()`, `handlePostEntry()`, `JournalEntriesPage()`, `removeLineItem()`, `updateLineItem()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Copydigitalreceiptlink Formatcurrency Formatdate Generateqrcode`** (7 nodes): `page.tsx`, `copyDigitalReceiptLink()`, `formatCurrency()`, `formatDate()`, `generateQRCode()`, `handlePrint()`, `handleWhatsAppShare()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Addsupplierstoitemmodal Confirmclose Handleclose Handlekeydown`** (6 nodes): `AddSuppliersToItemModal.tsx`, `confirmClose()`, `handleClose()`, `handleKeyDown()`, `handleSubmit()`, `useDebounce()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Suppliereditform Generatesimplesku Handlegeneratesku Handlereset`** (5 nodes): `SupplierEditForm.tsx`, `cn()`, `generateSimpleSKU()`, `handleGenerateSKU()`, `handleReset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Formatcurrency Formatdate Getpaymentbadge Getstatusbadge`** (5 nodes): `page.tsx`, `formatCurrency()`, `formatDate()`, `getPaymentBadge()`, `getStatusBadge()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboardpage Dashboardsessionrecovery Isrecoverabledashboardsessionerror`** (4 nodes): `DashboardPage()`, `DashboardSessionRecovery()`, `isRecoverableDashboardSessionError()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Item Performance Report Formatcurrency`** (4 nodes): `item-performance-report.tsx`, `formatCurrency()`, `getStockStatusBadge()`, `getTrendIcon()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Createtaxratepage Handlecreatetaxrate`** (4 nodes): `CreateTaxRatePage()`, `handleCreateTaxRate()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Currentstockpage Tonumberparam Tostringparam`** (4 nodes): `page.tsx`, `CurrentStockPage()`, `toNumberParam()`, `toStringParam()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Loading`** (3 nodes): `loading.tsx`, `loading.tsx`, `Loading()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Structure`** (3 nodes): `page.tsx`, `page.tsx`, `page()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Oldpage Newitempage`** (3 nodes): `oldPage.tsx`, `oldPage.tsx`, `NewItemPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Basicz Infox Tabq Fetchdata`** (3 nodes): `basicz-infox-tabq.tsx`, `basicz-infox-tabq.tsx`, `fetchData()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Movementspage`** (3 nodes): `page.tsx`, `page.tsx`, `MovementsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Transferspage`** (3 nodes): `page.tsx`, `page.tsx`, `TransfersPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Formatcurrency Formatdate Getstatusbadge Enhanced` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Formatcurrency Formatdate Enhanced Columns` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._