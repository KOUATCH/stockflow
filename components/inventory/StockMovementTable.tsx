"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Package,
  Truck,
  User,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StockMovement {
  id: string;
  date: string;
  type: string;
  quantity: number;
  reason: string;
  user: string;
  stockAfter: number;
}

interface StockMovementTableProps {
  movements: StockMovement[];
}

export default function StockMovementTable({ movements }: StockMovementTableProps) {
  const getMovementConfig = (type: string, quantity: number) => {
    const isInbound = quantity > 0;

    switch (type) {
      case 'INBOUND':
        return {
          icon: <ArrowUp className="w-4 h-4" />,
          variant: "default" as const,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          label: "Stock In"
        };
      case 'OUTBOUND':
        return {
          icon: <ArrowDown className="w-4 h-4" />,
          variant: "secondary" as const,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          label: "Stock Out"
        };
      case 'ADJUSTMENT_IN':
        return {
          icon: <RotateCcw className="w-4 h-4" />,
          variant: "outline" as const,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          label: "Adjustment +"
        };
      case 'ADJUSTMENT_OUT':
        return {
          icon: <RotateCcw className="w-4 h-4" />,
          variant: "outline" as const,
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
          label: "Adjustment -"
        };
      case 'TRANSFER_IN':
        return {
          icon: <Truck className="w-4 h-4" />,
          variant: "default" as const,
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
          label: "Transfer In"
        };
      case 'TRANSFER_OUT':
        return {
          icon: <Truck className="w-4 h-4" />,
          variant: "secondary" as const,
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
          label: "Transfer Out"
        };
      default:
        return {
          icon: <Package className="w-4 h-4" />,
          variant: "outline" as const,
          color: "text-slate-600 dark:text-slate-400",
          bgColor: "bg-slate-100 dark:bg-slate-800",
          label: type
        };
    }
  };

  return (
    <div className="space-y-4">
      {movements.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <div className="text-slate-600 dark:text-slate-400">No stock movements found</div>
          <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Stock movements will appear here as they occur
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-semibold">Date & Time</TableHead>
                <TableHead className="font-semibold">Movement Type</TableHead>
                <TableHead className="font-semibold text-right">Quantity</TableHead>
                <TableHead className="font-semibold">Reason</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold text-right">Stock After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => {
                const config = getMovementConfig(movement.type, movement.quantity);
                const isPositive = movement.quantity > 0;

                return (
                  <TableRow key={movement.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {new Date(movement.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(movement.date), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <div className={config.color}>
                            {config.icon}
                          </div>
                        </div>
                        <div>
                          <Badge variant={config.variant} className="mb-1">
                            {config.label}
                          </Badge>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {movement.type.replace('_', ' ').toLowerCase()}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className={`text-lg font-bold ${
                          isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isPositive ? '+' : ''}{movement.quantity}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          units
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                          {movement.reason}
                        </div>
                        {movement.reason.includes('#') && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Reference: {movement.reason.match(/#[\w-]+/)?.[0]}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                          <User className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white text-sm">
                            {movement.user}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {movement.user === 'System' ? 'Automated' : 'Manual'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {movement.stockAfter}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          remaining
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary Statistics */}
      {movements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {movements.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0)}
            </div>
            <div className="text-sm text-green-700 dark:text-green-500">Total Inbound</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {Math.abs(movements.filter(m => m.quantity < 0).reduce((sum, m) => sum + m.quantity, 0))}
            </div>
            <div className="text-sm text-red-700 dark:text-red-500">Total Outbound</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {movements.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-500">Total Movements</div>
          </div>
        </div>
      )}
    </div>
  );
}