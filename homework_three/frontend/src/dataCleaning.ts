export interface DataEntry {
    date: string;
    symbol: string;
    avg_price: string;
    last_trade_price: string;
    max: string | null;
    min: string | null;
    pctchg: string;
    total_turnover_in_denars: string;
    turnover_in_best_in_denars: string;
    volume: string;
}

export interface ApiResponse {
    data: DataEntry[];
    dataTwo: DataEntry[];
}

export interface ProcessedDataEntry {
    date: string;
    symbol: string;
    avg_price: number;
    last_trade_price: number;
    max: number;
    min: number;
    pctchg: number;
    total_turnover_in_denars: number;
    turnover_in_best_in_denars: number;
    volume: number;
}


export function parseNumber(value: string | null | undefined): number {
    if (!value) {
        return 0;
    }
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
}


export function generateDateRange(start: string, end: string): string[] {
    const dtStart = new Date(`${start}T00:00:00Z`);
    const dtEnd = new Date(`${end}T00:00:00Z`);
    const dateArray: string[] = [];

    for (
        let dt = new Date(dtStart.getTime());
        dt.getTime() <= dtEnd.getTime();
        dt.setUTCDate(dt.getUTCDate() + 1)
    ) {
        const year = dt.getUTCFullYear();
        const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dt.getUTCDate()).padStart(2, '0');
        dateArray.push(`${year}-${month}-${day}`);
    }

    return dateArray;
}


export function processData(data: DataEntry[]): ProcessedDataEntry[] {
    if (!data || data.length === 0) {
        return [];
    }

    const sortedData = data.sort((a, b) => (a.date > b.date ? 1 : -1));

    const startDate = sortedData[0].date;
    const endDate = sortedData[sortedData.length - 1].date;

    const dateRange = generateDateRange(startDate, endDate);

    const dataMap = new Map<string, DataEntry>();
    sortedData.forEach(entry => dataMap.set(entry.date, entry));

    const processedData: ProcessedDataEntry[] = [];
    let lastKnownEntry: ProcessedDataEntry | null = null;

    for (const date of dateRange) {
        const entry = dataMap.get(date);
        if (entry) {
            const processedEntry: ProcessedDataEntry = {
                date: entry.date,
                symbol: entry.symbol,
                avg_price: parseNumber(entry.avg_price),
                last_trade_price: parseNumber(entry.last_trade_price),
                max: parseNumber(entry.max),
                min: parseNumber(entry.min),
                pctchg: parseNumber(entry.pctchg),
                total_turnover_in_denars: parseNumber(entry.total_turnover_in_denars),
                turnover_in_best_in_denars: parseNumber(entry.turnover_in_best_in_denars),
                volume: parseNumber(entry.volume),
            };
            processedData.push(processedEntry);
            lastKnownEntry = processedEntry;
        } else if (lastKnownEntry) {
            const filledEntry: ProcessedDataEntry = {
                date,
                symbol: lastKnownEntry.symbol,
                avg_price: lastKnownEntry.avg_price,
                last_trade_price: lastKnownEntry.last_trade_price,
                max: lastKnownEntry.max,
                min: lastKnownEntry.min,
                pctchg: lastKnownEntry.pctchg,
                total_turnover_in_denars: lastKnownEntry.total_turnover_in_denars,
                turnover_in_best_in_denars: lastKnownEntry.turnover_in_best_in_denars,
                volume: lastKnownEntry.volume,
            };
            processedData.push(filledEntry);
        } else {
            const defaultSymbol = sortedData[0].symbol;
            const filledEntry: ProcessedDataEntry = {
                date,
                symbol: defaultSymbol,
                avg_price: 0,
                last_trade_price: 0,
                max: 0,
                min: 0,
                pctchg: 0,
                total_turnover_in_denars: 0,
                turnover_in_best_in_denars: 0,
                volume: 0,
            };
            processedData.push(filledEntry);
        }
    }

    return processedData;
}