"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

interface StockHistoryChartProps {
  data: Array<{
    date: string;
    stock: number;
    transactions?: number;
  }>;
  reorderPoint: number;
  minStockLevel: number;
  itemName: string;
}

export default function StockHistoryChart({
  data,
  reorderPoint,
  minStockLevel,
  itemName
}: StockHistoryChartProps) {
  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    reorderPoint,
    minStockLevel
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4">
          <div className="font-medium text-slate-900 dark:text-white mb-2">{label}</div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Stock Level:</span>
              <span className="font-medium text-slate-900 dark:text-white">{data.stock} units</span>
            </div>
            {data.transactions && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-600 dark:text-slate-400">Transactions:</span>
                <span className="font-medium text-slate-900 dark:text-white">{data.transactions}</span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Reorder Point:</span>
                <span className="font-medium text-orange-600">{reorderPoint} units</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Min Level:</span>
                <span className="font-medium text-red-600">{minStockLevel} units</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-slate-600 dark:text-slate-400">Stock Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-orange-500 rounded"></div>
          <span className="text-slate-600 dark:text-slate-400">Reorder Point</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-red-500 rounded"></div>
          <span className="text-slate-600 dark:text-slate-400">Minimum Level</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="formattedDate"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference lines for reorder point and minimum level */}
            <ReferenceLine
              y={reorderPoint}
              stroke="#f59e0b"
              strokeDasharray="8 8"
              strokeWidth={2}
              label={{
                value: `Reorder Point (${reorderPoint})`,
                position: "left",
                style: { fill: "#f59e0b", fontSize: "12px" }
              }}
            />
            <ReferenceLine
              y={minStockLevel}
              stroke="#ef4444"
              strokeDasharray="8 8"
              strokeWidth={2}
              label={{
                value: `Min Level (${minStockLevel})`,
                position: "left",
                style: { fill: "#ef4444", fontSize: "12px" }
              }}
            />

            <Area
              type="monotone"
              dataKey="stock"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#stockGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data[data.length - 1]?.stock || 0}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Current Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.max(...data.map(d => d.stock))}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Peak Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {Math.min(...data.map(d => d.stock))}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Lowest Level</div>
        </div>
      </div>
    </div>
  );
}