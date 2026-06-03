# Graph Report - lib  (2026-06-03)

## Corpus Check
- 102 files · ~62,351 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 662 nodes · 799 edges · 36 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Createalert Getsystemhealth Getnodememoryusage Getnodepackageversion|Createalert Getsystemhealth Getnodememoryusage Getnodepackageversion]]
- [[_COMMUNITY_Utils Constants Circuitbreaker Calculateretrydelay|Utils Constants Circuitbreaker Calculateretrydelay]]
- [[_COMMUNITY_Auth Getauthenticateduser Isauthenticated Api|Auth Getauthenticateduser Isauthenticated Api]]
- [[_COMMUNITY_Dboperation Dbtransaction Resilientdatabase Checkcircuitbreaker|Dboperation Dbtransaction Resilientdatabase Checkcircuitbreaker]]
- [[_COMMUNITY_Createerrorid Errorhandler Attemptrecovery Categorizeerror|Createerrorid Errorhandler Attemptrecovery Categorizeerror]]
- [[_COMMUNITY_Recordfailure Recordsuccess Captcharequirement Checkrequirement|Recordfailure Recordsuccess Captcharequirement Checkrequirement]]
- [[_COMMUNITY_Initializeproductionmonitoring Productionmonitor Checkerrorrates Checkinventoryhealth|Initializeproductionmonitoring Productionmonitor Checkerrorrates Checkinventoryhealth]]
- [[_COMMUNITY_Dateutils Addminutes Calculateovertime Calculateworkhours|Dateutils Addminutes Calculateovertime Calculateworkhours]]
- [[_COMMUNITY_Calculateriskscore Createsessionsecurity Detectconcurrentsessions Forcelogoutallsessions|Calculateriskscore Createsessionsecurity Detectconcurrentsessions Forcelogoutallsessions]]
- [[_COMMUNITY_Executefinancialoperation Financialsafety Checkidempotency Constructor|Executefinancialoperation Financialsafety Checkidempotency Constructor]]
- [[_COMMUNITY_Constructor Applysecurityheaders Cspbuilder Adddirective|Constructor Applysecurityheaders Cspbuilder Adddirective]]
- [[_COMMUNITY_Can Canmanagerole Canmanageuser Getallpermissions|Can Canmanagerole Canmanageuser Getallpermissions]]
- [[_COMMUNITY_Getdbutils Getnodecpuusage Getnodememoryusage Getnodepackageversion|Getdbutils Getnodecpuusage Getnodememoryusage Getnodepackageversion]]
- [[_COMMUNITY_Auth Unified Final Getauthenticateduser|Auth Unified Final Getauthenticateduser]]
- [[_COMMUNITY_Photostoragemanager Constructor Deletephoto Deletephotolocally|Photostoragemanager Constructor Deletephoto Deletephotolocally]]
- [[_COMMUNITY_Input Validation Securityvalidator Validatefileupload|Input Validation Securityvalidator Validatefileupload]]
- [[_COMMUNITY_Accountprotection Checkaccountlock Recordfailedattempt Recordsuccessfulattempt|Accountprotection Checkaccountlock Recordfailedattempt Recordsuccessfulattempt]]
- [[_COMMUNITY_Email Verification Cleanupexpiredtokens Createverificationtoken|Email Verification Cleanupexpiredtokens Createverificationtoken]]
- [[_COMMUNITY_Createid Dispatch Isoptions Normalizeaction|Createid Dispatch Isoptions Normalizeaction]]
- [[_COMMUNITY_Error Wrappers System Centralized|Error Wrappers System Centralized]]
- [[_COMMUNITY_Action Utils Createerrorresponse Createsuccessresponse|Action Utils Createerrorresponse Createsuccessresponse]]
- [[_COMMUNITY_Categorizeerror Geterrorcode Getruntimeerrorname Getusermessage|Categorizeerror Geterrorcode Getruntimeerrorname Getusermessage]]
- [[_COMMUNITY_Errorboundary Componentdidcatch Constructor Getderivedstatefromerror|Errorboundary Componentdidcatch Constructor Getderivedstatefromerror]]
- [[_COMMUNITY_Buildcrudmutationnotification Createcrudmutationmeta Dispatchcrudmutationnotification Getfailedactionresulterror|Buildcrudmutationnotification Createcrudmutationmeta Dispatchcrudmutationnotification Getfailedactionresulterror]]
- [[_COMMUNITY_Createstockflowactionwrapper Getusermessageforcategory Isnextcontrolflowerror Isrecoverable|Createstockflowactionwrapper Getusermessageforcategory Isnextcontrolflowerror Isrecoverable]]
- [[_COMMUNITY_Auth Client Unified Signout|Auth Client Unified Signout]]
- [[_COMMUNITY_Createsession Decrypt Deletesession Encrypt|Createsession Decrypt Deletesession Encrypt]]
- [[_COMMUNITY_Createerrornotification Getcategorystring Hooks Useerrormonitoring|Createerrornotification Getcategorystring Hooks Useerrormonitoring]]
- [[_COMMUNITY_Get Mockdatabase Getalldata Getcashdraweranalytics|Get Mockdatabase Getalldata Getcashdraweranalytics]]
- [[_COMMUNITY_Auth Helpers Getuserpermissions Getuserwithroles|Auth Helpers Getuserpermissions Getuserwithroles]]
- [[_COMMUNITY_Generateterminalnumber Generatesecurenumericstring Generateuniqueterminalnumber Generateuniqueterminalnumberuuid|Generateterminalnumber Generatesecurenumericstring Generateuniqueterminalnumber Generateuniqueterminalnumberuuid]]
- [[_COMMUNITY_Mockdatabase Getcashdraweranalytics Getinventoryanalytics Getsalesanalytics|Mockdatabase Getcashdraweranalytics Getinventoryanalytics Getsalesanalytics]]
- [[_COMMUNITY_Createnotificationcallback Mapcategorytonotification Mapseveritytonotification Setuperrornotificationintegration|Createnotificationcallback Mapcategorytonotification Mapseveritytonotification Setuperrornotificationintegration]]
- [[_COMMUNITY_Setloggersink Sink Write Logger|Setloggersink Sink Write Logger]]
- [[_COMMUNITY_Reportexportservice Exportreport Getinstance Report|Reportexportservice Exportreport Getinstance Report]]
- [[_COMMUNITY_Tonumber Update Inventory Levels|Tonumber Update Inventory Levels]]

## God Nodes (most connected - your core abstractions)
1. `SystemMonitor` - 40 edges
2. `ResilientDatabase` - 29 edges
3. `CircuitBreaker` - 23 edges
4. `ErrorHandler` - 23 edges
5. `ProductionMonitor` - 18 edges
6. `FinancialSafety` - 16 edges
7. `PhotoStorageManager` - 12 edges
8. `RateLimiter` - 8 edges
9. `sanitizeErrorMetadata()` - 8 edges
10. `initializeSystemMonitoring()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `initializeSystemMonitoring()` --calls--> `startSystemMonitoring()`  [INFERRED]
  monitoring-setup.ts → error-handling\monitoring.ts
- `initializeEnterpriseErrorHandling()` --calls--> `startSystemMonitoring()`  [INFERRED]
  error-handling\integration-examples.ts → error-handling\monitoring.ts
- `ClientRoleGate()` --calls--> `hasRole()`  [INFERRED]
  auth-components.tsx → auth-api.ts
- `ClientRoleGate()` --calls--> `hasAnyRole()`  [INFERRED]
  auth-components.tsx → auth-api.ts
- `ClientPermissionGate()` --calls--> `checkPermission()`  [INFERRED]
  auth-components.tsx → auth-server.ts

## Hyperedges (group relationships)
- **Enterprise Error Handling Architecture** — error_handling_readme_enterprise_error_handling_system, error_handling_readme_error_classification_system, error_handling_readme_centralized_error_handler, error_handling_readme_server_action_wrappers, error_handling_readme_client_error_boundaries, error_handling_readme_notification_integration [EXTRACTED 1.00]

## Communities

### Community 0 - "Createalert Getsystemhealth Getnodememoryusage Getnodepackageversion"
Cohesion: 0.07
Nodes (5): createAlert(), getNodeMemoryUsage(), getNodePackageVersion(), startSystemMonitoring(), SystemMonitor

### Community 1 - "Utils Constants Circuitbreaker Calculateretrydelay"
Cohesion: 0.07
Nodes (11): CircuitBreaker, CircuitBreakerManager, createCircuitBreaker(), executeWithCircuitBreaker(), initializeEnterpriseErrorHandling(), getPerformanceThreshold(), getDatabaseStats(), recordDbMetrics() (+3 more)

### Community 2 - "Auth Getauthenticateduser Isauthenticated Api"
Cohesion: 0.06
Nodes (5): hasAnyRole(), hasRole(), ClientPermissionGate(), ClientRoleGate(), checkPermission()

### Community 3 - "Dboperation Dbtransaction Resilientdatabase Checkcircuitbreaker"
Cohesion: 0.11
Nodes (3): dbOperation(), dbTransaction(), ResilientDatabase

### Community 4 - "Createerrorid Errorhandler Attemptrecovery Categorizeerror"
Cohesion: 0.15
Nodes (6): createErrorId(), ErrorHandler, getPublicMessage(), isPlainRecord(), redactString(), sanitizeErrorMetadata()

### Community 5 - "Recordfailure Recordsuccess Captcharequirement Checkrequirement"
Cohesion: 0.12
Nodes (5): CaptchaRequirement, IPBlocklist, ProgressiveDelay, RateLimiter, withRateLimit()

### Community 6 - "Initializeproductionmonitoring Productionmonitor Checkerrorrates Checkinventoryhealth"
Cohesion: 0.13
Nodes (1): ProductionMonitor

### Community 7 - "Dateutils Addminutes Calculateovertime Calculateworkhours"
Cohesion: 0.13
Nodes (5): calculateOvertime(), calculateWorkHours(), formatRelativeTime(), getTimeDifferenceInMinutes(), isLateArrival()

### Community 8 - "Calculateriskscore Createsessionsecurity Detectconcurrentsessions Forcelogoutallsessions"
Cohesion: 0.19
Nodes (11): calculateRiskScore(), createSessionSecurity(), forceLogoutAllSessions(), generateDeviceFingerprint(), getClientIP(), invalidateSessionSecurity(), logSecurityEvent(), rotateSessionOnPrivilegeChange() (+3 more)

### Community 9 - "Executefinancialoperation Financialsafety Checkidempotency Constructor"
Cohesion: 0.16
Nodes (2): executeFinancialOperation(), FinancialSafety

### Community 10 - "Constructor Applysecurityheaders Cspbuilder Adddirective"
Cohesion: 0.14
Nodes (4): applySecurityHeaders(), CSPBuilder, SecurityHeaders, SecurityHeaderTester

### Community 11 - "Can Canmanagerole Canmanageuser Getallpermissions"
Cohesion: 0.15
Nodes (7): can(), canManageRole(), canManageUser(), getRoleHierarchy(), hasPermission(), hasAppPermission(), requireAppPermission()

### Community 12 - "Getdbutils Getnodecpuusage Getnodememoryusage Getnodepackageversion"
Cohesion: 0.2
Nodes (8): getDBUtils(), getNodePackageVersion(), initializeAlertManagement(), initializeDatabaseMonitoring(), initializePerformanceTracking(), initializeSystemMonitoring(), performSystemHealthCheck(), startPeriodicHealthChecks()

### Community 13 - "Auth Unified Final Getauthenticateduser"
Cohesion: 0.21
Nodes (7): getAuthenticatedUser(), localizedClientHref(), requireAnyPermission(), requirePermission(), requireRole(), useAuth(), useRequireAuth()

### Community 15 - "Photostoragemanager Constructor Deletephoto Deletephotolocally"
Cohesion: 0.23
Nodes (1): PhotoStorageManager

### Community 16 - "Input Validation Securityvalidator Validatefileupload"
Cohesion: 0.18
Nodes (2): SecurityValidator, XSSPrevention

### Community 17 - "Accountprotection Checkaccountlock Recordfailedattempt Recordsuccessfulattempt"
Cohesion: 0.2
Nodes (3): AccountProtection, checkAuthRateLimit(), createMockRequest()

### Community 18 - "Email Verification Cleanupexpiredtokens Createverificationtoken"
Cohesion: 0.27
Nodes (4): createVerificationToken(), generateVerificationToken(), resendVerificationEmail(), sendVerificationEmail()

### Community 19 - "Createid Dispatch Isoptions Normalizeaction"
Cohesion: 0.44
Nodes (9): createId(), dispatch(), isOptions(), normalizeAction(), normalizeFromArgs(), normalizeInput(), normalizeType(), show() (+1 more)

### Community 20 - "Error Wrappers System Centralized"
Cohesion: 0.2
Nodes (10): Centralized ErrorHandler, Client Error Boundaries, Custom Error Categories, Domain-specific Wrappers, StockFlow Enterprise Error Handling System, Error Classification System, Error Monitoring and Metrics, Error Recovery and Retry (+2 more)

### Community 21 - "Action Utils Createerrorresponse Createsuccessresponse"
Cohesion: 0.22
Nodes (1): ServerActionError

### Community 22 - "Categorizeerror Geterrorcode Getruntimeerrorname Getusermessage"
Cohesion: 0.44
Nodes (8): categorizeError(), getErrorCode(), getRuntimeErrorName(), getUserMessage(), hashString(), isKnownPrismaErrorName(), isPrismaKnownRequestError(), shouldRetry()

### Community 23 - "Errorboundary Componentdidcatch Constructor Getderivedstatefromerror"
Cohesion: 0.25
Nodes (1): ErrorBoundary

### Community 25 - "Buildcrudmutationnotification Createcrudmutationmeta Dispatchcrudmutationnotification Getfailedactionresulterror"
Cohesion: 0.36
Nodes (4): buildCrudMutationNotification(), getFriendlyErrorMessage(), safeString(), titleCase()

### Community 26 - "Createstockflowactionwrapper Getusermessageforcategory Isnextcontrolflowerror Isrecoverable"
Cohesion: 0.32
Nodes (4): createStockFlowActionWrapper(), isStructuredActionError(), normalizeActionError(), withErrorHandling()

### Community 27 - "Auth Client Unified Signout"
Cohesion: 0.38
Nodes (3): useAuth(), useRequireAuth(), useRequireAuthAndOrg()

### Community 30 - "Createsession Decrypt Deletesession Encrypt"
Cohesion: 0.48
Nodes (5): createSession(), decrypt(), encrypt(), updateSession(), verifySession()

### Community 31 - "Createerrornotification Getcategorystring Hooks Useerrormonitoring"
Cohesion: 0.33
Nodes (2): createErrorNotification(), getCategoryString()

### Community 32 - "Get Mockdatabase Getalldata Getcashdraweranalytics"
Cohesion: 0.33
Nodes (2): get(), MockDatabase

### Community 33 - "Auth Helpers Getuserpermissions Getuserwithroles"
Cohesion: 0.6
Nodes (5): getUserPermissions(), getUserWithRoles(), userHasAllPermissions(), userHasAnyPermission(), userHasPermission()

### Community 34 - "Generateterminalnumber Generatesecurenumericstring Generateuniqueterminalnumber Generateuniqueterminalnumberuuid"
Cohesion: 0.4
Nodes (3): generateSecureNumericString(), generateUniqueTerminalNumber(), TerminalNumberGenerationError

### Community 37 - "Mockdatabase Getcashdraweranalytics Getinventoryanalytics Getsalesanalytics"
Cohesion: 0.4
Nodes (1): MockDatabase

### Community 38 - "Createnotificationcallback Mapcategorytonotification Mapseveritytonotification Setuperrornotificationintegration"
Cohesion: 0.5
Nodes (2): createNotificationCallback(), setupErrorNotificationIntegration()

### Community 40 - "Setloggersink Sink Write Logger"
Cohesion: 0.67
Nodes (2): sink(), write()

### Community 42 - "Reportexportservice Exportreport Getinstance Report"
Cohesion: 0.5
Nodes (1): ReportExportService

### Community 50 - "Tonumber Update Inventory Levels"
Cohesion: 1.0
Nodes (2): toNumber(), updateInventoryLevels()

## Knowledge Gaps
- **5 isolated node(s):** `Client Error Boundaries`, `Notification Integration`, `Domain-specific Wrappers`, `Error Monitoring and Metrics`, `Custom Error Categories`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Initializeproductionmonitoring Productionmonitor Checkerrorrates Checkinventoryhealth`** (20 nodes): `initializeProductionMonitoring()`, `ProductionMonitor`, `.checkErrorRates()`, `.checkInventoryHealth()`, `.checkResponseTimes()`, `.checkTransactionHealth()`, `.cleanupOldMetrics()`, `.constructor()`, `.getAverageResponseTime()`, `.getStatus()`, `.initializeMonitoring()`, `.initializeSalesTracking()`, `.recordError()`, `.recordInventoryEvent()`, `.recordResponseTime()`, `.recordTransaction()`, `.sendEmail()`, `.sendToExternalServices()`, `.sendToSlack()`, `production-monitoring.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Executefinancialoperation Financialsafety Checkidempotency Constructor`** (18 nodes): `executeFinancialOperation()`, `FinancialSafety`, `.checkIdempotency()`, `.constructor()`, `.createJournalEntries()`, `.executeCompensatingActions()`, `.executeFinancialSaga()`, `.executeFinancialSagaStep()`, `.executeFinancialTransaction()`, `.getAuditTrail()`, `.getInstance()`, `.handleFinancialError()`, `.reconcileFinancialBalances()`, `.recordAuditEntry()`, `.roundToCurrencyPrecision()`, `.validateCurrencyAmount()`, `.validateFinancialTransaction()`, `financial-safety.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Photostoragemanager Constructor Deletephoto Deletephotolocally`** (13 nodes): `PhotoStorageManager`, `.constructor()`, `.deletePhoto()`, `.deletePhotoLocally()`, `.deletePhotoOnline()`, `.ensureDirectoryExists()`, `.getInstance()`, `.getStorageType()`, `.savePhoto()`, `.savePhotoLocally()`, `.savePhotoOnline()`, `.setConfiguration()`, `photo-storage.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Input Validation Securityvalidator Validatefileupload`** (11 nodes): `input-validation.ts`, `SecurityValidator`, `.validateFileUpload()`, `.validateHeaders()`, `.validateInput()`, `.validateInputRate()`, `validateRequestBody()`, `XSSPrevention`, `.escapeHTML()`, `.sanitizeForDisplay()`, `.sanitizeHTML()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Action Utils Createerrorresponse Createsuccessresponse`** (9 nodes): `action-utils.ts`, `createErrorResponse()`, `createSuccessResponse()`, `executeBatch()`, `invalidateItemCaches()`, `ServerActionError`, `.constructor()`, `validateRequired()`, `withActionHandler()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Errorboundary Componentdidcatch Constructor Getderivedstatefromerror`** (9 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.logErrorToSystem()`, `.render()`, `ErrorFallbackComponent()`, `client-error-boundary.tsx`, `WithErrorBoundaryComponent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Createerrornotification Getcategorystring Hooks Useerrormonitoring`** (7 nodes): `createErrorNotification()`, `getCategoryString()`, `hooks.ts`, `useErrorMonitoring()`, `useErrorRecovery()`, `useFormErrorHandler()`, `useServerActionHandler()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Get Mockdatabase Getalldata Getcashdraweranalytics`** (7 nodes): `get()`, `MockDatabase`, `.getAllData()`, `.getCashDrawerAnalytics()`, `.getInventoryAnalytics()`, `.getSalesAnalytics()`, `db.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mockdatabase Getcashdraweranalytics Getinventoryanalytics Getsalesanalytics`** (5 nodes): `MockDatabase`, `.getCashDrawerAnalytics()`, `.getInventoryAnalytics()`, `.getSalesAnalytics()`, `db.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Createnotificationcallback Mapcategorytonotification Mapseveritytonotification Setuperrornotificationintegration`** (5 nodes): `createNotificationCallback()`, `mapCategoryToNotification()`, `mapSeverityToNotification()`, `setupErrorNotificationIntegration()`, `notification-integration.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Setloggersink Sink Write Logger`** (4 nodes): `setLoggerSink()`, `sink()`, `write()`, `logger.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Reportexportservice Exportreport Getinstance Report`** (4 nodes): `ReportExportService`, `.exportReport()`, `.getInstance()`, `report-export-service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tonumber Update Inventory Levels`** (3 nodes): `toNumber()`, `update-inventory-levels.ts`, `updateInventoryLevels()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `startSystemMonitoring()` connect `Createalert Getsystemhealth Getnodememoryusage Getnodepackageversion` to `Utils Constants Circuitbreaker Calculateretrydelay`, `Getdbutils Getnodecpuusage Getnodememoryusage Getnodepackageversion`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `initializeEnterpriseErrorHandling()` connect `Utils Constants Circuitbreaker Calculateretrydelay` to `Createalert Getsystemhealth Getnodememoryusage Getnodepackageversion`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `Client Error Boundaries`, `Notification Integration`, `Domain-specific Wrappers` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Createalert Getsystemhealth Getnodememoryusage Getnodepackageversion` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Utils Constants Circuitbreaker Calculateretrydelay` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Auth Getauthenticateduser Isauthenticated Api` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Dboperation Dbtransaction Resilientdatabase Checkcircuitbreaker` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._