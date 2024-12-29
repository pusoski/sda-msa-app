import React, { useRef } from "react";
import "./assets/css/IndicatorChart.css"
import { Line } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    ChartOptions
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    zoomPlugin
);

interface DataPoint {
    // @ts-ignore
    date: string;
    [key: string]: number | null;
}

interface IndicatorChartProps {
    dataOne: DataPoint[];
    dataTwo?: DataPoint[];
    indicatorName: string;
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({
                                                           dataOne,
                                                           dataTwo = [],
                                                           indicatorName,
                                                       }) => {
    const chartRef = useRef<ChartJS<"line">>(null);

    const allDates = Array.from(
        new Set([...dataOne.map((d) => d.date), ...dataTwo.map((d) => d.date)])
    ).sort();

    const numericKeysOne = dataOne.length
        ? Object.keys(dataOne[0]).filter((k) => k !== "date")
        : [];
    const numericKeysTwo = dataTwo.length
        ? Object.keys(dataTwo[0]).filter((k) => k !== "date")
        : [];
    const uniqueNumericKeys = Array.from(
        new Set([...numericKeysOne, ...numericKeysTwo])
    );

    let datasetCounter = 0;

    const dataOneDatasets = uniqueNumericKeys.map((key) => {
        datasetCounter++;
        return {
            label: `Issuer 1 ${key.toUpperCase()}`,
            data: allDates.map((date) => {
                const entry = dataOne.find((d) => d.date === date);
                return entry ? (entry[key] as number | null) : null;
            }),
            borderColor: getColor(datasetCounter),
            borderWidth: 2,
            fill: true,
            tension: 0,
            pointRadius: 1,
            hitRadius: 0,
        };
    });

    const dataTwoDatasets = uniqueNumericKeys.map((key) => {
        datasetCounter++;
        return {
            label: `Issuer 2 ${key.toUpperCase()}`,
            data: allDates.map((date) => {
                const entry = dataTwo.find((d) => d.date === date);
                return entry ? (entry[key] as number | null) : null;
            }),
            borderColor: getColor(datasetCounter),
            borderWidth: 2,
            fill: true,
            tension: 0,
            pointRadius: 1,
            hitRadius: 0,
        };
    });

    const datasets = [...dataOneDatasets, ...dataTwoDatasets];

    const chartData = {
        labels: allDates,
        datasets,
    };

    const zoomOptions = {
        pan: {
            enabled: true,
            mode: "x" as const,
        },
        zoom: {
            wheel: {
                enabled: true,
            },
            pinch: {
                enabled: true,
            },
            mode: "x" as const,
        },
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            decimation: {
                enabled: true,
                algorithm: "lttb",
                samples: 100,
            },
            legend: {
                display: true,
                labels: {
                    color: "#ffffff",
                    font: {
                        family: "Rubik Medium",
                    },
                },
            },
            zoom: zoomOptions,
            tooltip: {
                enabled: true,
                mode: "index",
                intersect: false,
                bodyFont: {
                    family: "Rubik Medium",
                },
            },
        },
        scales: {
            y: {
                title: { display: true, text: "Value", color: "#ffffff" },
                grid: {
                    color: "rgb(99,21,113)",
                },
                ticks: {
                    color: "#ffffff",
                    font: {
                        family: "Rubik Medium",
                    },
                },
            },
            x: {
                title: { display: true, text: "Date", color: "#ffffff" },
                grid: {
                    color: "rgb(99,21,113)",
                },
                ticks: {
                    color: "#ffffff",
                    font: {
                        family: "Rubik",
                        size: 10,
                    },
                },
                offset: true,
            },
        },
    };

    const handleResetZoom = () => {
        if (chartRef.current) {
            chartRef.current.resetZoom();
        }
    };

    const handleDownloadChart = () => {
        if (chartRef.current) {
            const chart = chartRef.current;

            const url = chart.toBase64Image();

            const link = document.createElement('a');
            link.href = url;
            link.download = `${indicatorName}_Chart.png`;
            link.click();
        }
    };

    return (
        <div style={{ width: "100%", marginTop: "2rem" }}>
            <h4>{indicatorName} Chart</h4>
            <Line ref={chartRef} data={chartData} options={options} />
            <div className="chart-instructions" style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <span>
                    Use the mouse scroll wheel to zoom in/out for precision view. Hold and drag left/right to move within zoom view.
                </span>
                <button onClick={handleResetZoom}>
                    Reset Zoom
                </button>
                <button onClick={handleDownloadChart}>
                    Download Chart
                </button>
            </div>
        </div>
    );
};

export default IndicatorChart;

function getColor(idx: number) {
    const colors = [
        "rgba(255,99,132,1)",
        "rgba(54,162,235,1)",
        "rgba(255,206,86,1)",
        "rgba(75,192,192,1)",
        "rgba(153,102,255,1)",
        "rgba(255,159,64,1)",
    ];
    return colors[idx % colors.length];
}