// src/components/MonthlyExpenseChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// This component expects an array of data in this format:
// [{ name: 'Month', spent: 1234 }, ...]
export default function MonthlyExpenseChart({ data }) {
  return (
    // This makes the chart automatically fill the size of its parent container
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 30,
        }}
      >
        {/* Adds the faint grid lines in the background */}
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        
        {/* Defines the horizontal axis using the 'name' key from your data */}
        <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} />
        
        {/* Defines the vertical axis */}
        <YAxis stroke="#A0AEC0" fontSize={12} />
        
        {/* Creates the pop-up that appears when you hover over a bar */}
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A202C',
            border: '1px solid #4A5568',
            borderRadius: '10px',
          }}
          cursor={{ fill: 'rgba(56, 178, 172, 0.1)' }}
        />
        
        {/* The label for the data series */}
        <Legend />
        
        {/* Draws the actual bars, using the 'spent' key from your data for the height */}
        <Bar dataKey="spent" fill="#38B2AC" /> 
      </BarChart>
    </ResponsiveContainer>
  );
}