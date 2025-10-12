// =============================================================================
// USE REPORT EXPORT HOOK
// React hook for easy report exporting with Documents folder support
// =============================================================================

import { useState, useCallback } from 'react';
import { ReportExportService, ExportOptions, ReportData } from '@/lib/financial-reporting/exports/report-export-service';

export interface UseReportExportOptions {
  onSuccess?: (filename: string) => void;
  onError?: (error: Error) => void;
  defaultSaveLocation?: 'downloads' | 'documents' | 'custom';
}

export function useReportExport(options: UseReportExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportService = ReportExportService.getInstance();

  /**
   * Export report with progress tracking
   */
  const exportReport = useCallback(async (
    reportData: ReportData,
    exportOptions: ExportOptions
  ) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Set default save location
      const finalOptions: ExportOptions = {
        saveLocation: options.defaultSaveLocation || 'documents',
        ...exportOptions
      };

      setExportProgress(25);

      await exportService.exportReport(reportData, finalOptions);

      setExportProgress(100);

      if (options.onSuccess) {
        const filename = finalOptions.filename || `${reportData.title}_${Date.now()}`;
        options.onSuccess(filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      if (options.onError) {
        options.onError(error as Error);
      }
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  }, [exportService, options]);

  /**
   * Quick export functions for common financial reports
   */
  const exportFinancialStatement = useCallback(async (
    data: any[],
    title: string,
    period: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ) => {
    const reportData: ReportData = {
      title,
      period,
      organization: 'StockFlow Enterprise',
      generatedDate: new Date().toLocaleString(),
      data,
      metadata: {
        exportedBy: 'Financial Reporting System',
        reportType: 'Financial Statement',
        dataPoints: data.length
      }
    };

    await exportReport(reportData, {
      format,
      includeMetadata: true
    });
  }, [exportReport]);

  const exportIncomeStatement = useCallback(async (
    incomeData: any[],
    period: string,
    format: 'pdf' | 'excel' = 'pdf'
  ) => {
    await exportFinancialStatement(
      incomeData,
      'Income Statement',
      period,
      format
    );
  }, [exportFinancialStatement]);

  const exportBalanceSheet = useCallback(async (
    balanceData: any[],
    period: string,
    format: 'pdf' | 'excel' = 'pdf'
  ) => {
    await exportFinancialStatement(
      balanceData,
      'Balance Sheet',
      period,
      format
    );
  }, [exportFinancialStatement]);

  const exportCashFlow = useCallback(async (
    cashFlowData: any[],
    period: string,
    format: 'pdf' | 'excel' = 'pdf'
  ) => {
    await exportFinancialStatement(
      cashFlowData,
      'Cash Flow Statement',
      period,
      format
    );
  }, [exportFinancialStatement]);

  const exportGeneralLedger = useCallback(async (
    ledgerData: any[],
    accountName: string,
    period: string,
    format: 'excel' | 'csv' = 'excel'
  ) => {
    const reportData: ReportData = {
      title: `General Ledger - ${accountName}`,
      subtitle: 'Detailed Account Transactions',
      period,
      organization: 'StockFlow Enterprise',
      generatedDate: new Date().toLocaleString(),
      data: ledgerData,
      metadata: {
        accountName,
        transactionCount: ledgerData.length,
        reportType: 'General Ledger'
      }
    };

    await exportReport(reportData, { format });
  }, [exportReport]);

  const exportJournalEntries = useCallback(async (
    journalData: any[],
    period: string,
    format: 'excel' | 'csv' = 'excel'
  ) => {
    const reportData: ReportData = {
      title: 'Journal Entries',
      subtitle: 'Complete Journal Entry Listing',
      period,
      organization: 'StockFlow Enterprise',
      generatedDate: new Date().toLocaleString(),
      data: journalData,
      metadata: {
        entryCount: journalData.length,
        reportType: 'Journal Entries'
      }
    };

    await exportReport(reportData, { format });
  }, [exportReport]);

  const exportChartOfAccounts = useCallback(async (
    chartData: any[],
    format: 'excel' | 'csv' = 'excel'
  ) => {
    const reportData: ReportData = {
      title: 'Chart of Accounts',
      subtitle: 'Complete Account Structure',
      period: 'Current',
      organization: 'StockFlow Enterprise',
      generatedDate: new Date().toLocaleString(),
      data: chartData,
      metadata: {
        accountCount: chartData.length,
        reportType: 'Chart of Accounts'
      }
    };

    await exportReport(reportData, { format });
  }, [exportReport]);

  const exportBudgetReport = useCallback(async (
    budgetData: any[],
    budgetName: string,
    period: string,
    summary?: Record<string, any>,
    format: 'excel' | 'pdf' = 'excel'
  ) => {
    const reportData: ReportData = {
      title: `Budget Report - ${budgetName}`,
      subtitle: 'Budget vs Actual Analysis',
      period,
      organization: 'StockFlow Enterprise',
      generatedDate: new Date().toLocaleString(),
      data: budgetData,
      summary,
      metadata: {
        budgetName,
        categoryCount: budgetData.length,
        reportType: 'Budget Report'
      }
    };

    await exportReport(reportData, {
      format,
      includeMetadata: true
    });
  }, [exportReport]);

  const exportFinancialAnalysis = useCallback(async (
    analysisData: any[],
    period: string,
    ratios?: Record<string, any>,
    format: 'pdf' | 'excel' = 'pdf'
  ) => {
    const reportData: ReportData = {
      title: 'Financial Analysis Report',
      subtitle: 'Comprehensive Financial Ratio Analysis',
      period,
      organization: 'StockFlow Enterprise',
      generatedDate: new Date().toLocaleString(),
      data: analysisData,
      summary: ratios,
      metadata: {
        analysisType: 'Financial Ratios',
        ratioCount: ratios ? Object.keys(ratios).length : 0,
        reportType: 'Financial Analysis'
      }
    };

    await exportReport(reportData, {
      format,
      includeMetadata: true,
      includeCharts: true
    });
  }, [exportReport]);

  /**
   * Save report to specific location
   */
  const saveToDocuments = useCallback(async (
    data: any[],
    title: string,
    period: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ) => {
    const reportData: ReportData = {
      title,
      period,
      organization: 'StockFlow Enterprise',
      generatedDate: new Date().toLocaleString(),
      data
    };

    await exportReport(reportData, {
      format,
      saveLocation: 'documents'
    });
  }, [exportReport]);

  const saveToDownloads = useCallback(async (
    data: any[],
    title: string,
    period: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ) => {
    const reportData: ReportData = {
      title,
      period,
      organization: 'StockFlow Enterprise',
      generatedDate: new Date().toLocaleString(),
      data
    };

    await exportReport(reportData, {
      format,
      saveLocation: 'downloads'
    });
  }, [exportReport]);

  /**
   * Check if File System Access API is supported
   */
  const canSaveToDocuments = useCallback(() => {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }, []);

  return {
    // State
    isExporting,
    exportProgress,

    // General export function
    exportReport,

    // Financial statement exports
    exportIncomeStatement,
    exportBalanceSheet,
    exportCashFlow,
    exportFinancialAnalysis,

    // Ledger and journal exports
    exportGeneralLedger,
    exportJournalEntries,
    exportChartOfAccounts,

    // Budget exports
    exportBudgetReport,

    // Location-specific exports
    saveToDocuments,
    saveToDownloads,

    // Utility functions
    canSaveToDocuments
  };
}

export default useReportExport;