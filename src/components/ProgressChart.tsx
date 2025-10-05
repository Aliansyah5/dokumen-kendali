import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ProgressStats } from "../types";

interface ProgressChartProps {
  stats: ProgressStats;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ stats }) => {
  const data = [
    {
      name: "Selesai",
      value: stats.selesai,
      color: "#2563eb",
    },
    {
      name: "Dalam Proses",
      value: stats.dalamProses,
      color: "#0891b2",
    },
    {
      name: "Belum Dimulai",
      value: stats.belumDimulai,
      color: "#0284c7",
    },
  ];

  const COLORS = ["#2563eb", "#0891b2", "#0284c7"];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 border border-blue-200 rounded-xl shadow-3d">
          <p className="text-sm font-semibold text-gray-800">
            {payload[0].name}
          </p>
          <p className="text-sm text-blue-600 font-medium">{`${payload[0].value} dokumen`}</p>
        </div>
      );
    }
    return null;
  };

  if (stats.total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-blue-400">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-3d flex items-center justify-center">
            <span className="text-blue-500 text-xl">📊</span>
          </div>
          <p className="text-gray-600 font-medium">
            Belum ada data untuk ditampilkan
          </p>
          <p className="text-sm text-blue-400 mt-1">
            Upload file Excel untuk melihat progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Percentage */}
      <div className="mt-12 text-center mb-6">
        <div className="text-8xl font-bold gradient-text mb-2">
          {stats.persentase}%
        </div>
        <div className="text-5xl text-gray-600 font-medium">
          Progress Keseluruhan
        </div>
        <div className="text-4xl text-blue-500 mt-1 font-medium">
          {stats.selesai} dari {stats.total} dokumen selesai
        </div>
      </div>

      {/* Pie Chart */}
      {/* <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div> */}

      {/* Legend */}
      {/* <div className="mt-6 space-y-3">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center justify-between p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-3 shadow-sm"
                style={{ backgroundColor: COLORS[index] }}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-bold text-blue-600 px-2 py-1 bg-white rounded-md shadow-sm">
              {entry.value}
            </span>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default ProgressChart;
