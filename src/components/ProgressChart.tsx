import React from "react";
import { ProgressStats } from "../types";

interface ProgressChartProps {
  stats: ProgressStats;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ stats }) => {
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
