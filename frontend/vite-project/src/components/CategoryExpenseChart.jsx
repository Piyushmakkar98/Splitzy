// src/components/CategoryExpenseChart.jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF42A1'];

export default function CategoryExpenseChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No category data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%" 
          labelLine={false}
          // ✨ Change radius from pixels to percentages
          innerRadius="30%" 
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          paddingAngle={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A202C',
            border: '1px solid #4A5568',
            borderRadius: '10px',
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          align="center" 
          height={36}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}