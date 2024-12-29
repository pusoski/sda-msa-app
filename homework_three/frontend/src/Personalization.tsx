import React, {useEffect, useState} from "react";
import {DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent} from "@dnd-kit/core";
import {arrayMove, useSortable, SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import "./assets/css/main.css";
import "./assets/css/Personalization.css";

interface SortableItemProps {
    id: number;
    title: string;
    subtitle?: string;
    className?: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({id, title, subtitle, className}) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={className}
            {...attributes}
            {...listeners}
        >
            <h2>{title}</h2>
            {subtitle && <p className="content-subtitle">{subtitle}</p>}
        </div>
    );
};

interface ContentItem {
    id: number;
    title: string;
    subtitle: string;
    category: "Moving Average" | "Oscillator" | "External";
}

interface Issuer {
    symbol: string;
    is_watched: boolean;
}

interface StrategyItem {
    id: number;
    name: string;
    description: string;
}

const Personalization: React.FC = () => {
    // Existing state variables
    const [contentItems, setContentItems] = useState<ContentItem[]>([]);
    const [originalOrder, setOriginalOrder] = useState<number[]>([]);
    const [hasOrderChanges, setHasOrderChanges] = useState<boolean>(false);

    const [issuers, setIssuers] = useState<Issuer[]>([]);
    const [originalIssuers, setOriginalIssuers] = useState<Issuer[]>([]);
    const [hasIssuerChanges, setHasIssuerChanges] = useState<boolean>(false);

    // New state variables for strategies
    const [strategyItems, setStrategyItems] = useState<StrategyItem[]>([]);
    const [originalStrategyOrder, setOriginalStrategyOrder] = useState<number[]>([]);
    const [hasStrategyChanges, setHasStrategyChanges] = useState<boolean>(false);

    // Loading and Error states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

    // Consolidated useEffect for fetching all data
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // Define all fetch requests
        const fetchContentOrder = fetch('http://localhost:8000/get-personalization-order')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch personalization order');
                }
                return response.json();
            });

        const fetchIssuers = fetch('http://localhost:8000/get-personalization-issuers')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch personalization issuers');
                }
                return response.json();
            });

        const fetchStrategies = fetch('http://localhost:8000/get-personalization-strategies')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch personalization strategies');
                }
                return response.json();
            });

        // Execute all fetch requests in parallel
        Promise.all([fetchContentOrder, fetchIssuers, fetchStrategies])
            .then(([orderData, issuersData, strategiesData]: [number[], Issuer[], number[]]) => {
                // Handle Content Items
                const allContentItems: ContentItem[] = [
                    {id: 1, title: 'SMA', subtitle: 'Simple Moving Average', category: 'Moving Average'},
                    {id: 2, title: 'EMA', subtitle: 'Exponential Moving Average', category: 'Moving Average'},
                    {id: 3, title: 'RMA', subtitle: 'Rolling Moving Average', category: 'Moving Average'},
                    {id: 4, title: 'DEMA', subtitle: 'Double Exponential Moving Average', category: 'Moving Average'},
                    {id: 5, title: 'TRIMA', subtitle: 'Triangular Moving Average', category: 'Moving Average'},
                    {id: 6, title: 'RSI', subtitle: 'Relative Strength Index', category: 'Oscillator'},
                    {id: 7, title: 'TRIX', subtitle: 'Triple Exponential Average', category: 'Oscillator'},
                    {id: 8, title: 'STOCH', subtitle: 'Stochastic Oscillator', category: 'Oscillator'},
                    {id: 9, title: 'CCI', subtitle: 'Commodity Channel Index', category: 'Oscillator'},
                    {id: 10, title: 'WILLR', subtitle: 'Williams %R', category: 'Oscillator'},
                    {id: 11, title: 'Historical Data', subtitle: 'View Historical Data', category: 'External'},
                ];

                const orderedContentItems = orderData
                    .map(id => allContentItems.find(item => item.id === id))
                    .filter(item => item !== undefined) as ContentItem[];
                setContentItems(orderedContentItems);
                setOriginalOrder(orderData);

                // Handle Issuers
                setIssuers(issuersData);
                setOriginalIssuers(issuersData.map(issuer => ({...issuer})));

                // Handle Strategies
                const allStrategyItems: StrategyItem[] = [
                    {id: 101, name: 'RSI2', description: 'Relative Strength Index'},
                    {id: 102, name: 'BBANDS', description: 'Bollinger Bands'},
                    {id: 103, name: 'WILLR', description: 'Williams %R'},
                    {id: 104, name: 'VWMA', description: 'Volume Weighted Moving Average'},
                    {id: 105, name: 'PSAR', description: 'Parabolic Stop-and-Reverse'},
                ];

                const orderedStrategies = strategiesData
                    .map(id => allStrategyItems.find(item => item.id === id))
                    .filter(item => item !== undefined) as StrategyItem[];
                setStrategyItems(orderedStrategies);
                setOriginalStrategyOrder(strategiesData);

                setIsLoading(false);
            })
            .catch((err: Error) => {
                console.error('Error fetching personalization data:', err);
                setError(err.message);
                // Optionally, set default data in case of error
                const defaultContentOrder: ContentItem[] = [
                    {id: 1, title: 'SMA', subtitle: 'Simple Moving Average', category: 'Moving Average'},
                    {id: 2, title: 'EMA', subtitle: 'Exponential Moving Average', category: 'Moving Average'},
                    {id: 3, title: 'RMA', subtitle: 'Rolling Moving Average', category: 'Moving Average'},
                    {id: 4, title: 'DEMA', subtitle: 'Double Exponential Moving Average', category: 'Moving Average'},
                    {id: 5, title: 'TRIMA', subtitle: 'Triangular Moving Average', category: 'Moving Average'},
                    {id: 6, title: 'RSI', subtitle: 'Relative Strength Index', category: 'Oscillator'},
                    {id: 7, title: 'TRIX', subtitle: 'Triple Exponential Average', category: 'Oscillator'},
                    {id: 8, title: 'STOCH', subtitle: 'Stochastic Oscillator', category: 'Oscillator'},
                    {id: 9, title: 'CCI', subtitle: 'Commodity Channel Index', category: 'Oscillator'},
                    {id: 10, title: 'WILLR', subtitle: 'Williams %R', category: 'Oscillator'},
                    {id: 11, title: 'Historical Data', subtitle: 'View Historical Data on the Macedonian Stock Exchange Website', category: 'External'},
                ];
                const defaultStrategies: StrategyItem[] = [
                    {id: 101, name: 'RSI2', description: 'Relative Strength Index'},
                    {id: 102, name: 'BBANDS', description: 'Bollinger Bands'},
                    {id: 103, name: 'WILLR', description: 'Williams %R'},
                    {id: 104, name: 'VWMA', description: 'Volume Weighted Moving Average'},
                    {id: 105, name: 'PSAR', description: 'Parabolic Stop-and-Reverse'},
                ];
                setContentItems(defaultContentOrder);
                setOriginalOrder(defaultContentOrder.map(item => item.id));
                setIssuers([]);
                setOriginalIssuers([]);
                setStrategyItems(defaultStrategies);
                setOriginalStrategyOrder(defaultStrategies.map(item => item.id));
                setIsLoading(false);
            });
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = contentItems.findIndex(item => item.id === active.id);
            const newIndex = contentItems.findIndex(item => item.id === over.id);

            const newOrder = arrayMove(contentItems, oldIndex, newIndex);
            setContentItems(newOrder);

            const newOrderIds = newOrder.map(item => item.id);
            const isDifferent = !arraysEqual(newOrderIds, originalOrder);
            setHasOrderChanges(isDifferent);
        }
    };

    const handleStrategyDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = strategyItems.findIndex(item => item.id === active.id);
            const newIndex = strategyItems.findIndex(item => item.id === over.id);

            const newOrder = arrayMove(strategyItems, oldIndex, newIndex);
            setStrategyItems(newOrder);

            const newOrderIds = newOrder.map(item => item.id);
            const isDifferent = !arraysEqual(newOrderIds, originalStrategyOrder);
            setHasStrategyChanges(isDifferent);
        }
    };

    const arraysEqual = (a: number[], b: number[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    const handleSaveChanges = () => {
        setIsLoading(true);
        setError(null);

        const promises = [];

        if (hasOrderChanges) {
            const newOrderIds = contentItems.map(item => item.id);
            const orderPromise = fetch('http://localhost:8000/update-personalization-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({order_list: newOrderIds}),
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Order saved successfully');
                        setOriginalOrder(newOrderIds);
                        setHasOrderChanges(false);
                    } else {
                        return response.json().then(data => {
                            throw new Error(`Failed to save order: ${data.detail}`);
                        });
                    }
                });
            promises.push(orderPromise);
        }

        if (hasIssuerChanges) {
            const issuerPromise = fetch('http://localhost:8000/update-personalization-issuers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(issuers),
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Issuers saved successfully');
                        setOriginalIssuers(issuers.map(issuer => ({...issuer})));
                        setHasIssuerChanges(false);
                    } else {
                        return response.json().then(data => {
                            throw new Error(`Failed to save issuers: ${data.detail}`);
                        });
                    }
                });
            promises.push(issuerPromise);
        }

        if (hasStrategyChanges) {
            const newStrategyOrderIds = strategyItems.map(item => item.id);
            const strategyPromise = fetch('http://localhost:8000/update-personalization-strategies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({strategies_order_list: newStrategyOrderIds}), // Corrected field name
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Strategies saved successfully');
                        setOriginalStrategyOrder(newStrategyOrderIds);
                        setHasStrategyChanges(false);
                    } else {
                        return response.json().then(data => {
                            throw new Error(`Failed to save strategies: ${data.detail}`);
                        });
                    }
                });
            promises.push(strategyPromise);
        }

        Promise.all(promises)
            .then(() => {
                console.log('Changes saved successfully!');
            })
            .catch(error => {
                console.error(error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const toggleWatchStatus = (symbol: string) => {
        const updatedIssuers = issuers.map(issuer => {
            if (issuer.symbol === symbol) {
                return {...issuer, is_watched: !issuer.is_watched};
            }
            return issuer;
        });
        setIssuers(updatedIssuers);

        const isDifferent = updatedIssuers.some((issuer, index) => issuer.is_watched !== originalIssuers[index].is_watched);
        setHasIssuerChanges(isDifferent);
    };

    if (isLoading) {
        return (
            <div className="loading-overlay-back-drop">
                <div className="loading-overlay-content">
                    <div className="loading-overlay-spinner-container">
                        <div className="loading-overlay-spinner"/>
                    </div>
                    <div className="loading-overlay-text-container">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
            </div>
        );
    }

    return (
        <div className="content-container">
            <div className="page-title">
                <div className="page-title-left">
                    <h1>Personalization</h1>
                    <button
                        onClick={handleSaveChanges}
                        disabled={!hasOrderChanges && !hasIssuerChanges && !hasStrategyChanges || isLoading}
                        className={`save-button ${(hasOrderChanges || hasIssuerChanges || hasStrategyChanges) ? 'enabled' : 'disabled'}`}
                    >
                        <span className="button-content">
                            <img alt="Save icon" className="button-icon" src="/save-icon.svg"/>
                            Save Changes
                        </span>
                    </button>
                </div>
                <div className="page-title-right"></div>
            </div>
            <div className="personalization-page">
                <div className="issuers-section">
                    <h2>Watchlist</h2>
                    <div className="issuers-table-container">
                        <table className="issuers-table">
                            <tbody>
                            {issuers.map((issuer) => (
                                <tr key={issuer.symbol}>
                                    <td
                                        style={{
                                            color: issuer.is_watched ? "white" : "grey", // Text color based on watch status
                                        }}
                                    >
                                        {issuer.symbol}
                                    </td>
                                    <td>
                                        <img
                                            alt={issuer.is_watched ? "Watched" : "Unwatched"}
                                            src={issuer.is_watched ? "/visibility-on-icon.svg" : "/visibility-off-icon.svg"}
                                            className="watch-status-icon"
                                            onClick={() => toggleWatchStatus(issuer.symbol)}
                                            style={{
                                                cursor: "pointer",
                                                filter: issuer.is_watched ? "invert(0)" : "invert(0.5)", // Icon fill color based on watch status
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="order-section">
                    <h2>Data Analyses</h2>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={contentItems.map(item => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="content-list">
                                {contentItems.map((item) => (
                                    <SortableItem className="content-item" key={item.id} id={item.id} title={item.title}
                                                  subtitle={item.subtitle}/>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
                <div className="strategies-section">
                    <h2>Data Reports</h2>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleStrategyDragEnd}
                    >
                        <SortableContext
                            items={strategyItems.map(item => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="strategy-list">

                                {strategyItems.map((strategy) => (
                                    <SortableItem className="strategy-item" key={strategy.id} id={strategy.id}
                                                  title={strategy.name} subtitle={strategy.description}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </div>
    );
};

export default Personalization;