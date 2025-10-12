// src/components/ChartCard.jsx
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const sampleData = [
  { name: "Mon", value: 10 },
  { name: "Tue", value: 25 },
  { name: "Wed", value: 18 },
  { name: "Thu", value: 35 },
  { name: "Fri", value: 28 },
  { name: "Sat", value: 22 },
  { name: "Sun", value: 30 },
];

const ChartCard = ({ title, type }) => {
  const Chart = type === "bar" ? BarChart : LineChart;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        {type === "bar" ? (
          <BarChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1B998B" radius={[10, 10, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#1B998B" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;
