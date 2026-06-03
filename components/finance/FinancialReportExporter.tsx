"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  Mail,
  Calendar,
  Settings,
  Check,
  Clock,
  AlertCircle,
  Printer,
  Share2,
  Filter,
  Eye
} from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: "financial-statement" | "analytics" | "performance" | "forecast"
  format: string[]
  sections: string[]
  lastUsed: string
}

interface ExportHistory {
  id: string
  reportName: string
  format: string
  exportedAt: string
  status: "completed" | "failed" | "processing"
  downloadUrl?: string
  fileSize?: string
}

export function FinancialReportExporter() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf")
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [exportPeriod, setExportPeriod] = useState<string>("current-month")
  const [isExporting, setIsExporting] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [reportTitle, setReportTitle] = useState("")
  const [reportNotes, setReportNotes] = useState("")
  const { success, error, info } = useNotifications()

  const reportTemplates: ReportTemplate[] = [
    {
      id: "complete-financial",
      name: "Complete Financial Report",
      description: "Comprehensive financial analysis including all statements and KPIs",
      type: "financial-statement",
      format: ["pdf", "excel", "powerpoint"],
      sections: ["Balance Sheet", "Income Statement", "Cash Flow", "Key Metrics", "Trend Analysis", "Forecasts"],
      lastUsed: "2024-03-15"
    },
    {
      id: "executive-summary",
      name: "Executive Summary",
      description: "High-level financial overview for executive presentations",
      type: "analytics",
      format: ["pdf", "powerpoint"],
      sections: ["Key Metrics", "Performance Summary", "Highlights", "Recommendations"],
      lastUsed: "2024-03-12"
    },
    {
      id: "profit-loss",
      name: "Profit & Loss Statement",
      description: "Detailed income statement with period comparisons",
      type: "financial-statement",
      format: ["pdf", "excel", "csv"],
      sections: ["Revenue", "Cost of Sales", "Operating Expenses", "Net Income", "Margins"],
      lastUsed: "2024-03-10"
    },
    {
      id: "cash-flow-analysis",
      name: "Cash Flow Analysis",
      description: "Cash flow statement with detailed categorization",
      type: "financial-statement",
      format: ["pdf", "excel"],
      sections: ["Operating Activities", "Investing Activities", "Financing Activities", "Net Cash Flow"],
      lastUsed: "2024-03-08"
    },
    {
      id: "customer-performance",
      name: "Customer Performance Report",
      description: "Customer analytics and performance metrics",
      type: "performance",
      format: ["pdf", "excel"],
      sections: ["Top Customers", "Customer Trends", "Lifetime Value", "Retention Analysis"],
      lastUsed: "2024-03-05"
    },
    {
      id: "financial-forecast",
      name: "Financial Forecast Report",
      description: "Predictive analysis and scenario planning",
      type: "forecast",
      format: ["pdf", "powerpoint"],
      sections: ["Revenue Forecast", "Scenario Analysis", "Confidence Intervals", "Recommendations"],
      lastUsed: "2024-03-01"
    }
  ]

  const exportHistory: ExportHistory[] = [
    {
      id: "exp-001",
      reportName: "Complete Financial Report - March 2024",
      format: "PDF",
      exportedAt: "2024-03-15 14:30",
      status: "completed",
      downloadUrl: "/downloads/financial-report-march.pdf",
      fileSize: "2.4 MB"
    },
    {
      id: "exp-002",
      reportName: "Executive Summary - Q1 2024",
      format: "PowerPoint",
      exportedAt: "2024-03-12 09:15",
      status: "completed",
      downloadUrl: "/downloads/executive-summary-q1.pptx",
      fileSize: "1.8 MB"
    },
    {
      id: "exp-003",
      reportName: "Customer Performance Analysis",
      format: "Excel",
      exportedAt: "2024-03-10 16:45",
      status: "failed",
      fileSize: "N/A"
    },
    {
      id: "exp-004",
      reportName: "Cash Flow Statement - February",
      format: "PDF",
      exportedAt: "2024-03-08 11:20",
      status: "completed",
      downloadUrl: "/downloads/cashflow-feb.pdf",
      fileSize: "856 KB"
    }
  ]

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = reportTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedSections(template.sections)
      setReportTitle(template.name)
    }
  }

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleExport = async () => {
    if (!selectedTemplate || selectedSections.length === 0) {
      error("Export Not Ready", "Please select a template and at least one section.")
      return
    }

    setIsExporting(true)
    info("Generating Report", "Financial report generation is in progress.")

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      success("Report Exported", `Financial report exported successfully as ${selectedFormat.toUpperCase()}.`)
    }, 3000)
  }

  const handleScheduleExport = () => {
    info("Export Scheduled", "Scheduled export has been configured.")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="w-4 h-4 text-green-600" />
      case "failed": return <AlertCircle className="w-4 h-4 text-red-600" />
      case "processing": return <Clock className="w-4 h-4 text-blue-600" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      case "failed": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      case "processing": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "pdf": return <FileText className="w-4 h-4" />
      case "excel": case "csv": return <FileSpreadsheet className="w-4 h-4" />
      case "powerpoint": return <FileImage className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-opacity-60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Financial Report Exporter
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Generate and export comprehensive financial reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-0 shadow-lg">
          <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            Create Export
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            Export History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Report Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                            {template.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {template.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Formats:</span>
                          <div className="flex gap-1">
                            {template.format.map((fmt) => (
                              <Badge key={fmt} variant="outline" className="text-xs px-1 py-0">
                                {fmt.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Report Configuration */}
              {selectedTemplate && (
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Report Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="report-title">Report Title</Label>
                        <Input
                          id="report-title"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          placeholder="Enter report title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="period">Report Period</Label>
                        <Select value={exportPeriod} onValueChange={setExportPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current-month">Current Month</SelectItem>
                            <SelectItem value="last-month">Last Month</SelectItem>
                            <SelectItem value="current-quarter">Current Quarter</SelectItem>
                            <SelectItem value="last-quarter">Last Quarter</SelectItem>
                            <SelectItem value="current-year">Current Year</SelectItem>
                            <SelectItem value="last-year">Last Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2">
                      <Label>Export Format</Label>
                      <div className="flex gap-3">
                        {reportTemplates.find(t => t.id === selectedTemplate)?.format.map((format) => (
                          <Button
                            key={format}
                            variant={selectedFormat === format ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFormat(format)}
                            className="flex items-center gap-2"
                          >
                            {getFormatIcon(format)}
                            {format.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-2">
                      <Label>Report Sections</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {reportTemplates.find(t => t.id === selectedTemplate)?.sections.map((section) => (
                          <div key={section} className="flex items-center space-x-2">
                            <Checkbox
                              id={section}
                              checked={selectedSections.includes(section)}
                              onCheckedChange={() => handleSectionToggle(section)}
                            />
                            <label
                              htmlFor={section}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {section}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={reportNotes}
                        onChange={(e) => setReportNotes(e.target.value)}
                        placeholder="Add any additional notes or comments for this report"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions Panel */}
            <div className="space-y-6">
              {/* Export Actions */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">Export Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleExport}
                    disabled={!selectedTemplate || selectedSections.length === 0 || isExporting}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Generating..." : "Generate & Download"}
                  </Button>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Report To</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="recipient@example.com"
                      />
                      <Button variant="outline" size="icon">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button variant="outline" className="w-full mb-2">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Report
                    </Button>
                    <Button variant="outline" className="w-full mb-2">
                      <Printer className="w-4 h-4 mr-2" />
                      Print Report
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Link
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Exports */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleScheduleExport} variant="outline" className="w-full">
                    <Clock className="w-4 h-4 mr-2" />
                    Setup Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.type}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleTemplateSelect(template.id)}>
                      Use Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {template.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Sections:</span>
                      <span className="text-xs text-slate-500">{template.sections.length} included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Formats:</span>
                      <div className="flex gap-1">
                        {template.format.map((fmt) => (
                          <Badge key={fmt} variant="outline" className="text-xs px-1 py-0">
                            {fmt.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Last used: {template.lastUsed}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Export History</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportHistory.map((export_item) => (
                  <div key={export_item.id} className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getFormatIcon(export_item.format)}
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                            {export_item.reportName}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {export_item.exportedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getStatusColor(export_item.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(export_item.status)}
                            {export_item.status}
                          </span>
                        </Badge>
                        {export_item.status === "completed" && (
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Format: {export_item.format}</span>
                      {export_item.fileSize && <span>Size: {export_item.fileSize}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
