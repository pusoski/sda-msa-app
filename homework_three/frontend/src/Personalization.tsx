import React, { useEffect, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./assets/css/main.css";
import "./assets/css/Personalization.css";

interface SortableItemProps {
    id: number;
    title: string;
    subtitle: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, title, subtitle }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="content-item"
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
}

interface Issuer {
    symbol: string;
    is_watched: boolean;
}

const Personalization: React.FC = () => {
    const [contentItems, setContentItems] = useState<ContentItem[]>([]);
    const [originalOrder, setOriginalOrder] = useState<number[]>([]);
    const [hasOrderChanges, setHasOrderChanges] = useState<boolean>(false);

    const [issuers, setIssuers] = useState<Issuer[]>([]);
    const [originalIssuers, setOriginalIssuers] = useState<Issuer[]>([]);
    const [hasIssuerChanges, setHasIssuerChanges] = useState<boolean>(false);

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

    useEffect(() => {
        fetch('http://localhost:8000/get-personalization-order')
            .then(response => response.json())
            .then((data: number[]) => {
                setOriginalOrder(data);

                const allContentItems: ContentItem[] = [
                    { id: 1, title: 'RSI', subtitle: 'Relative Strength Index' },
                    { id: 2, title: 'MACD', subtitle: 'Moving Average Convergence Divergence' },
                    { id: 3, title: 'STOCH', subtitle: 'Stochastic Oscillator' },
                    { id: 4, title: 'CCI', subtitle: 'Commodity Channel Index' },
                    { id: 5, title: 'WILLR', subtitle: 'Williams %R' },
                    { id: 6, title: 'SMA', subtitle: 'Simple Moving Average' },
                    { id: 7, title: 'EMA', subtitle: 'Exponential Moving Average' },
                    { id: 8, title: 'WMA', subtitle: 'Weighted Moving Average' },
                    { id: 9, title: 'BBANDS', subtitle: 'Bollinger Bands' },
                    { id: 10, title: 'TRIX', subtitle: 'Triple Exponential Moving Average' },
                    { id: 11, title: 'Historical Data', subtitle: 'View Historical Data' },
                ];

                const orderedItems = data
                    .map(id => allContentItems.find(item => item.id === id))
                    .filter(item => item !== undefined) as ContentItem[];
                setContentItems(orderedItems);
            })
            .catch(error => {
                console.error('Error fetching content order:', error);
                const defaultOrder: ContentItem[] = [
                    { id: 1, title: 'RSI', subtitle: 'Relative Strength Index' },
                    { id: 2, title: 'MACD', subtitle: 'Moving Average Convergence Divergence' },
                    { id: 3, title: 'STOCH', subtitle: 'Stochastic Oscillator' },
                    { id: 4, title: 'CCI', subtitle: 'Commodity Channel Index' },
                    { id: 5, title: 'WILLR', subtitle: 'Williams %R' },
                    { id: 6, title: 'SMA', subtitle: 'Simple Moving Average' },
                    { id: 7, title: 'EMA', subtitle: 'Exponential Moving Average' },
                    { id: 8, title: 'WMA', subtitle: 'Weighted Moving Average' },
                    { id: 9, title: 'BBANDS', subtitle: 'Bollinger Bands' },
                    { id: 10, title: 'TRIX', subtitle: 'Triple Exponential Moving Average' },
                    { id: 11, title: 'Historical Data', subtitle: 'View Historical Data' },
                ];
                setContentItems(defaultOrder);
                setOriginalOrder(defaultOrder.map(item => item.id));
            });
    }, []);

    useEffect(() => {
        fetch('http://localhost:8000/get-personalization-issuers')
            .then(response => response.json())
            .then((data: Issuer[]) => {
                setIssuers(data);
                setOriginalIssuers(data.map(issuer => ({ ...issuer })));
            })
            .catch(error => {
                console.error('Error fetching issuers:', error);
                setIssuers([]);
                setOriginalIssuers([]);
            });
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

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

    const arraysEqual = (a: number[], b: number[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    const handleSaveChanges = () => {
        const promises = [];

        if (hasOrderChanges) {
            const newOrderIds = contentItems.map(item => item.id);
            const orderPromise = fetch('http://localhost:8000/update-personalization-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ order_list: newOrderIds }),
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
                        setOriginalIssuers(issuers.map(issuer => ({ ...issuer })));
                        setHasIssuerChanges(false);
                    } else {
                        return response.json().then(data => {
                            throw new Error(`Failed to save issuers: ${data.detail}`);
                        });
                    }
                });
            promises.push(issuerPromise);
        }

        Promise.all(promises)
            .then(() => {
                alert('Changes saved successfully!');
            })
            .catch(error => {
                console.error(error.message);
                alert(error.message);
            });
    };

    const toggleWatchStatus = (symbol: string) => {
        const updatedIssuers = issuers.map(issuer => {
            if (issuer.symbol === symbol) {
                return { ...issuer, is_watched: !issuer.is_watched };
            }
            return issuer;
        });
        setIssuers(updatedIssuers);

        const isDifferent = updatedIssuers.some((issuer, index) => issuer.is_watched !== originalIssuers[index].is_watched);
        setHasIssuerChanges(isDifferent);
    };

    return (
        <div className="content-container">
            <div className="page-title">
                <div className="page-title-left">
                    <h1>Personalization</h1>
                    <button
                        onClick={handleSaveChanges}
                        disabled={!hasOrderChanges && !hasIssuerChanges}
                        className={`save-button ${hasOrderChanges || hasIssuerChanges ? 'enabled' : 'disabled'}`}
                    >
                    <span className="button-content">
                        <img alt="Save icon" className="button-icon" src="/save-icon.svg" />
                        Save Changes
                    </span>
                    </button>
                </div>
            </div>
            <div className="personalization-page">
                <div className="issuers-section">
                    <table className="issuers-table">
                        <tbody>
                        {issuers.map((issuer) => (
                            <tr key={issuer.symbol}>
                                <td>{issuer.symbol}</td>
                                <td>
                                    <img
                                        alt={issuer.is_watched ? "Watched" : "Unwatched"}
                                        src={issuer.is_watched ? "/visibility-on-icon.svg" : "/visibility-off-icon.svg"}
                                        className="watch-status-icon"
                                        onClick={() => toggleWatchStatus(issuer.symbol)}
                                        style={{cursor: "pointer"}}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="order-section">
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
                                    <SortableItem key={item.id} id={item.id} title={item.title}
                                                  subtitle={item.subtitle}/>
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
