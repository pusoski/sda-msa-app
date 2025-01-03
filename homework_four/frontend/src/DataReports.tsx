import React, { useEffect, useState } from "react";

import "./assets/css/main.css";
import "./assets/css/DataReports.css";

import {
    ApiResponse,
    ProcessedDataEntry,
    processData
} from "./dataCleaning.ts";

import IndicatorChart from "./IndicatorChart";

import { getStrategyParams, TimeFrame } from "./strategyConfig.ts";
import { aggregateWeekly, aggregateMonthly } from "./dataAggregation.ts";
import { calculateStrategy } from "./strategies.ts";
import Modal from './Modal';

interface Issuer {
    symbol: string;
}

interface ContentItem {
    id: number;
    title: string;
    fullTitle: string;
    subtitle: string;
    content: React.ReactNode;
}

interface StrategyCleanedData {
    dataOne: ProcessedDataEntry[];
    dataTwo: ProcessedDataEntry[];
}

const DataReports: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedStrategy, setSelectedStrategy] = useState<ContentItem | null>(null);

    const contentItems: ContentItem[] = [
        {
            id: 101,
            title: "RSI2",
            fullTitle: "Relative Strength Index 2 Report",
            subtitle: "Based on: Relative Strength Index",
            content: <p>A trading strategy uses RSI to identify overbought and oversold levels for short-term buy or sell signals.</p>,
        },
        {
            id: 102,
            title: "BBANDS",
            fullTitle: "Bollinger Bands Report",
            subtitle: "Based on: Bollinger Bands",
            content: <p>A strategy that leverages Bollinger Bands to detect price breakouts or reversals based on volatility.</p>,
        },
        {
            id: 103,
            title: "WILLR",
            fullTitle: "Williams %R Report",
            subtitle: "Based on: Williams %R",
            content: <p>A momentum-based strategy that signals buy or sell actions when Williams %R crosses extreme levels.</p>,
        },
        {
            id: 104,
            title: "VWMA",
            fullTitle: "Volume Weighted Moving Average Report",
            subtitle: "Based on: Volume Weighted Moving Average",
            content: <p>A trading approach that uses volume-weighted averages to confirm trends and identify potential entry or exit points.</p>,
        },
        {
            id: 105,
            title: "PSAR",
            fullTitle: "Parabolic Stop-and-Reverse Report",
            subtitle: "Based on: Parabolic Stop-and-Reverse",
            content: <p>A trend-following strategy that uses the Parabolic SAR to set trailing stop-loss levels and reverse positions during trend changes.</p>,
        },
    ];

    const [orderedContentItems, setOrderedContentItems] = useState<ContentItem[]>([]);
    const [watchedIssuers, setWatchedIssuers] = useState<Issuer[]>([]);

    const [selectedPeriods, setSelectedPeriods] = useState<{ [key: number]: TimeFrame }>({});
    const [selectedIssuers, setSelectedIssuers] = useState<{ [key: number]: string }>({});

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedIssuerFromTable, setSelectedIssuerFromTable] = useState<string | null>(null);


    const [, setCleanedDataMap] = useState<{ [key: number]: StrategyCleanedData }>({});

    const [strategyResultsMap, setStrategyResultsMap] = useState<{
        [key: number]: {
            dataOneStrategy: any[];
            dataTwoStrategy: any[];
        };
    }>({});

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        Promise.all([
            fetch("http://localhost:8000/get-personalization-strategies").then((res) => res.json()),
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
            initPeriods[item.id] = "day";
            initIssuers[item.id] = "None";
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
        const type = selectedPeriods[id];
        const symbolOne = selectedIssuerFromTable;
        const symbolTwo = selectedIssuers[id];

        if (!symbolOne) {
            alert("Please select an issuer from the table.");
            return;
        }

        let url = `http://localhost:8000/filter-three-data?symbolOne=${encodeURIComponent(
            symbolOne
        )}`;
        if (symbolTwo && symbolTwo !== "None") {
            url += `&symbolTwo=${encodeURIComponent(symbolTwo)}`;
        }

        console.log(`Fetching data for strategy ${id} from URL: ${url}`);

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
            const strategyName = contentItem.title;

            const params = getStrategyParams(strategyName, type);
            if (!params) {
                console.log(`No parameters found for ${strategyName} with time frame ${type}.`);
                return;
            }

            const invalidParam = Object.values(params).some(value => value < 1);
            if (invalidParam) {
                console.log(`Invalid period parameters for ${strategyName}.`);
                return;
            }

            const dataOneStrategy = calculateStrategy(strategyName, aggregatedDataOne, params);
            let dataTwoStrategy: any[] = [];
            if (symbolTwo && symbolTwo !== "None") {
                dataTwoStrategy = calculateStrategy(strategyName, aggregatedDataTwo, params);
            }

            const numId = Number(id);
            setStrategyResultsMap((prev) => ({
                ...prev,
                [numId]: {
                    dataOneStrategy,
                    dataTwoStrategy,
                },
            }));

            console.log(`${strategyName} for item ${id} computed successfully.`);
        } catch (err) {
            console.error(`Error in handleApply for ${id}:`, err);
            console.log(`Failed to fetch or compute ${id}.`);
        }
    };

    const handleStrategyClick = (item: ContentItem) => {
        setSelectedStrategy(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (selectedStrategy) {
            const id = selectedStrategy.id;

            setStrategyResultsMap((prev) => {
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
        setSelectedStrategy(null);
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
                    <h1>Data Reports</h1>
                </div>
                <div className="page-title-right"></div>
            </div>

            <div className="data-reports-page">
                <div className="dr-issuers-section">
                    <h2>Select Issuer</h2>
                    <div className="dr-issuers-table-container">
                        <table className="dr-issuers-table">
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

                <div className="dr-strategy-section">
                    <h2>Reports</h2>
                    <div className="dr-strategy-list">
                        {orderedContentItems.map((item) => (
                            <div key={item.id}
                                 className="dr-strategy-item"
                                 onClick={() => handleStrategyClick(item)}
                                 style={{cursor: "pointer"}}
                            >
                                <h2 className="strategy-title">
                                    {item.title + " Report"}
                                </h2>
                                {item.subtitle && <p className="strategy-subtitle">{item.subtitle}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedStrategy && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={
                        selectedStrategy.fullTitle +
                        ` (`+
                        (selectedIssuerFromTable ? `${selectedIssuerFromTable}` : '') +
                        (selectedIssuers[selectedStrategy.id] !== "None" ? ` & ${selectedIssuers[selectedStrategy.id]}` : '') +
                        `)`
                    }
                >
                    <div className="strategy-modal-content">
                        <div className="unique-content">
                            {selectedStrategy.content}
                            <div className="signals">
                                <div className="buy">ACTION: 1 = BUY</div>
                                <div className="hold">ACTION: 0 = HOLD</div>
                                <div className="sell">ACTION: -1 = SELL</div>
                            </div>
                            <div className="additional-controls">
                                <div className="period-buttons">
                                    <button
                                        className={
                                            selectedPeriods[selectedStrategy.id] === "day" ? "period-button" : "period-button inactive"
                                        }
                                        onClick={() => handlePeriodChange(selectedStrategy.id, "day")}
                                    >
                                        <img alt="Daily icon" src="/view-daily-icon.svg"/> Daily
                                    </button>
                                    <button
                                        className={
                                            selectedPeriods[selectedStrategy.id] === "week" ? "period-button" : "period-button inactive"
                                        }
                                        onClick={() => handlePeriodChange(selectedStrategy.id, "week")}
                                    >
                                        <img alt="Weekly icon" src="/view-weekly-icon.svg"/> Weekly
                                    </button>
                                    <button
                                        className={
                                            selectedPeriods[selectedStrategy.id] === "month" ? "period-button" : "period-button inactive"
                                        }
                                        onClick={() => handlePeriodChange(selectedStrategy.id, "month")}
                                    >
                                        <img alt="Monthly icon" src="/view-monthly-icon.svg"/> Monthly
                                    </button>

                                </div>
                                <div className="apply-controls">
                                    <label htmlFor="issuers-dropdown">Issuer 2:</label>
                                    {watchedIssuers.length > 0 ? (
                                        <select
                                            value={selectedIssuers[selectedStrategy.id] || "None"}
                                            onChange={(e) => handleIssuerChange(selectedStrategy.id, e.target.value)}
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
                                                    style={issuerOption.symbol === selectedIssuerFromTable ? {color: "#ccc"} : {}}
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

                                    <button className="apply-button" onClick={() => handleApply(selectedStrategy.id)}>
                                        Calculate
                                    </button>
                                </div>
                            </div>

                            {strategyResultsMap[selectedStrategy.id]?.dataOneStrategy && (
                                <IndicatorChart
                                    indicatorName={selectedStrategy.title}
                                    dataOne={strategyResultsMap[selectedStrategy.id].dataOneStrategy}
                                    dataTwo={strategyResultsMap[selectedStrategy.id].dataTwoStrategy}
                                />
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DataReports;