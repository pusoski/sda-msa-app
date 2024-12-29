import React, { useEffect, useState } from "react";
import "./assets/css/main.css";
import "./assets/css/DataAnalyses.css";

import {
    ApiResponse,
    ProcessedDataEntry,
    processData
} from "./dataCleaning";
import { calculateIndicator } from "./indicators";
import IndicatorChart from "./IndicatorChart";
import { getIndicatorParams, TimeFrame } from "./indicatorConfig";
import { aggregateWeekly, aggregateMonthly } from "./dataAggregation";

import Modal from './Modal';

interface Issuer {
    symbol: string;
}

interface ContentItem {
    id: number;
    title: string;
    subtitle: string;
    category: "Moving Average" | "Oscillator" | "External";
    content: React.ReactNode;
}

interface IndicatorCleanedData {
    dataOne: ProcessedDataEntry[];
    dataTwo: ProcessedDataEntry[];
}

const DataAnalyses: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedIndicator, setSelectedIndicator] = useState<ContentItem | null>(null);

    const contentItems: ContentItem[] = [
        {
            id: 1,
            title: "SMA",
            subtitle: "Simple Moving Average",
            category: "Moving Average",
            content: <p>A basic moving average that calculates the average price over a specified period.</p>,
        },
        {
            id: 2,
            title: "EMA",
            subtitle: "Exponential Moving Average",
            category: "Moving Average",
            content: <p>A weighted moving average that gives more significance to recent price data.</p>,
        },
        {
            id: 3,
            title: "RMA",
            subtitle: "Rolling Moving Average",
            category: "Moving Average",
            content: <p>A moving average that updates incrementally with new data while discarding old data.</p>,
        },
        {
            id: 4,
            title: "DEMA",
            subtitle: "Double Exponential Moving Average",
            category: "Moving Average",
            content: <p>A moving average designed to reduce lag by combining two exponential moving averages.</p>,
        },
        {
            id: 5,
            title: "TRIMA",
            subtitle: "Triangular Moving Average",
            category: "Moving Average",
            content: <p>A moving average that gives more weight to middle data points in the calculation period.</p>,
        },
        {
            id: 6,
            title: "RSI",
            subtitle: "Relative Strength Index",
            category: "Oscillator",
            content: <p>An oscillator that measures the speed and change of price movements to identify overbought or oversold conditions.</p>,
        },
        {
            id: 7,
            title: "TRIX",
            subtitle: "Triple Exponential Average",
            category: "Oscillator",
            content: <p>A momentum oscillator that measures the rate of change to identify trend direction and potential reversals.</p>,
        },
        {
            id: 8,
            title: "STOCH",
            subtitle: "Stochastic Oscillator",
            category: "Oscillator",
            content: <p>An indicator that compares the closing price to the range of prices over a specific period to gauge momentum.</p>,
        },
        {
            id: 9,
            title: "CCI",
            subtitle: "Commodity Channel Index",
            category: "Oscillator",
            content: <p>An oscillator that measures the deviation of price from its average to identify cyclical trends.</p>,
        },
        {
            id: 10,
            title: "WILLR",
            subtitle: "Williams %R",
            category: "Oscillator",
            content: <p>An oscillator that evaluates the level of the closing price relative to the highest and lowest points over a given period.</p>,
        },
        {
            id: 11,
            title: "Historical Data",
            subtitle: "View Historical Data on the Macedonian Stock Exchange Website",
            category: "External",
            content: null,
        },
    ];

    const [orderedContentItems, setOrderedContentItems] = useState<ContentItem[]>([]);
    const [watchedIssuers, setWatchedIssuers] = useState<Issuer[]>([]);

    const [selectedPeriods, setSelectedPeriods] = useState<{ [key: number]: TimeFrame }>({});
    const [selectedIssuers, setSelectedIssuers] = useState<{ [key: number]: string }>({});

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedIssuerFromTable, setSelectedIssuerFromTable] = useState<string | null>(null);

    const [, setCleanedDataMap] = useState<{ [key: number]: IndicatorCleanedData }>({});

    const [indicatorResultsMap, setIndicatorResultsMap] = useState<{
        [key: number]: {
            dataOneIndicator: any[];
            dataTwoIndicator: any[];
        };
    }>({});

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        Promise.all([
            fetch("http://localhost:8000/get-personalization-order").then((res) => res.json()),
            fetch("http://localhost:8000/get-watched-issuers").then((res) => res.json()),
        ])
            .then(([orderData, watchedData]: [number[], Issuer[]]) => {
                const reorderedItems = orderData
                    .map((id) => contentItems.find((item) => item.id === id))
                    .filter((item): item is ContentItem => item !== undefined);

                setOrderedContentItems(reorderedItems);
                setWatchedIssuers(watchedData);

                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                setError("Failed to load data.");
                setOrderedContentItems(contentItems);
                setWatchedIssuers([]);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (orderedContentItems.length === 0 || watchedIssuers.length === 0) return;

        const initPeriods: { [key: number]: TimeFrame } = {};
        const initIssuers: { [key: number]: string } = {};

        orderedContentItems.forEach((item) => {
            if (item.id !== 11) {
                initPeriods[item.id] = "day";
                initIssuers[item.id] = "None";
            }
        });

        setSelectedPeriods(initPeriods);
        setSelectedIssuers(initIssuers);

        if (watchedIssuers.length > 0) {
            setSelectedIssuerFromTable(watchedIssuers[0].symbol);
        }
    }, [orderedContentItems, watchedIssuers]);

    const handlePeriodChange = (id: number, period: TimeFrame) => {
        setSelectedPeriods((prev) => ({
            ...prev,
            [id]: period,
        }));
    };

    const handleIssuerChange = (id: number, issuer: string) => {
        setSelectedIssuers((prev) => ({
            ...prev,
            [id]: issuer,
        }));
    };

    const handleTableRowClick = (symbol: string) => {
        setSelectedIssuerFromTable(symbol);
    };

    const handleApply = async (id: number) => {
        const type = selectedPeriods[id]; // "day" | "week" | "month"
        const symbolOne = selectedIssuerFromTable;
        const symbolTwo = selectedIssuers[id];

        if (!symbolOne) {
            console.log("Please select an issuer from the table.");
            return;
        }

        let url = `http://localhost:8000/filter-three-data?symbolOne=${encodeURIComponent(
            symbolOne
        )}`;
        if (symbolTwo && symbolTwo !== "None") {
            url += `&symbolTwo=${encodeURIComponent(symbolTwo)}`;
        }

        console.log(`Fetching data for indicator ${id} from URL: ${url}`);

        try {
            const resp = await fetch(url);
            if (!resp.ok) {
                throw new Error(`API request failed with status ${resp.status}`);
            }
            const apiResponse: ApiResponse = await resp.json();

            const processedData = processData(apiResponse.data);
            let processedDataTwo: ProcessedDataEntry[] = [];
            if (apiResponse.dataTwo) {
                processedDataTwo = processData(apiResponse.dataTwo);
            }

            let aggregatedDataOne: ProcessedDataEntry[];
            if (type === "week") {
                aggregatedDataOne = aggregateWeekly(processedData);
            } else if (type === "month") {
                aggregatedDataOne = aggregateMonthly(processedData);
            } else {
                aggregatedDataOne = processedData;
            }

            let aggregatedDataTwo: ProcessedDataEntry[] = [];
            if (symbolTwo && symbolTwo !== "None") {
                if (type === "week") {
                    aggregatedDataTwo = aggregateWeekly(processedDataTwo);
                } else if (type === "month") {
                    aggregatedDataTwo = aggregateMonthly(processedDataTwo);
                } else {
                    aggregatedDataTwo = processedDataTwo;
                }
            }

            setCleanedDataMap((prev) => ({
                ...prev,
                [id]: {
                    dataOne: aggregatedDataOne,
                    dataTwo: aggregatedDataTwo,
                },
            }));

            const contentItem = orderedContentItems.find((x) => x.id === id);
            if (!contentItem) {
                console.log("Invalid content item.");
                return;
            }
            const indicatorName = contentItem.title;

            const params = getIndicatorParams(indicatorName, type);
            if (!params) {
                console.log(`No parameters found for indicator ${indicatorName} with time frame ${type}.`);
                return;
            }

            const invalidParam = Object.values(params).some(value => value < 1);
            if (invalidParam) {
                console.log(`Invalid period parameters for indicator ${indicatorName}.`);
                return;
            }

            const dataOneIndicator = calculateIndicator(indicatorName, aggregatedDataOne, params);
            let dataTwoIndicator: any[] = [];
            if (symbolTwo && symbolTwo !== "None") {
                dataTwoIndicator = calculateIndicator(indicatorName, aggregatedDataTwo, params);
            }

            const numId = Number(id);
            setIndicatorResultsMap((prev) => ({
                ...prev,
                [numId]: {
                    dataOneIndicator,
                    dataTwoIndicator,
                },
            }));

            console.log(`Indicator ${indicatorName} for item ${id} computed successfully.`);
        } catch (err) {
            console.error(`Error in handleApply for indicator ${id}:`, err);
            console.log(`Failed to fetch or compute indicator ${id}. Check console for details.`);
        }
    };

    const handleHistoricalDataClick = () => {
        if (!selectedIssuerFromTable) {
            console.log("Please select an issuer from the table first.");
            return;
        }
        const url = `https://www.mse.mk/en/stats/symbolhistory/${encodeURIComponent(selectedIssuerFromTable)}`;
        window.open(url, "_blank");
    };

    const handleIndicatorClick = (item: ContentItem) => {
        setSelectedIndicator(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (selectedIndicator) {
            const id = selectedIndicator.id;

            setIndicatorResultsMap((prev) => {
                const newMap = { ...prev };
                delete newMap[id];
                return newMap;
            });

            setCleanedDataMap((prev) => {
                const newMap = { ...prev };
                delete newMap[id];
                return newMap;
            });
        }

        setIsModalOpen(false);
        setSelectedIndicator(null);
    };

    if (isLoading) {
        return (
            <div className="loading-overlay-back-drop">
                <div className="loading-overlay-content">
                    <div className="loading-overlay-spinner-container">
                        <div className="loading-overlay-spinner" />
                    </div>
                    <div className="loading-overlay-text-container">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="content-container">
            <div className="page-title">
                <div className="page-title-left">
                    <h1>Data Analyses</h1>
                </div>
                <div className="page-title-right"></div>
            </div>

            <div className="data-analyses-page">
                <div className="da-issuers-section">
                    <h2>Select Issuer</h2>
                    <div className="da-issuers-table-container">
                        <table className="da-issuers-table">
                            <tbody>
                            {watchedIssuers.map((issuer, index) => (
                                <tr
                                    key={issuer.symbol || index}
                                    onClick={() => handleTableRowClick(issuer.symbol)}
                                    className={selectedIssuerFromTable === issuer.symbol ? "selected" : ""}
                                    style={{cursor: "pointer"}}
                                >
                                    <td>{issuer.symbol}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="da-order-section">
                    <h2>Indicators</h2>
                    <div className="da-content-list">
                        {orderedContentItems.map((item) => (
                            <div
                                key={item.id}
                                title={item.category}
                                className="da-content-item"
                                onClick={() =>
                                    item.id === 11
                                        ? handleHistoricalDataClick()
                                        : handleIndicatorClick(item)
                                }
                                style={{cursor: "pointer"}}
                            >
                                <h2 className="da-content-title">{item.title}</h2>
                                {item.subtitle && <p className="da-content-subtitle">{item.subtitle}</p>}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {selectedIndicator && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={
                        selectedIndicator.subtitle +
                        ` (` +
                        (selectedIssuerFromTable ? `${selectedIssuerFromTable}` : '') +
                        (selectedIssuers[selectedIndicator.id] !== "None" ? ` & ${selectedIssuers[selectedIndicator.id]}` : '') +
                        `)`
                    }
                >
                    <div className="indicator-modal-content">
                        <div className="unique-content">
                            {selectedIndicator.content}

                            <div className="additional-controls">
                                <div className="period-buttons">
                                    <span>View: </span>
                                    <button
                                        className={
                                            selectedPeriods[selectedIndicator.id] === "day" ? "period-button" : "period-button inactive"
                                        }
                                        onClick={() => handlePeriodChange(selectedIndicator.id, "day")}
                                    >
                                        <img alt="Daily icon" src="/view-daily-icon.svg"/> Daily
                                    </button>
                                    <button
                                        className={
                                            selectedPeriods[selectedIndicator.id] === "week" ? "period-button" : "period-button inactive"
                                        }
                                        onClick={() => handlePeriodChange(selectedIndicator.id, "week")}
                                    >
                                        <img alt="Weekly icon" src="/view-weekly-icon.svg"/> Weekly
                                    </button>
                                    <button
                                        className={
                                            selectedPeriods[selectedIndicator.id] === "month" ? "period-button" : "period-button inactive"
                                        }
                                        onClick={() => handlePeriodChange(selectedIndicator.id, "month")}
                                    >
                                        <img alt="Monthly icon" src="/view-monthly-icon.svg"/> Monthly
                                    </button>
                                </div>

                                <div className="apply-controls">
                                    <label htmlFor="issuers-dropdown">Issuer 2:</label>
                                    {watchedIssuers.length > 0 ? (
                                        <select
                                            value={selectedIssuers[selectedIndicator.id] || "None"}
                                            onChange={(e) => handleIssuerChange(selectedIndicator.id, e.target.value)}
                                            className="issuer-dropdown"
                                            id="issuers-dropdown"
                                        >
                                            <option value="None">None</option>
                                            {watchedIssuers.map((issuerOption, idx) => (
                                                <option
                                                    key={idx}
                                                    value={issuerOption.symbol}
                                                    disabled={issuerOption.symbol === selectedIssuerFromTable}
                                                    title={issuerOption.symbol === selectedIssuerFromTable ? "Already selected from the table" : ""}
                                                    style={issuerOption.symbol === selectedIssuerFromTable ? {color: "dark-grey"} : {}}
                                                >
                                                    {issuerOption.symbol}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select disabled className="issuer-dropdown">
                                            <option>No issuers available</option>
                                        </select>
                                    )}

                                    <button className="apply-button" onClick={() => handleApply(selectedIndicator.id)}>
                                        Calculate
                                    </button>
                                </div>
                            </div>

                            {indicatorResultsMap[selectedIndicator.id]?.dataOneIndicator && (
                                <IndicatorChart
                                    indicatorName={selectedIndicator.title}
                                    dataOne={indicatorResultsMap[selectedIndicator.id].dataOneIndicator}
                                    dataTwo={indicatorResultsMap[selectedIndicator.id].dataTwoIndicator}
                                />
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DataAnalyses;