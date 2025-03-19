import React from 'react';
import { 
  Package2, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  DollarSign 
} from 'lucide-react';
import { Sale } from '@/types/sale';
import { Purchase } from '@/types/purchase';
import { InventoryItem } from '@/types/inventory';

// Custom Progress Component
const Progress = ({ value = 0 }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div 
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface DashboardExtensionProps {
  allSales: Sale[];
  allPurchases: Purchase[];
  pharmacyItems: InventoryItem[];
}

const DashboardExtension: React.FC<DashboardExtensionProps> = ({ 
  allSales, 
  allPurchases, 
  pharmacyItems 
}) => {
  // Calculate payment method distribution
  const paymentMethodStats = allSales.reduce((acc, sale) => {
    const method = sale.paymentMethod || 'unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSales = allSales.length;
  const paymentDistribution = Object.entries(paymentMethodStats).map(([method, count]) => ({
    method: method.toUpperCase(),
    percentage: (count / totalSales) * 100
  }));

  // Calculate low stock items
  const lowStockItems = pharmacyItems
    .filter(item => {
      const itemBatches = allPurchases.flatMap(p => 
        p.items.filter(i => i.itemId === item.id)
      );
      const totalQuantity = itemBatches.reduce((sum, batch) => sum + batch.totalQuantity, 0);
      return totalQuantity <= item.minQuantity;
    })
    .slice(0, 5);

  // Calculate top selling products
  const productSales = allSales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      acc[item.item.name] = (acc[item.item.name] || 0) + (item.unitQuantity || 0);
    });
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  // Calculate customer statistics
  const uniqueCustomers = new Set(allSales.map(sale => sale.customerId).filter(Boolean)).size;
  const repeatCustomers = allSales.reduce((acc, sale) => {
    if (sale.customerId) {
      acc[sale.customerId] = (acc[sale.customerId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const loyalCustomerCount = Object.values(repeatCustomers)
    .filter(count => count > 3).length;

  return (
    <div className="mt-6 space-y-6">
      {/* Additional Statistics */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{pharmacyItems.length}</p>
            </div>
            <div className="rounded-full bg-purple-50 p-3">
              <Package2 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold">{lowStockItems.length}</p>
            </div>
            <div className="rounded-full bg-amber-50 p-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unique Customers</p>
              <p className="text-2xl font-bold">{uniqueCustomers}</p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="text-2xl font-bold">
                Rs{(allSales.reduce((sum, sale) => sum + sale.totalAmount, 0) / allSales.length).toFixed(2)}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>
        <div className="space-y-4">
          {paymentDistribution.map(({ method, percentage }) => (
            <div key={method} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{method}</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
              <Progress value={percentage} />
            </div>
          ))}
        </div>
      </div>

      {/* Top Products and Low Stock Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {topProducts.map(({ name, quantity }) => (
              <div key={name} className="flex justify-between items-center">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-sm text-gray-500">{quantity} units sold</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alert
          </h3>
          <div className="space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-red-500">
                    Low Stock
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No items are running low on stock</p>
            )}
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Insights
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Total Unique Customers</p>
            <p className="text-2xl font-bold">{uniqueCustomers}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Loyal Customers</p>
            <p className="text-2xl font-bold">{loyalCustomerCount}</p>
            <p className="text-xs text-gray-500">(More than 3 purchases)</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Recent Transactions</p>
            <p className="text-2xl font-bold">
              {allSales.filter(sale => {
                const saleDate = new Date(sale.saleDate);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return saleDate >= thirtyDaysAgo;
              }).length}
            </p>
            <p className="text-xs text-gray-500">(Last 30 days)</p>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Sales
        </h3>
        <div className="space-y-4">
          {allSales.slice(0, 5).map((sale) => (
            <div key={sale.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">
                  {sale.customer?.name || 'Walk-in Customer'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(sale.saleDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Rs{sale.totalAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{sale.items.length} items</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardExtension;