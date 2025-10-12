# Presence Monitoring Schema Addition

Add these models to your existing `prisma/schema.prisma` file:

```prisma
// Employee Presence Monitoring Models
model EmployeePresenceSession {
  id                    String    @id @default(cuid())
  userId                String
  locationId            String
  organizationId        String
  terminalId            String?
  status                PresenceStatus @default(CLOCKED_IN)
  clockInTime           DateTime  @default(now())
  clockOutTime          DateTime?
  expectedClockOutTime  DateTime?
  totalMinutesWorked    Int       @default(0)
  totalBreakMinutes     Int       @default(0)
  overtime              Boolean   @default(false)
  overtimeMinutes       Int       @default(0)
  notes                 String?
  clockInMethod         ClockMethod @default(MANUAL)
  clockOutMethod        ClockMethod?
  ipAddress             String?
  deviceInfo            Json?
  geolocation           Json?
  approvedById          String?
  approvedAt            DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  user           User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  location       Location                @relation(fields: [locationId], references: [id], onDelete: Cascade)
  organization   Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  terminal       POSStation?             @relation(fields: [terminalId], references: [id], onDelete: SetNull)
  approver       User?                   @relation("PresenceApprover", fields: [approvedById], references: [id])
  activityLogs   EmployeeActivityLog[]
  breakSessions  EmployeeBreakSession[]

  @@unique([userId], where: { status: { in: [CLOCKED_IN, ON_BREAK] } })
  @@index([userId])
  @@index([organizationId])
  @@index([locationId])
  @@index([status])
  @@index([clockInTime])
  @@map("employee_presence_sessions")
}

model EmployeeActivityLog {
  id                String   @id @default(cuid())
  presenceSessionId String
  userId            String
  activityType      ActivityType
  description       String?
  timestamp         DateTime @default(now())
  duration          Int?
  metadata          Json?
  systemGenerated   Boolean  @default(false)

  // Relations
  presenceSession EmployeePresenceSession @relation(fields: [presenceSessionId], references: [id], onDelete: Cascade)
  user            User                    @relation("UserActivityLogs", fields: [userId], references: [id], onDelete: Cascade)

  @@index([presenceSessionId])
  @@index([userId])
  @@index([timestamp])
  @@index([activityType])
  @@map("employee_activity_logs")
}

model EmployeeBreakSession {
  id                String    @id @default(cuid())
  presenceSessionId String
  userId            String
  breakType         BreakType @default(REGULAR)
  startTime         DateTime  @default(now())
  endTime           DateTime?
  expectedDuration  Int?
  actualDuration    Int?
  reason            String?
  notes             String?
  approvedById      String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  presenceSession EmployeePresenceSession @relation(fields: [presenceSessionId], references: [id], onDelete: Cascade)
  user            User                    @relation("UserBreakSessions", fields: [userId], references: [id], onDelete: Cascade)
  approver        User?                   @relation("BreakApprover", fields: [approvedById], references: [id])

  @@index([presenceSessionId])
  @@index([userId])
  @@index([startTime])
  @@map("employee_break_sessions")
}

model EmployeeSchedule {
  id             String    @id @default(cuid())
  userId         String
  organizationId String
  locationId     String?
  dayOfWeek      Int       // 0 = Sunday, 1 = Monday, etc.
  startTime      String    // "09:00"
  endTime        String    // "17:00"
  isActive       Boolean   @default(true)
  effectiveFrom  DateTime
  effectiveUntil DateTime?
  breakDurations Json?     // Array of break durations
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  user         User         @relation("UserSchedules", fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  location     Location?    @relation("ScheduleLocation", fields: [locationId], references: [id], onDelete: SetNull)

  @@unique([userId, dayOfWeek, locationId, effectiveFrom], where: { isActive: true })
  @@index([userId])
  @@index([organizationId])
  @@index([dayOfWeek])
  @@map("employee_schedules")
}

model PresenceAlert {
  id              String    @id @default(cuid())
  userId          String
  organizationId  String
  alertType       AlertType
  severity        AlertSeverity @default(LOW)
  title           String
  description     String?
  isRead          Boolean   @default(false)
  isResolved      Boolean   @default(false)
  resolvedById    String?
  resolvedAt      DateTime?
  resolutionNotes String?
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  user         User  @relation("UserPresenceAlerts", fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation("OrgPresenceAlerts", fields: [organizationId], references: [id], onDelete: Cascade)
  resolver     User? @relation("AlertResolver", fields: [resolvedById], references: [id])

  @@index([userId])
  @@index([organizationId])
  @@index([alertType])
  @@index([isRead])
  @@index([severity])
  @@map("presence_alerts")
}

model AttendanceReport {
  id                   String    @id @default(cuid())
  userId               String
  organizationId       String
  locationId           String?
  reportDate           DateTime  @db.Date
  scheduledMinutes     Int       @default(0)
  actualMinutes        Int       @default(0)
  breakMinutes         Int       @default(0)
  overtimeMinutes      Int       @default(0)
  lateArrivalMinutes   Int       @default(0)
  earlyDepartureMinutes Int      @default(0)
  attendanceScore      Decimal   @default(100.00) @db.Decimal(5,2)
  productivity         Decimal?  @db.Decimal(5,2)
  notes                String?
  generatedAt          DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Relations
  user         User         @relation("UserAttendanceReports", fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation("OrgAttendanceReports", fields: [organizationId], references: [id], onDelete: Cascade)
  location     Location?    @relation("LocationAttendanceReports", fields: [locationId], references: [id], onDelete: SetNull)

  @@unique([userId, reportDate, locationId])
  @@index([userId])
  @@index([organizationId])
  @@index([reportDate])
  @@map("attendance_reports")
}

// Add these relations to existing User model
// Add these to your existing User model relations:
//   presenceSessions      EmployeePresenceSession[]
//   approvedSessions      EmployeePresenceSession[] @relation("PresenceApprover")
//   activityLogs          EmployeeActivityLog[]     @relation("UserActivityLogs")
//   breakSessions         EmployeeBreakSession[]    @relation("UserBreakSessions")
//   approvedBreaks        EmployeeBreakSession[]    @relation("BreakApprover")
//   schedules             EmployeeSchedule[]        @relation("UserSchedules")
//   presenceAlerts        PresenceAlert[]           @relation("UserPresenceAlerts")
//   resolvedAlerts        PresenceAlert[]           @relation("AlertResolver")
//   attendanceReports     AttendanceReport[]        @relation("UserAttendanceReports")

// Add these relations to existing Organization model:
//   presenceSessions      EmployeePresenceSession[]
//   employeeSchedules     EmployeeSchedule[]
//   presenceAlerts        PresenceAlert[]           @relation("OrgPresenceAlerts")
//   attendanceReports     AttendanceReport[]        @relation("OrgAttendanceReports")

// Add these relations to existing Location model:
//   presenceSessions      EmployeePresenceSession[]
//   employeeSchedules     EmployeeSchedule[]        @relation("ScheduleLocation")
//   attendanceReports     AttendanceReport[]        @relation("LocationAttendanceReports")

// Add this relation to existing POSStation model:
//   presenceSessions      EmployeePresenceSession[]

// Enums
enum PresenceStatus {
  CLOCKED_IN
  ON_BREAK
  CLOCKED_OUT
  OVERTIME
  LATE
  ABSENT
  OFFLINE
}

enum ClockMethod {
  MANUAL
  BIOMETRIC
  CARD_SWIPE
  MOBILE_APP
  WEB_BROWSER
  QR_CODE
  NFC
  GEOFENCE
}

enum ActivityType {
  CLOCK_IN
  CLOCK_OUT
  BREAK_START
  BREAK_END
  TASK_START
  TASK_END
  SYSTEM_LOGIN
  SYSTEM_LOGOUT
  POS_TRANSACTION
  INVENTORY_UPDATE
  CUSTOMER_SERVICE
  CLEANING
  RESTOCKING
  TRAINING
  MEETING
  ADMIN_TASK
  SYSTEM_IDLE
  SYSTEM_ACTIVE
  LOCATION_CHANGE
  OTHER
}

enum BreakType {
  LUNCH
  SHORT_BREAK
  PERSONAL
  TRAINING
  MEETING
  EMERGENCY
  SICK
  REGULAR
  EXTENDED
}

enum AlertType {
  LATE_ARRIVAL
  EARLY_DEPARTURE
  MISSED_CLOCK_OUT
  EXTENDED_BREAK
  NO_SHOW
  OVERTIME_ALERT
  SCHEDULE_CONFLICT
  UNUSUAL_ACTIVITY
  LOCATION_MISMATCH
  SYSTEM_ERROR
}

enum AlertSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
  URGENT
}
```

## Integration Points

The presence monitoring system integrates with your existing:

1. **User Management** - Uses existing user records
2. **Location System** - Tracks presence per location
3. **POS Terminals** - Can clock in/out from specific terminals
4. **Role-Based Access** - Respects existing permission system
5. **Organization Structure** - Multi-tenant support