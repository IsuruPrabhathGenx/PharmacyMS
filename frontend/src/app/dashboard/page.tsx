'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { saleService } from '@/services/saleService';
import { purchaseService } from '@/services/purchaseService';
import { inventoryService } from '@/services/inventoryService';
import { dashboardService } from '@/services/dashboardService';
import { format } from 'date-fns';
import { Loader2, TrendingUp, ShoppingCart, Receipt, DollarSign, Calendar, AlertCircle, ArrowUpRight, BarChart3 } from 'lucide-react';
import DashboardExtension from '@/components/DashboardExtension';

import { Sale } from '@/types/sale';
import { Purchase } from '@/types/purchase';
import { InventoryItem } from '@/types/inventory';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data states
  const [dashboardSummary, setDashboardSummary] = useState({
    todaySales: 0,
    monthSales: 0,
    monthProfit: 0,
    purchaseCost: 0,
    salesGrowth: 0,
    dailyGrowth: 0,
    lowStockItems: [] as any[]
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [paymentMethodStats, setPaymentMethodStats] = useState<any[]>([]);
  const [profitMetrics, setProfitMetrics] = useState({
    grossMargin: 0,
    netProfit: 0,
    roi: 0
  });
  
  // Additional data for extension component
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [pharmacyItems, setPharmacyItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all the data in parallel for better performance
      const [
        summary, 
        chartDataResult, 
        paymentMethods, 
        metrics,
        salesData,
        purchasesData,
        inventoryData
      ] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getChartData(),
        dashboardService.getPaymentMethodStats(),
        dashboardService.getProfitMetrics(),
        saleService.getAll(),
        purchaseService.getAll(),
        inventoryService.getAll()
      ]);
      
      // Set all the state variables with the retrieved data
      setDashboardSummary(summary);
      setChartData(chartDataResult);
      setPaymentMethodStats(paymentMethods);
      setProfitMetrics(metrics);
      setAllSales(salesData);
      setAllPurchases(purchasesData);
      setPharmacyItems(inventoryData);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-gradient-to-b from-indigo-50 to-blue-50">
        <div className="px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-medium">{format(new Date(), 'MMMM d, yyyy')}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Today's Sales</p>
                  <p className="text-3xl font-bold">Rs{dashboardSummary.todaySales.toFixed(2)}</p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+{dashboardSummary.dailyGrowth.toFixed(1)}% from yesterday</span>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">Monthly Sales</p>
                  <p className="text-3xl font-bold">Rs{dashboardSummary.monthSales.toFixed(2)}</p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+{dashboardSummary.salesGrowth.toFixed(1)}% this month</span>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-100">Monthly Profit</p>
                  <p className="text-3xl font-bold">Rs{dashboardSummary.monthProfit.toFixed(2)}</p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>{dashboardSummary.monthSales > 0 ? ((dashboardSummary.monthProfit / dashboardSummary.monthSales) * 100).toFixed(1) : 0}% margin</span>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-6 shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">Purchase Cost</p>
                  <p className="text-3xl font-bold">Rs{dashboardSummary.purchaseCost.toFixed(2)}</p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span>Total inventory investment</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-lg md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Financial Overview</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Purchase Analysis</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="purchases" fill="#f59e0b" name="Purchases" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Profit Metrics</h2>
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Gross Margin</span>
                    <span className="text-sm font-medium">{profitMetrics.grossMargin.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(profitMetrics.grossMargin, 100)}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Net Profit</span>
                    <span className="text-sm font-medium">{profitMetrics.netProfit.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(profitMetrics.netProfit, 100)}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Return on Investment</span>
                    <span className="text-sm font-medium">{profitMetrics.roi.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(profitMetrics.roi, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Payment Methods</h2>
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={paymentMethodStats}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis type="category" dataKey="name" stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`${value}%`, 'Percentage']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {paymentMethodStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Low Stock Alert</h2>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {dashboardSummary.lowStockItems.length > 0 ? (
                  dashboardSummary.lowStockItems.map((item, index) => (
                    <div key={item._id || index} className="flex items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.type} - Current: {item.currentStock || 0} / Min: {item.minQuantity}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No low stock items</p>
                )}
              </div>
            </div>
          </div>

          <DashboardExtension 
            allSales={allSales} 
            allPurchases={allPurchases}
            pharmacyItems={pharmacyItems}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

// 'use client';

// import { useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import DashboardLayout from '@/components/DashboardLayout';
// import DashboardComponent from '@/components/DashboardComponent';

// export default function DashboardPage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push('/');
//     }
//   }, [user, loading, router]);

//   if (loading || !user) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           <p className="mt-4 text-lg text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <DashboardComponent />
//     </DashboardLayout>
//   );
// }