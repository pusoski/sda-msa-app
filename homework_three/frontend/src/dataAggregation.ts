import { ProcessedDataEntry } from "./dataCleaning";


export function aggregateWeekly(data: ProcessedDataEntry[]): ProcessedDataEntry[] {
    const weeklyData: ProcessedDataEntry[] = [];
    let week: ProcessedDataEntry[] = [];

    data.forEach(entry => {
        const date = new Date(entry.date);
        const weekDay = date.getDay() || 7;
        if (weekDay === 1 && week.length > 0) {
            weeklyData.push(aggregatePeriod(week));
            week = [];
        }
        week.push(entry);
    });

    if (week.length > 0) {
        weeklyData.push(aggregatePeriod(week));
    }

    return weeklyData;
}


export function aggregateMonthly(data: ProcessedDataEntry[]): ProcessedDataEntry[] {
    const monthlyData: ProcessedDataEntry[] = [];
    let month: ProcessedDataEntry[] = [];
    let currentMonth = '';

    data.forEach(entry => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (currentMonth && monthKey !== currentMonth) {
            monthlyData.push(aggregatePeriod(month));
            month = [];
        }
        currentMonth = monthKey;
        month.push(entry);
    });

    if (month.length > 0) {
        monthlyData.push(aggregatePeriod(month));
    }

    return monthlyData;
}


function aggregatePeriod(periodData: ProcessedDataEntry[]): ProcessedDataEntry {
    const firstEntry = periodData[0];
    const lastEntry = periodData[periodData.length - 1];
    const high = Math.max(...periodData.map(d => d.max));
    const low = Math.min(...periodData.map(d => d.min));
    const volume = periodData.reduce((sum, d) => sum + d.volume, 0);
    const date = lastEntry.date;

    return {
        ...firstEntry,
        max: high,
        min: low,
        last_trade_price: lastEntry.last_trade_price,
        volume,
        date,
    };
}