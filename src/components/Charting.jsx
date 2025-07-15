import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

function ChartWidget({ widgetId }) {
  const [chartData, setChartData] = useState([]);
  const [design, setDesign] = useState(null);

  const getChartData = async () => {
    const dataRes = await fetch(
      `http://localhost:8080/api/charting/${widgetId}`
    );
    const designRes = await fetch(
      `http://localhost:8080/api/design/${widgetId}`
    );

    const chartJson = await dataRes.json();
    const designJson = await designRes.json();

    const formattedData = chartJson.x.map((xVal, index) => ({
      [designJson.xAxisField]: xVal,
      [designJson.yAxisField]: chartJson.y[index],
      [designJson.performanceField]: chartJson.performance[index],
    }));
    setDesign(designJson);
    setChartData(formattedData);
  };

  useEffect(() => {
    getChartData();
  }, [widgetId]);

  if (!design) return <p className="text-gray-500 text-sm mt-4">Loading...</p>;

  return (
    <div className="mt-8">
      <BarChart
        width={design.width}
        height={design.height}
        data={chartData}
        style={{ fontFamily: design.fontFamily }}>
        {design.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis
          dataKey={design.xAxisField}
          label={{
            value: design.xAxisLabel,
            position: "insideBottom",
            offset: -5,
          }}
        />
        <YAxis
          label={{
            value: design.yAxisLabel,
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip />
        <Legend verticalAlign={design.legendPosition || "bottom"} />
        <Bar
          type="monotone"
          dataKey={design.yAxisField}
          stroke={design.barColor}
          strokeWidth={2}
          isAnimationActive={design.animation}
        />
      </BarChart>
    </div>
  );
}

export default ChartWidget;
