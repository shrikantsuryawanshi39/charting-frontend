import { createContext, useContext, useState } from "react";

const ChartingContext = createContext();

export const ChartingProvider = ({ children }) => {
    const [data, setData] = useState([]);
    const [design, setDesign] = useState(null);
    const [chartType, setChartType] = useState('');
    const formattedData = [];

    const loadData = async (widgetId, age) => {
        try {
            //Charting
            const orgId = 2;
            const params = new URLSearchParams();
            if (age.trim() !== '') params.append('age', age.trim());
            const URL_FOR_CHARTING_DATA = `http://localhost:8080/api/orgs/${orgId}/widgets/${widgetId}?${params}`;

            const chartRes = await fetch(URL_FOR_CHARTING_DATA);
            const chartJson = await chartRes.json();
            const chartData = chartJson.chartData;

            //Design 
            const designRes = await fetch(`http://localhost:8080/api/orgs/${orgId}/designs/${widgetId}`);
            const designJson = await designRes.json();

            const xField = designJson.xAxisField;

            // Format data
            for (const key of Object.keys(chartData)) {
                if (key === xField) continue;
                chartData[key].forEach((yVal, index) => {
                    const xVal = chartData[xField][index];
                    formattedData.push({
                        [xField]: xVal,
                        dataset: key,
                        value: yVal
                    });
                });
            }

            setDesign(designJson);
            setData(formattedData);
            setChartType(designJson.chartType);
        } catch (error) {
            console.error("Failed to load data:", error);
            setData([]);
        }
    };

    return (
        <ChartingContext.Provider
            value={{
                loadData,
                data,
                design,
                chartType,
                formattedData,
                setChartType,
            }}
        >
            {children}
        </ChartingContext.Provider>
    );
};

export const useChartingContext = () => useContext(ChartingContext);
