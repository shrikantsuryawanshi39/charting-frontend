import { useState } from 'react';
import LineChartD3 from './components/charts/LineChartD3';
import BarChartD3 from './components/charts/BarChartD3';
import PieChartD3 from './components/charts/PieChartD3';
import AreaChartD3 from './components/charts/AreaChartD3';

function App() {
  const [widgetId, setWidgetId] = useState('');
  const [data, setData] = useState([]);
  const [design, setDesign] = useState(null);
  const [chartType, setChartType] = useState('');

  const loadData = async () => {
    try {
      const chartRes = await fetch(`http://localhost:8080/api/charting/${widgetId}`);
      const designRes = await fetch(`http://localhost:8080/api/design/${widgetId}`);
      const chartJson = await chartRes.json();
      const designJson = await designRes.json();

      // Format data for multiple datasets
      const formattedData = chartJson.datasets.map((dataset) =>
        chartJson.x.map((xVal, index) => ({
          name: dataset.name,
          [designJson.xAxisField]: xVal,
          [designJson.yAxisField]: dataset.y[index],
        }))
      );

      /**
       * formattedData will now be like:
       * [
       *   [{name: 'Events A', Day: 'sunday', Events: 10}, ...],
       *   [{name: 'Events B', Day: 'sunday', Events: 15}, ...]
       * ]
       */

      setDesign(designJson);
      setData(formattedData);
      setChartType(designJson.chartType);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const renderChart = () => {
    const props = { data, design };

    switch (chartType) {
      case 'line':
        return <LineChartD3 {...props} />;
      case 'bar':
        return <BarChartD3 {...props} />;
      case 'pie':
        return <PieChartD3 {...props} />;
      case 'area':
        return <AreaChartD3 {...props} />;
      default:
        return (!chartType ? <p className="text-green-600">Enter Widget Id...</p> : <p className="text-red-500">Unsupported chart type: {chartType}</p>);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">Charting Dashboard (D3.js)</h1>

        <div className="flex items-center gap-4 mb-6">
          <input
            className="border border-gray-300 rounded px-4 py-2 w-64"
            value={widgetId}
            onChange={(e) => setWidgetId(e.target.value)}
            placeholder="Enter widgetId (e.g. w1)"
          />
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Load Chart
          </button>
        </div>

        <div className="flex gap-6 mb-6">
          <label>
            <input
              type="radio"
              value="line"
              checked={chartType === 'line'}
              onChange={(e) => setChartType(e.target.value)}
              className="mr-1"
            />
            Line Chart
          </label>
          <label>
            <input
              type="radio"
              value="bar"
              checked={chartType === 'bar'}
              onChange={(e) => setChartType(e.target.value)}
              className="mr-1"
            />
            Bar Chart
          </label>
          <label>
            <input
              type="radio"
              value="pie"
              checked={chartType === 'pie'}
              onChange={(e) => setChartType(e.target.value)}
              className="mr-1"
            />
            Pie Chart
          </label>
          <label>
            <input
              type="radio"
              value="area"
              checked={chartType === 'area'}
              onChange={(e) => setChartType(e.target.value)}
              className="mr-1"
            />
            Area Chart
          </label>
        </div>

        <div className="overflow-x-auto border rounded bg-white p-4">
          {renderChart()}
        </div>
      </div>
    </div>
  );
}

export default App;
