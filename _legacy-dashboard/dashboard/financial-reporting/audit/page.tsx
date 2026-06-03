"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Download,
  Eye,
  Filter
} from "lucide-react"
import { useState } from "react"

export default function AuditCompliancePage() {
  const [searchTerm, setSearchTerm] = useState("")

  const auditTrail = [
    {
      id: "AUD001",
      timestamp: "2024-10-09 10:30:15",
      user: "John Smith",
      action: "Journal Entry Created",
      entity: "JE-2024-001",
      details: "Created journal entry for inventory adjustment",
      riskLevel: "Low",
      status: "Completed"
    },
    {
      id: "AUD002",
      timestamp: "2024-10-09 09:15:42",
      user: "Sarah Johnson",
      action: "Financial Report Generated",
      entity: "RPT-Q3-2024",
      details: "Generated Q3 financial statements",
      riskLevel: "Medium",
      status: "Under Review"
    },
    {
      id: "AUD003",
      timestamp: "2024-10-09 08:45:30",
      user: "Mike Davis",
      action: "Account Modified",
      entity: "ACC-4001",
      details: "Updated chart of accounts structure",
      riskLevel: "High",
      status: "Flagged"
    }
  ]

  const complianceChecks = [
    {
      check: "SOX Compliance",
      status: "Passed",
      lastRun: "2024-10-09",
      score: 98
    },
    {
      check: "GAAP Standards",
      status: "Passed",
      lastRun: "2024-10-08",
      score: 95
    },
    {
      check: "Internal Controls",
      status: "Warning",
      lastRun: "2024-10-09",
      score: 87
    },
    {
      check: "Data Integrity",
      status: "Passed",
      lastRun: "2024-10-09",
      score: 99
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Passed":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Passed</Badge>
      case "Warning":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "Low":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Low</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium</Badge>
      case "High":
        return <Badge className="bg-red-100 text-red-700 border-red-200">High</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit & Compliance</h1>
          <p className="text-muted-foreground mt-2">
            Monitor financial transactions, maintain audit trails, and ensure regulatory compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Audit Log
          </Button>
          <Button>
            <Shield className="w-4 h-4 mr-2" />
            Run Compliance Check
          </Button>
        </div>
      </div>

      {/* Compliance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceChecks.map((check, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{check.check}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(check.status)}
                <div className="text-2xl font-bold">{check.score}%</div>
                <p className="text-xs text-muted-foreground">
                  Last run: {check.lastRun}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="audit-trail" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Monitoring</TabsTrigger>
          <TabsTrigger value="controls">Internal Controls</TabsTrigger>
          <TabsTrigger value="reports">Audit Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-trail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete log of all financial system activities and changes
              </CardDescription>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditTrail.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">{entry.timestamp}</TableCell>
                      <TableCell>{entry.user}</TableCell>
                      <TableCell>{entry.action}</TableCell>
                      <TableCell className="font-mono">{entry.entity}</TableCell>
                      <TableCell>{getRiskBadge(entry.riskLevel)}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === "Completed" ? "default" : "secondary"}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>
                Real-time monitoring of regulatory compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Compliance monitoring dashboard will be available here</p>
                <p className="text-sm">Track SOX, GAAP, and other regulatory requirements</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Internal Controls</CardTitle>
              <CardDescription>
                Management and monitoring of internal financial controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Internal controls management will be available here</p>
                <p className="text-sm">Configure and monitor segregation of duties, approval workflows</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Reports</CardTitle>
              <CardDescription>
                Generate and manage audit reports and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Audit report generation will be available here</p>
                <p className="text-sm">Create comprehensive audit reports for external auditors</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}