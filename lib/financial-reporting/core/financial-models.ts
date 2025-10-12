import { Decimal } from "@prisma/client/runtime/library"

// =============================================================================
// CORE FINANCIAL DATA MODELS - Enterprise Grade
// =============================================================================

export interface FinancialPeriod {
  startDate: Date
  endDate: Date
  fiscalYear: number
  fiscalQuarter: number
  fiscalMonth: number
  isCurrentPeriod: boolean
  isComparativePeriod: boolean
}

export interface ChartOfAccounts {
  accountNumber: string
  accountName: string
  accountType: AccountType
  accountSubType: AccountSubType
  parentAccountId?: string
  isActive: boolean
  description?: string
  taxReporting?: TaxReportingCategory
  normalBalance: 'DEBIT' | 'CREDIT'
  allowManualEntries: boolean
  requiresProject?: boolean
  requiresDepartment?: boolean
}

export enum AccountType {
  ASSETS = 'ASSETS',
  LIABILITIES = 'LIABILITIES',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSES = 'EXPENSES',
  OTHER_INCOME = 'OTHER_INCOME',
  OTHER_EXPENSES = 'OTHER_EXPENSES'
}

export enum AccountSubType {
  // Assets
  CURRENT_ASSETS = 'CURRENT_ASSETS',
  CASH_AND_EQUIVALENTS = 'CASH_AND_EQUIVALENTS',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  INVENTORY = 'INVENTORY',
  PREPAID_EXPENSES = 'PREPAID_EXPENSES',
  OTHER_CURRENT_ASSETS = 'OTHER_CURRENT_ASSETS',
  FIXED_ASSETS = 'FIXED_ASSETS',
  ACCUMULATED_DEPRECIATION = 'ACCUMULATED_DEPRECIATION',
  INTANGIBLE_ASSETS = 'INTANGIBLE_ASSETS',
  LONG_TERM_ASSETS = 'LONG_TERM_ASSETS',

  // Liabilities
  CURRENT_LIABILITIES = 'CURRENT_LIABILITIES',
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  ACCRUED_LIABILITIES = 'ACCRUED_LIABILITIES',
  SHORT_TERM_DEBT = 'SHORT_TERM_DEBT',
  TAXES_PAYABLE = 'TAXES_PAYABLE',
  LONG_TERM_DEBT = 'LONG_TERM_DEBT',
  OTHER_LIABILITIES = 'OTHER_LIABILITIES',

  // Equity
  PAID_IN_CAPITAL = 'PAID_IN_CAPITAL',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  CURRENT_EARNINGS = 'CURRENT_EARNINGS',
  DIVIDENDS = 'DIVIDENDS',
  TREASURY_STOCK = 'TREASURY_STOCK',

  // Revenue
  SALES_REVENUE = 'SALES_REVENUE',
  SERVICE_REVENUE = 'SERVICE_REVENUE',
  OTHER_REVENUE = 'OTHER_REVENUE',
  RETURNS_AND_ALLOWANCES = 'RETURNS_AND_ALLOWANCES',

  // Expenses
  COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
  OPERATING_EXPENSES = 'OPERATING_EXPENSES',
  SALARIES_AND_WAGES = 'SALARIES_AND_WAGES',
  BENEFITS = 'BENEFITS',
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  INSURANCE = 'INSURANCE',
  DEPRECIATION = 'DEPRECIATION',
  AMORTIZATION = 'AMORTIZATION',
  MARKETING = 'MARKETING',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  TRAVEL = 'TRAVEL',
  OFFICE_EXPENSES = 'OFFICE_EXPENSES',
  INTEREST_EXPENSE = 'INTEREST_EXPENSE',
  TAX_EXPENSE = 'TAX_EXPENSE'
}

export enum TaxReportingCategory {
  SALES_TAX = 'SALES_TAX',
  INCOME_TAX = 'INCOME_TAX',
  PAYROLL_TAX = 'PAYROLL_TAX',
  PROPERTY_TAX = 'PROPERTY_TAX',
  EXCISE_TAX = 'EXCISE_TAX',
  NON_TAXABLE = 'NON_TAXABLE',
  TAX_DEDUCTIBLE = 'TAX_DEDUCTIBLE'
}

// =============================================================================
// FINANCIAL STATEMENTS INTERFACES
// =============================================================================

export interface IncomeStatement {
  reportingPeriod: FinancialPeriod
  currency: string

  // Revenue Section
  grossRevenue: Decimal
  salesReturns: Decimal
  netRevenue: Decimal

  // Cost of Goods Sold
  beginningInventory: Decimal
  purchases: Decimal
  directLabor: Decimal
  manufacturingOverhead: Decimal
  endingInventory: Decimal
  costOfGoodsSold: Decimal

  // Gross Profit
  grossProfit: Decimal
  grossProfitMargin: number

  // Operating Expenses
  operatingExpenses: OperatingExpenseBreakdown
  totalOperatingExpenses: Decimal

  // Operating Income
  operatingIncome: Decimal
  operatingMargin: number

  // Other Income/Expenses
  otherIncome: Decimal
  interestIncome: Decimal
  interestExpense: Decimal
  otherExpenses: Decimal

  // Earnings Before Tax
  earningsBeforeTax: Decimal

  // Tax Expenses
  incomeTaxExpense: Decimal
  effectiveTaxRate: number

  // Net Income
  netIncome: Decimal
  netProfitMargin: number

  // Additional Metrics
  ebitda: Decimal
  ebitdaMargin: number

  // Comparative Analysis
  priorPeriodComparison?: IncomeStatementComparison
}

export interface OperatingExpenseBreakdown {
  salariesAndWages: Decimal
  employeeBenefits: Decimal
  rent: Decimal
  utilities: Decimal
  insurance: Decimal
  depreciation: Decimal
  amortization: Decimal
  marketing: Decimal
  professionalServices: Decimal
  travel: Decimal
  officeExpenses: Decimal
  maintenance: Decimal
  supplies: Decimal
  other: Decimal
}

export interface IncomeStatementComparison {
  revenueGrowth: number
  grossProfitGrowth: number
  operatingIncomeGrowth: number
  netIncomeGrowth: number
  marginTrends: {
    grossMarginChange: number
    operatingMarginChange: number
    netMarginChange: number
  }
}

export interface BalanceSheet {
  reportingDate: Date
  currency: string

  // Assets
  assets: {
    currentAssets: CurrentAssets
    totalCurrentAssets: Decimal

    nonCurrentAssets: NonCurrentAssets
    totalNonCurrentAssets: Decimal

    totalAssets: Decimal
  }

  // Liabilities
  liabilities: {
    currentLiabilities: CurrentLiabilities
    totalCurrentLiabilities: Decimal

    nonCurrentLiabilities: NonCurrentLiabilities
    totalNonCurrentLiabilities: Decimal

    totalLiabilities: Decimal
  }

  // Equity
  equity: EquitySection
  totalEquity: Decimal

  // Verification
  totalLiabilitiesAndEquity: Decimal
  balanceVerification: boolean

  // Financial Ratios
  workingCapital: Decimal
  currentRatio: number
  quickRatio: number
  debtToEquityRatio: number
  debtToAssetsRatio: number

  // Comparative Analysis
  priorPeriodComparison?: BalanceSheetComparison
}

export interface CurrentAssets {
  cashAndCashEquivalents: Decimal
  shortTermInvestments: Decimal
  accountsReceivable: Decimal
  allowanceForDoubtfulAccounts: Decimal
  netAccountsReceivable: Decimal
  inventory: Decimal
  prepaidExpenses: Decimal
  otherCurrentAssets: Decimal
}

export interface NonCurrentAssets {
  propertyPlantEquipment: PPEDetails
  intangibleAssets: IntangibleAssetDetails
  longTermInvestments: Decimal
  deferredTaxAssets: Decimal
  otherNonCurrentAssets: Decimal
}

export interface PPEDetails {
  land: Decimal
  buildings: Decimal
  machinery: Decimal
  equipment: Decimal
  vehicles: Decimal
  furniture: Decimal
  accumulatedDepreciation: Decimal
  netPPE: Decimal
}

export interface IntangibleAssetDetails {
  goodwill: Decimal
  patents: Decimal
  trademarks: Decimal
  software: Decimal
  customerRelationships: Decimal
  accumulatedAmortization: Decimal
  netIntangibleAssets: Decimal
}

export interface CurrentLiabilities {
  accountsPayable: Decimal
  accruedLiabilities: Decimal
  shortTermDebt: Decimal
  currentPortionLongTermDebt: Decimal
  taxesPayable: Decimal
  deferredRevenue: Decimal
  otherCurrentLiabilities: Decimal
}

export interface NonCurrentLiabilities {
  longTermDebt: Decimal
  deferredTaxLiabilities: Decimal
  pensionObligations: Decimal
  otherNonCurrentLiabilities: Decimal
}

export interface EquitySection {
  commonStock: Decimal
  preferredStock: Decimal
  additionalPaidInCapital: Decimal
  retainedEarnings: Decimal
  accumulatedOtherComprehensiveIncome: Decimal
  treasuryStock: Decimal
}

export interface BalanceSheetComparison {
  assetGrowth: number
  liabilityGrowth: number
  equityGrowth: number
  workingCapitalChange: Decimal
  ratioTrends: {
    currentRatioChange: number
    debtToEquityChange: number
    assetTurnoverChange: number
  }
}

export interface CashFlowStatement {
  reportingPeriod: FinancialPeriod
  currency: string

  // Operating Activities
  operatingActivities: OperatingCashFlow
  netCashFromOperatingActivities: Decimal

  // Investing Activities
  investingActivities: InvestingCashFlow
  netCashFromInvestingActivities: Decimal

  // Financing Activities
  financingActivities: FinancingCashFlow
  netCashFromFinancingActivities: Decimal

  // Net Change in Cash
  netChangeInCash: Decimal

  // Cash Reconciliation
  beginningCashBalance: Decimal
  endingCashBalance: Decimal

  // Supplemental Information
  supplementalInformation: SupplementalCashFlowInfo

  // Cash Flow Ratios
  operatingCashFlowRatio: number
  cashFlowToDebtRatio: number
  cashFlowCoverage: number

  // Comparative Analysis
  priorPeriodComparison?: CashFlowComparison
}

export interface OperatingCashFlow {
  netIncome: Decimal
  adjustments: {
    depreciation: Decimal
    amortization: Decimal
    lossOnDisposal: Decimal
    unrealizedGains: Decimal
    stockBasedCompensation: Decimal
    deferredTaxes: Decimal
    other: Decimal
  }
  workingCapitalChanges: {
    accountsReceivableChange: Decimal
    inventoryChange: Decimal
    prepaidExpensesChange: Decimal
    accountsPayableChange: Decimal
    accruedLiabilitiesChange: Decimal
    deferredRevenueChange: Decimal
    other: Decimal
  }
}

export interface InvestingCashFlow {
  capitalExpenditures: Decimal
  assetDisposals: Decimal
  investmentPurchases: Decimal
  investmentSales: Decimal
  acquisitions: Decimal
  other: Decimal
}

export interface FinancingCashFlow {
  debtProceeds: Decimal
  debtRepayments: Decimal
  stockIssuance: Decimal
  stockRepurchases: Decimal
  dividendsPaid: Decimal
  other: Decimal
}

export interface SupplementalCashFlowInfo {
  interestPaid: Decimal
  incomeTaxesPaid: Decimal
  nonCashTransactions: {
    stockForAssets: Decimal
    debtConversions: Decimal
    other: Decimal
  }
}

export interface CashFlowComparison {
  operatingCashFlowGrowth: number
  capitalExpenditureChange: number
  freeCashFlowGrowth: number
  cashConversionTrend: number
}

// =============================================================================
// FINANCIAL ANALYSIS & RATIOS
// =============================================================================

export interface ComprehensiveFinancialAnalysis {
  reportingPeriod: FinancialPeriod
  organizationId: string

  // Core Financial Statements
  incomeStatement: IncomeStatement
  balanceSheet: BalanceSheet
  cashFlowStatement: CashFlowStatement

  // Financial Ratios
  liquidityRatios: LiquidityRatios
  leverageRatios: LeverageRatios
  profitabilityRatios: ProfitabilityRatios
  efficiencyRatios: EfficiencyRatios
  marketRatios: MarketRatios

  // Advanced Analytics
  dupont: DuPontAnalysis
  commonSize: CommonSizeAnalysis
  trendAnalysis: TrendAnalysis
  seasonalAnalysis: SeasonalAnalysis

  // Performance Metrics
  kpis: EnterpriseKPIs
  benchmarks: IndustryBenchmarks

  // Risk Assessment
  riskMetrics: RiskAssessment
  creditAnalysis: CreditAnalysis

  // Forecasting
  forecasts: FinancialForecasts
  scenarios: ScenarioAnalysis

  // Compliance & Audit
  auditTrail: AuditInformation
  regulatoryCompliance: ComplianceStatus
}

export interface LiquidityRatios {
  currentRatio: number
  quickRatio: number
  cashRatio: number
  workingCapitalRatio: number
  defensiveInterval: number
  cashConversionCycle: number
  daysOfCashOnHand: number
}

export interface LeverageRatios {
  debtToEquityRatio: number
  debtToAssetsRatio: number
  timesInterestEarned: number
  debtServiceCoverage: number
  longTermDebtToCapitalization: number
  capitalAdequacyRatio: number
  leverageMultiplier: number
}

export interface ProfitabilityRatios {
  grossProfitMargin: number
  operatingProfitMargin: number
  netProfitMargin: number
  returnOnAssets: number
  returnOnEquity: number
  returnOnInvestedCapital: number
  ebitdaMargin: number
  economicValueAdded: Decimal
}

export interface EfficiencyRatios {
  assetTurnover: number
  inventoryTurnover: number
  receivablesTurnover: number
  payablesTurnover: number
  fixedAssetTurnover: number
  workingCapitalTurnover: number
  cashCycle: number
  employeeProductivity: number
}

export interface MarketRatios {
  priceToEarnings?: number
  priceToBook?: number
  priceToSales?: number
  enterpriseValue?: Decimal
  marketCapitalization?: Decimal
  dividendYield?: number
  bookValuePerShare?: number
}

export interface DuPontAnalysis {
  returnOnEquity: number
  netProfitMargin: number
  assetTurnover: number
  equityMultiplier: number
  returnOnAssets: number
  leverageEffect: number
}

export interface CommonSizeAnalysis {
  incomeStatement: {
    [key: string]: number // Each line item as % of revenue
  }
  balanceSheet: {
    [key: string]: number // Each line item as % of total assets
  }
}

export interface TrendAnalysis {
  period: number // Number of periods analyzed
  revenueGrowthTrend: number[]
  profitabilityTrend: number[]
  liquidityTrend: number[]
  leverageTrend: number[]
  seasonalPatterns: SeasonalPattern[]
}

export interface SeasonalPattern {
  period: string
  revenueIndex: number
  expenseIndex: number
  profitabilityIndex: number
}

export interface SeasonalAnalysis {
  quarterlyPatterns: SeasonalPattern[]
  monthlyPatterns: SeasonalPattern[]
  revenueSeasonality: number
  expenseSeasonality: number
  seasonalityImpact: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface EnterpriseKPIs {
  // Financial Performance
  revenueGrowthRate: number
  profitGrowthRate: number
  cashFlowGrowthRate: number
  marginExpansion: number

  // Operational Efficiency
  operationalLeverage: number
  costOfCapital: number
  investmentReturn: number
  capitalEfficiency: number

  // Risk & Stability
  earningsVolatility: number
  businessRiskScore: number
  financialRiskScore: number
  overallRiskRating: 'LOW' | 'MEDIUM' | 'HIGH'

  // Market Performance
  marketShareGrowth?: number
  customerRetentionRate?: number
  customerAcquisitionCost?: Decimal
  lifetimeValue?: Decimal
}

export interface IndustryBenchmarks {
  industryCode: string
  industryName: string
  benchmarkMetrics: {
    medianGrossMargin: number
    medianOperatingMargin: number
    medianNetMargin: number
    medianCurrentRatio: number
    medianDebtToEquity: number
    medianROE: number
    medianROA: number
    medianAssetTurnover: number
  }
  performanceVsBenchmark: {
    [key: string]: 'OUTPERFORMING' | 'AT_BENCHMARK' | 'UNDERPERFORMING'
  }
}

export interface RiskAssessment {
  creditRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  liquidityRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  operationalRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  marketRisk: 'LOW' | 'MEDIUM' | 'HIGH'

  riskFactors: RiskFactor[]
  overallRiskScore: number
  recommendedActions: string[]
}

export interface RiskFactor {
  category: string
  description: string
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
  probability: number
  mitigationStrategy?: string
}

export interface CreditAnalysis {
  creditScore: number
  creditRating: string
  probabilityOfDefault: number
  lossGivenDefault: number
  expectedLoss: Decimal
  creditLimits: {
    recommended: Decimal
    maximum: Decimal
    current: Decimal
  }
}

export interface FinancialForecasts {
  forecastPeriods: number
  methodology: 'LINEAR' | 'EXPONENTIAL' | 'SEASONAL' | 'REGRESSION'

  revenueForecasts: ForecastData[]
  expenseForecasts: ForecastData[]
  profitabilityForecasts: ForecastData[]
  cashFlowForecasts: ForecastData[]

  confidenceIntervals: {
    [key: string]: {
      lower: number
      upper: number
      confidence: number
    }
  }
}

export interface ForecastData {
  period: string
  value: Decimal
  confidenceLevel: number
  assumptions: string[]
}

export interface ScenarioAnalysis {
  baseCase: ScenarioResults
  optimisticCase: ScenarioResults
  pessimisticCase: ScenarioResults
  customScenarios: CustomScenario[]
}

export interface ScenarioResults {
  scenarioName: string
  probability: number
  assumptions: string[]
  financialImpact: {
    revenue: Decimal
    expenses: Decimal
    profit: Decimal
    cashFlow: Decimal
  }
  keyMetrics: {
    [key: string]: number
  }
}

export interface CustomScenario extends ScenarioResults {
  scenarioId: string
  createdBy: string
  createdDate: Date
}

export interface AuditInformation {
  reportGeneratedDate: Date
  reportGeneratedBy: string
  dataSourcesUsed: string[]
  calculationMethodologies: string[]
  assumptionsMade: string[]
  limitations: string[]
  reviewStatus: 'DRAFT' | 'REVIEWED' | 'APPROVED'
  approverDetails?: {
    approvedBy: string
    approvedDate: Date
    approverTitle: string
  }
}

export interface ComplianceStatus {
  gaapCompliance: boolean
  ifrsCompliance: boolean
  taxComplianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING'
  requiredFilings: RequiredFiling[]
  complianceAlerts: ComplianceAlert[]
}

export interface RequiredFiling {
  filingType: string
  dueDate: Date
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FILED'
  responsible: string
}

export interface ComplianceAlert {
  alertType: 'WARNING' | 'ERROR' | 'INFO'
  description: string
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
  actionRequired: boolean
  dueDate?: Date
}