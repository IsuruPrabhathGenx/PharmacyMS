// src/app/dashboard/viewSales/SalesLineChart.tsx
import React from 'react';
import { TimeSeriesDataPoint } from '@/services/salesReportService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesLineChartProps {
  chartData: TimeSeriesDataPoint[];
  timeInterval: 'day' | 'week' | 'month';
}

const SalesLineChart: React.FC<SalesLineChartProps> = ({ chartData, timeInterval }) => {
  // Format date labels according to interval
  const formatDate = (date: string) => {
    try {
      if (timeInterval === 'month') {
        // Format YYYY-MM to MMM YYYY
        const [year, month] = date.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      } else if (timeInterval === 'week') {
        // Format YYYY-WW to Week WW, YYYY
        const [year, weekNum] = date.split('-W');
        return `Week ${weekNum}, ${year}`;
      } else {
        // Format YYYY-MM-DD to DD MMM
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
      }
    } catch (err) {
      return date;
    }
  };

  // Prepare formatted data for the chart
  const formattedData = chartData.map((point) => ({
    ...point,
    formattedDate: formatDate(point.date),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="formattedDate" 
          tick={{ fontSize: 12 }}
          interval={formattedData.length > 15 ? Math.floor(formattedData.length / 15) : 0}
        />
        <YAxis 
          yAxisId="left"
          orientation="left"
          tickFormatter={(value) => `Rs${value}`}
        />
        <Tooltip 
          formatter={(value: number) => `Rs${value.toFixed(2)}`}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="sales"
          name="Sales"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="cost"
          name="Cost"
          stroke="#f87171"
          strokeWidth={2}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="#4ade80"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesLineChart;