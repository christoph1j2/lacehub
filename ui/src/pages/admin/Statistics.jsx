import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
const Statistics = () => {
  const [matchingData, setMatchingData] = useState({
    wtb: [],
    wts: [],
    inventory: [],
  });
  const [activeTab, setActiveTab] = useState("wtb");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simulate API call to fetch statistics data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Generate mock data for top pairs
        const generateMockPairs = (prefix) => {
          const brands = [
            "Nike",
            "Adidas",
            "Jordan",
            "New Balance",
            "Puma",
            "Reebok",
            "Asics",
            "Vans",
            "Converse",
          ];
          const models = [
            "Air Max",
            "Dunk",
            "Ultraboost",
            "Yeezy",
            "Air Force",
            "Air Jordan",
            "990",
            "RS-X",
            "Chuck Taylor",
          ];

          return Array.from({ length: 10 }, (_, i) => {
            const brand = brands[Math.floor(Math.random() * brands.length)];
            const model = models[Math.floor(Math.random() * models.length)];
            return {
              id: `${prefix}-${i + 1}`,
              rank: i + 1,
              name: `${brand} ${model} ${Math.floor(Math.random() * 100)}`,
              sku: `${brand.substring(0, 2).toUpperCase()}${Math.floor(
                Math.random() * 10000
              )}`,
              count: Math.floor(Math.random() * 500) + 100,
              percentage: Math.floor(Math.random() * 20) + 5,
            };
          });
        };

        setMatchingData({
          wtb: generateMockPairs("wtb"),
          wts: generateMockPairs("wts"),
          inventory: generateMockPairs("inv"),
        });
      } catch (error) {
        console.error("Error fetching statistics data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary-200 border-t-secondary-600"></div>
      </div>
    );
  }
  const renderPairsTable = (data) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-primary-200">
        <thead className="bg-primary-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider"
            >
              Rank
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider"
            >
              SKU
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider"
            >
              Count
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider"
            >
              Percentage
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-primary-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-primary-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-800">
                {item.rank}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                {item.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 text-right">
                {item.count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 text-right">
                {item.percentage}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const renderPairsChart = (data) => (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 40 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
          <XAxis type="number" domain={[0, "dataMax + 100"]} />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tickFormatter={(value) => {
              return value.length > 15 ? value.substr(0, 15) + "..." : value;
            }}
          />
          <Tooltip />
          <Bar
            dataKey="count"
            name="Number of Pairs"
            fill="#F97316"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-primary-500">
          View top pairs and matching statistics.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-primary-200">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Top 10 Pairs</h3>
          <p className="text-sm text-primary-500 mb-6">
            Most frequently listed sneakers in your system.
          </p>

          <div className="space-y-6">
            <div className="flex space-x-2">
              {["wtb", "wts", "inventory"].map((tab) => {
                const label =
                  tab === "wtb"
                    ? "WTB List"
                    : tab === "wts"
                    ? "WTS List"
                    : "Inventory";
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === tab
                        ? "bg-secondary-500 text-white"
                        : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {renderPairsChart(matchingData[activeTab])}
            {renderPairsTable(matchingData[activeTab])}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Statistics;
