import { db } from "@/prisma/db"
import { AuditAction } from "@prisma/client"

// =============================================================================
// COMPREHENSIVE AUDIT TRAIL & CONTROLS SERVICE
// =============================================================================

export interface AuditTrailEntry {
  id: string
  tableName: string
  recordId: string
  action: AuditAction
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  changedFields: string[]
  userId?: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  organizationId: string
}

export interface FinancialControl {
  controlId: string
  controlName: string
  controlType: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  frequency: 'CONTINUOUS' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
  owner: string
  description: string
  procedures: string[]
  testingResults?: ControlTestResult[]
  effectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE' | 'NOT_TESTED'
  lastTested?: Date
  nextTestDue?: Date
}

export interface ControlTestResult {
  testDate: Date
  tester: string
  testProcedure: string
  sampleSize?: number
  exceptionsFound: number
  exceptionsDescriptions: string[]
  conclusion: 'PASS' | 'FAIL' | 'CONDITIONAL_PASS'
  managementResponse?: string
  remediationPlan?: string
  retestRequired: boolean
}

export interface ComplianceReport {
  reportId: string
  reportType: 'SOX_404' | 'COSO_FRAMEWORK' | 'INTERNAL_AUDIT' | 'EXTERNAL_AUDIT' | 'REGULATORY'
  reportingPeriod: {
    startDate: Date
    endDate: Date
  }
  overallRating: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_IMPROVEMENT'
  controlsAssessed: number
  controlsPassed: number
  controlsFailed: number
  materialWeaknesses: MaterialWeakness[]
  significantDeficiencies: SignificantDeficiency[]
  recommendedActions: RecommendedAction[]
  managementCertification?: ManagementCertification
}

export interface MaterialWeakness {
  id: string
  title: string
  description: string
  impactArea: string
  riskRating: 'HIGH' | 'CRITICAL'
  identifiedDate: Date
  remediationPlan: string
  targetCompletionDate: Date
  status: 'OPEN' | 'IN_PROGRESS' | 'REMEDIATED' | 'CLOSED'
  assignedTo: string
}

export interface SignificantDeficiency {
  id: string
  title: string
  description: string
  impactArea: string
  riskRating: 'MEDIUM' | 'HIGH'
  identifiedDate: Date
  remediationPlan: string
  targetCompletionDate: Date
  status: 'OPEN' | 'IN_PROGRESS' | 'REMEDIATED' | 'CLOSED'
  assignedTo: string
}

export interface RecommendedAction {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category: 'PROCESS_IMPROVEMENT' | 'SYSTEM_ENHANCEMENT' | 'TRAINING' | 'DOCUMENTATION' | 'SEGREGATION_OF_DUTIES'
  estimatedEffort: string
  estimatedCost?: number
  expectedBenefit: string
  assignedTo?: string
  targetDate?: Date
}

export interface ManagementCertification {
  certifiedBy: string
  certificationDate: Date
  certificationStatement: string
  limitations?: string[]
  representations: string[]
}

export class AuditTrailService {
  private organizationId: string

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  /**
   * Create audit trail entry
   */
  async createAuditEntry(entry: Omit<AuditTrailEntry, 'id' | 'timestamp' | 'organizationId'>): Promise<void> {
    try {
      await db.auditTrail.create({
        data: {
          tableName: entry.tableName,
          recordId: entry.recordId,
          action: entry.action,
          oldValues: entry.oldValues,
          newValues: entry.newValues,
          changedFields: entry.changedFields,
          userId: entry.userId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          organizationId: this.organizationId
        }
      })
    } catch (error) {
      console.error('Error creating audit entry:', error)
      throw new Error('Failed to create audit entry')
    }
  }

  /**
   * Get audit trail for specific record
   */
  async getRecordAuditTrail(tableName: string, recordId: string): Promise<AuditTrailEntry[]> {
    try {
      const entries = await db.auditTrail.findMany({
        where: {
          organizationId: this.organizationId,
          tableName,
          recordId
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      })

      return entries.map(entry => ({
        id: entry.id,
        tableName: entry.tableName,
        recordId: entry.recordId,
        action: entry.action,
        oldValues: entry.oldValues as Record<string, any> || undefined,
        newValues: entry.newValues as Record<string, any> || undefined,
        changedFields: entry.changedFields,
        userId: entry.userId || undefined,
        ipAddress: entry.ipAddress || undefined,
        userAgent: entry.userAgent || undefined,
        timestamp: entry.timestamp,
        organizationId: entry.organizationId
      }))
    } catch (error) {
      console.error('Error getting audit trail:', error)
      throw new Error('Failed to get audit trail')
    }
  }

  /**
   * Get comprehensive audit report
   */
  async getAuditReport(startDate: Date, endDate: Date): Promise<{
    totalEntries: number
    entriesByAction: Record<string, number>
    entriesByTable: Record<string, number>
    entriesByUser: Record<string, number>
    suspiciousActivities: AuditTrailEntry[]
    entries: AuditTrailEntry[]
  }> {
    try {
      const entries = await db.auditTrail.findMany({
        where: {
          organizationId: this.organizationId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      })

      // Aggregate statistics
      const entriesByAction: Record<string, number> = {}
      const entriesByTable: Record<string, number> = {}
      const entriesByUser: Record<string, number> = {}

      entries.forEach(entry => {
        // By action
        entriesByAction[entry.action] = (entriesByAction[entry.action] || 0) + 1

        // By table
        entriesByTable[entry.tableName] = (entriesByTable[entry.tableName] || 0) + 1

        // By user
        const userName = entry.user ?
          `${entry.user.firstName} ${entry.user.lastName}` :
          'System/Unknown'
        entriesByUser[userName] = (entriesByUser[userName] || 0) + 1
      })

      // Identify suspicious activities
      const suspiciousActivities = this.identifySuspiciousActivities(entries.map(entry => ({
        id: entry.id,
        tableName: entry.tableName,
        recordId: entry.recordId,
        action: entry.action,
        oldValues: entry.oldValues as Record<string, any> || undefined,
        newValues: entry.newValues as Record<string, any> || undefined,
        changedFields: entry.changedFields,
        userId: entry.userId || undefined,
        ipAddress: entry.ipAddress || undefined,
        userAgent: entry.userAgent || undefined,
        timestamp: entry.timestamp,
        organizationId: entry.organizationId
      })))

      return {
        totalEntries: entries.length,
        entriesByAction,
        entriesByTable,
        entriesByUser,
        suspiciousActivities,
        entries: entries.map(entry => ({
          id: entry.id,
          tableName: entry.tableName,
          recordId: entry.recordId,
          action: entry.action,
          oldValues: entry.oldValues as Record<string, any> || undefined,
          newValues: entry.newValues as Record<string, any> || undefined,
          changedFields: entry.changedFields,
          userId: entry.userId || undefined,
          ipAddress: entry.ipAddress || undefined,
          userAgent: entry.userAgent || undefined,
          timestamp: entry.timestamp,
          organizationId: entry.organizationId
        }))
      }
    } catch (error) {
      console.error('Error generating audit report:', error)
      throw new Error('Failed to generate audit report')
    }
  }

  /**
   * Identify suspicious activities
   */
  private identifySuspiciousActivities(entries: AuditTrailEntry[]): AuditTrailEntry[] {
    const suspicious: AuditTrailEntry[] = []

    // Group entries by user and check for patterns
    const userActivities = new Map<string, AuditTrailEntry[]>()

    entries.forEach(entry => {
      const userId = entry.userId || 'anonymous'
      if (!userActivities.has(userId)) {
        userActivities.set(userId, [])
      }
      userActivities.get(userId)!.push(entry)
    })

    // Check for suspicious patterns
    userActivities.forEach((userEntries, userId) => {
      // Pattern 1: Too many deletions in short time
      const deletions = userEntries.filter(e => e.action === 'DELETE')
      if (deletions.length > 10) {
        suspicious.push(...deletions)
      }

      // Pattern 2: Access outside business hours
      userEntries.forEach(entry => {
        const hour = entry.timestamp.getHours()
        if (hour < 6 || hour > 22) { // Outside 6 AM - 10 PM
          suspicious.push(entry)
        }
      })

      // Pattern 3: Multiple IP addresses for same user in short time
      const recentEntries = userEntries.filter(e =>
        e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      )
      const ipAddresses = new Set(recentEntries.map(e => e.ipAddress).filter(ip => ip))
      if (ipAddresses.size > 3) {
        suspicious.push(...recentEntries)
      }

      // Pattern 4: Rapid consecutive actions
      const sortedEntries = userEntries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      for (let i = 1; i < sortedEntries.length; i++) {
        const timeDiff = sortedEntries[i].timestamp.getTime() - sortedEntries[i-1].timestamp.getTime()
        if (timeDiff < 1000) { // Less than 1 second between actions
          suspicious.push(sortedEntries[i])
        }
      }
    })

    // Remove duplicates
    const uniqueSuspicious = Array.from(
      new Map(suspicious.map(item => [item.id, item])).values()
    )

    return uniqueSuspicious
  }
}

export class FinancialControlsService {
  private organizationId: string

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  /**
   * Get standard financial controls framework
   */
  getStandardFinancialControls(): FinancialControl[] {
    return [
      {
        controlId: 'FC-001',
        controlName: 'Segregation of Duties - Cash Handling',
        controlType: 'PREVENTIVE',
        riskLevel: 'HIGH',
        frequency: 'CONTINUOUS',
        owner: 'Cash Manager',
        description: 'Ensure that cash receipts, deposits, and reconciliations are performed by different individuals',
        procedures: [
          'Cash receipts are recorded by cashier',
          'Daily deposits are prepared by different person',
          'Bank reconciliations performed by accounting clerk',
          'Monthly review by supervisor'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-002',
        controlName: 'Monthly Bank Reconciliations',
        controlType: 'DETECTIVE',
        riskLevel: 'HIGH',
        frequency: 'MONTHLY',
        owner: 'Accounting Manager',
        description: 'Monthly reconciliation of all bank accounts with independent review',
        procedures: [
          'Prepare bank reconciliation within 5 business days of month end',
          'Investigate and resolve all reconciling items',
          'Independent review by controller',
          'Document all adjustments with supporting evidence'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-003',
        controlName: 'Purchase Order Authorization',
        controlType: 'PREVENTIVE',
        riskLevel: 'MEDIUM',
        frequency: 'CONTINUOUS',
        owner: 'Procurement Manager',
        description: 'All purchases above threshold require proper authorization',
        procedures: [
          'Purchase requisitions reviewed and approved by department manager',
          'Purchase orders above $5,000 require controller approval',
          'Purchase orders above $25,000 require CFO approval',
          'All POs matched with receipts and invoices before payment'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-004',
        controlName: 'Inventory Count and Valuation',
        controlType: 'DETECTIVE',
        riskLevel: 'MEDIUM',
        frequency: 'QUARTERLY',
        owner: 'Warehouse Manager',
        description: 'Physical inventory counts with proper valuation controls',
        procedures: [
          'Physical count performed quarterly by independent team',
          'Cycle counts performed monthly for high-value items',
          'Investigate variances greater than 2%',
          'Inventory valuation reviewed by controller'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-005',
        controlName: 'Financial Reporting Review',
        controlType: 'DETECTIVE',
        riskLevel: 'HIGH',
        frequency: 'MONTHLY',
        owner: 'Controller',
        description: 'Monthly financial statements review and approval process',
        procedures: [
          'Monthly financial package prepared within 15 business days',
          'Variance analysis performed on all significant fluctuations',
          'CFO review and approval of financial statements',
          'Board reporting package prepared quarterly'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-006',
        controlName: 'Accounts Receivable Review',
        controlType: 'DETECTIVE',
        riskLevel: 'MEDIUM',
        frequency: 'MONTHLY',
        owner: 'AR Manager',
        description: 'Monthly aging analysis and collection procedures',
        procedures: [
          'Aging report generated monthly',
          'Collection procedures initiated for overdue accounts',
          'Bad debt analysis performed quarterly',
          'Credit limits reviewed annually'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-007',
        controlName: 'Payroll Processing Controls',
        controlType: 'PREVENTIVE',
        riskLevel: 'MEDIUM',
        frequency: 'CONTINUOUS',
        owner: 'HR Manager',
        description: 'Controls over payroll processing and payments',
        procedures: [
          'Timekeeping systems require supervisor approval',
          'Payroll register reviewed by HR manager',
          'Segregation between payroll preparation and approval',
          'Bank account dedicated solely to payroll'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-008',
        controlName: 'System Access Controls',
        controlType: 'PREVENTIVE',
        riskLevel: 'HIGH',
        frequency: 'CONTINUOUS',
        owner: 'IT Manager',
        description: 'Controls over access to financial systems',
        procedures: [
          'Role-based access controls implemented',
          'User access reviewed quarterly',
          'Terminated employees removed immediately',
          'Privileged access requires dual approval'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-009',
        controlName: 'Revenue Recognition Review',
        controlType: 'DETECTIVE',
        riskLevel: 'HIGH',
        frequency: 'MONTHLY',
        owner: 'Revenue Manager',
        description: 'Review of revenue recognition policies and procedures',
        procedures: [
          'Monthly revenue analysis by product/service line',
          'Contract review for complex arrangements',
          'Cut-off testing performed monthly',
          'Revenue policies updated annually'
        ],
        effectiveness: 'EFFECTIVE'
      },
      {
        controlId: 'FC-010',
        controlName: 'Fixed Asset Management',
        controlType: 'DETECTIVE',
        riskLevel: 'MEDIUM',
        frequency: 'ANNUALLY',
        owner: 'Asset Manager',
        description: 'Annual physical verification of fixed assets',
        procedures: [
          'Annual physical verification of all assets',
          'Depreciation calculations reviewed quarterly',
          'Asset disposals properly documented',
          'Insurance coverage reviewed annually'
        ],
        effectiveness: 'EFFECTIVE'
      }
    ]
  }

  /**
   * Perform control testing
   */
  async performControlTest(
    controlId: string,
    testProcedure: string,
    sampleSize: number,
    tester: string
  ): Promise<ControlTestResult> {
    try {
      // Simulate control testing logic
      const exceptionsFound = Math.floor(Math.random() * (sampleSize * 0.1)) // Up to 10% exception rate

      const result: ControlTestResult = {
        testDate: new Date(),
        tester,
        testProcedure,
        sampleSize,
        exceptionsFound,
        exceptionsDescriptions: exceptionsFound > 0 ? [
          'Missing approval signature',
          'Incomplete documentation',
          'Timing difference identified'
        ].slice(0, exceptionsFound) : [],
        conclusion: exceptionsFound === 0 ? 'PASS' :
                   exceptionsFound <= sampleSize * 0.05 ? 'CONDITIONAL_PASS' : 'FAIL',
        retestRequired: exceptionsFound > sampleSize * 0.05
      }

      if (result.conclusion === 'FAIL') {
        result.managementResponse = 'Management acknowledges the control deficiency and will implement corrective measures.'
        result.remediationPlan = 'Additional training will be provided to staff, and enhanced review procedures will be implemented.'
      }

      return result
    } catch (error) {
      console.error('Error performing control test:', error)
      throw new Error('Failed to perform control test')
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    reportType: ComplianceReport['reportType'],
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    try {
      const controls = this.getStandardFinancialControls()

      // Simulate testing results
      const controlsPassed = controls.filter(c => c.effectiveness === 'EFFECTIVE').length
      const controlsFailed = controls.filter(c => c.effectiveness === 'INEFFECTIVE').length

      const materialWeaknesses: MaterialWeakness[] = controlsFailed > 0 ? [
        {
          id: 'MW-001',
          title: 'Segregation of Duties Deficiency',
          description: 'Insufficient segregation of duties in cash handling processes',
          impactArea: 'Cash Management',
          riskRating: 'HIGH',
          identifiedDate: new Date(),
          remediationPlan: 'Hire additional staff and implement enhanced supervisory controls',
          targetCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          status: 'IN_PROGRESS',
          assignedTo: 'CFO'
        }
      ] : []

      const significantDeficiencies: SignificantDeficiency[] = []

      const recommendedActions: RecommendedAction[] = [
        {
          id: 'RA-001',
          title: 'Implement Automated Controls',
          description: 'Deploy automated controls in financial reporting process',
          priority: 'HIGH',
          category: 'SYSTEM_ENHANCEMENT',
          estimatedEffort: '3-6 months',
          estimatedCost: 150000,
          expectedBenefit: 'Reduced manual errors and improved efficiency',
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'RA-002',
          title: 'Enhanced Training Program',
          description: 'Develop comprehensive training program for financial controls',
          priority: 'MEDIUM',
          category: 'TRAINING',
          estimatedEffort: '2-3 months',
          estimatedCost: 25000,
          expectedBenefit: 'Improved control awareness and execution',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }
      ]

      const managementCertification: ManagementCertification = {
        certifiedBy: 'Chief Financial Officer',
        certificationDate: new Date(),
        certificationStatement: 'Management has evaluated the effectiveness of internal controls over financial reporting and believes they are effective as of the reporting date.',
        limitations: ['Assessment based on controls in place as of reporting date'],
        representations: [
          'Controls are designed to provide reasonable assurance',
          'No material weaknesses identified that remain unremediated',
          'Management is committed to maintaining effective controls'
        ]
      }

      return {
        reportId: `CR-${Date.now()}`,
        reportType,
        reportingPeriod: { startDate, endDate },
        overallRating: materialWeaknesses.length > 0 ? 'NEEDS_IMPROVEMENT' : 'COMPLIANT',
        controlsAssessed: controls.length,
        controlsPassed,
        controlsFailed,
        materialWeaknesses,
        significantDeficiencies,
        recommendedActions,
        managementCertification
      }
    } catch (error) {
      console.error('Error generating compliance report:', error)
      throw new Error('Failed to generate compliance report')
    }
  }
}

/**
 * Helper function to create audit entry for database changes
 */
export async function createAuditEntry(
  organizationId: string,
  tableName: string,
  recordId: string,
  action: AuditAction,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  userId?: string,
  request?: {
    ip?: string
    userAgent?: string
  }
): Promise<void> {
  const service = new AuditTrailService(organizationId)

  const changedFields: string[] = []

  if (oldValues && newValues) {
    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key]) {
        changedFields.push(key)
      }
    })
  } else if (newValues) {
    changedFields.push(...Object.keys(newValues))
  }

  await service.createAuditEntry({
    tableName,
    recordId,
    action,
    oldValues,
    newValues,
    changedFields,
    userId,
    ipAddress: request?.ip,
    userAgent: request?.userAgent
  })
}

/**
 * Decorator function for automatic audit logging
 */
export function auditLogged(tableName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)

      // Extract audit information from method context
      const organizationId = this.organizationId || args[0]?.organizationId
      const recordId = result?.id || args[0]?.id
      const action = propertyName.includes('create') ? 'CREATE' :
                    propertyName.includes('update') ? 'UPDATE' :
                    propertyName.includes('delete') ? 'DELETE' : 'VIEW'

      if (organizationId && recordId) {
        await createAuditEntry(
          organizationId,
          tableName,
          recordId,
          action as AuditAction,
          args[1], // oldValues
          result, // newValues
          this.userId
        )
      }

      return result
    }
  }
}

