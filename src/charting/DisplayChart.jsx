import { useState } from 'react';
import LineChartD3 from '../components/charts/LineChartD3';
import BarChartD3 from '../components/charts/BarChartD3';
import PieChartD3 from '../components/charts/PieChartD3';
import AreaChartD3 from '../components/charts/AreaChartD3';
import { useChartingContext } from '../context/ChartingContext';

function DisplayChart() {
    const { loadData, data, design, chartType, setChartType, } = useChartingContext();

    const [widgetId, setWidgetId] = useState('');
    const [age, setAge] = useState('');


    const handleChartLoading = async () => {
        await loadData(widgetId, age);
    }

    // Render the chart based on the selected type
    const renderChart = () => {
        const props = { data, design };
        if (!design || data.length === 0) {
            return <p className="text-purple-600">Enter Widget Id to see Chart...</p>;
        }
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
                return (!chartType
                    ? <p className="text-green-600">Enter Widget Id...</p>
                    : <p className="text-red-500">Unsupported chart type: {chartType}</p>);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-md">
                <h1 className="text-2xl font-bold mb-4">Charting Dashboard</h1>

                <div className="flex flex-wrap flex-col gap-4 mb-6">
                    <input
                        className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
                        value={widgetId}
                        onChange={(e) => setWidgetId(e.target.value)}
                        placeholder="Enter widgetId (e.g. w1)"
                    />
                    <input
                        className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Enter age..."
                        type="number"
                    />
                    <button
                        onClick={handleChartLoading}
                        className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs bg-purple-600 text-white hover:bg-purple-700 transition"
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

export default DisplayChart;
