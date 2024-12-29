import { ProcessedDataEntry } from "./dataCleaning";

// Moving Averages
import {sma, ema, rma, trima, dema } from "indicatorts";

// Oscillators
import {rsi, trix, stoch, cci, willr} from "indicatorts";

/**
 * Helper to extract arrays from your ProcessedDataEntry[].
 * - close = last_trade_price
 * - high = max
 * - low  = min
 * - volume
 * - date (string array)
 */
function getDataArrays(data: ProcessedDataEntry[]) {
    const close: number[] = data.map((d) => d.last_trade_price);
    const high: number[] = data.map((d) => d.max);
    const low: number[] = data.map((d) => d.min);
    const volume: number[] = data.map((d) => d.volume);
    const dates: string[] = data.map((d) => d.date);

    // Some indicators need a typical price, which is (high + low + close) / 3
    const typicalPrice: number[] = data.map(
        (d) => (d.max + d.min + d.last_trade_price) / 3
    );

    return { close, high, low, volume, dates, typicalPrice };
}

/**
 * 1) SMA
 */
export function calculateSMA(data: ProcessedDataEntry[], period: number) {
    const { close, dates } = getDataArrays(data);

    const defaultConfig = { period: period }
    const smaVals = sma(close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            results.push({ date: dates[i], sma: null });
        } else {
            results.push({
                date: dates[i],
                sma: smaVals[i - (period - 1)],
            });
        }
    }
    return results;
}

/**
 * 2) EMA
 */
export function calculateEMA(data: ProcessedDataEntry[], period: number) {
    const { close, dates } = getDataArrays(data);

    const defaultConfig = { period: period }
    const emaVals = ema(close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            results.push({ date: dates[i], ema: null });
        } else {
            results.push({
                date: dates[i],
                ema: emaVals[i - (period - 1)],
            });
        }
    }
    return results;
}

/**
 * 3) RMA
 */
export function calculateRMA(data: ProcessedDataEntry[], period: number) {
    const { close, dates } = getDataArrays(data);

    const defaultConfig = { period: period }
    const rmaVals = rma(close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            results.push({ date: dates[i], rma: null });
        } else {
            results.push({
                date: dates[i],
                rma: rmaVals[i - (period - 1)],
            });
        }
    }
    return results;
}

/**
 * 4) DEMA
 */
export function calculateDEMA(data: ProcessedDataEntry[], period: number) {
    const { close, dates } = getDataArrays(data);

    const defaultConfig = { period: period }
    const demaVals = dema(close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            results.push({ date: dates[i], dema: null });
        } else {
            results.push({
                date: dates[i],
                dema: demaVals[i - (period - 1)],
            });
        }
    }
    return results;
}

/**
 * 5) TRIMA
 */
export function calculateTRIMA(data: ProcessedDataEntry[], period: number) {
    const { close, dates } = getDataArrays(data);
    const defaultConfig = { period: period }

    const trimaVals = trima(close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            results.push({ date: dates[i], trima: null });
        } else {
            results.push({
                date: dates[i],
                trima: trimaVals[i - (period - 1)],
            });
        }
    }
    return results;
}

/**
 * 6) RSI
 */
export function calculateRSI(data: ProcessedDataEntry[], period: number) {
    const { close, dates } = getDataArrays(data);
    const defaultConfig = { period: period }

    const rsiVals = rsi(close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            results.push({ date: dates[i], rsi: null });
        } else {
            results.push({
                date: dates[i],
                rsi: rsiVals[i - (period - 1)],
            });
        }
    }
    return results;
}

/**
 * 7) TRIX
 */
export function calculateTRIX(data: ProcessedDataEntry[], period: number) {
    const { close, dates } = getDataArrays(data);

    const defaultConfig = { period: period };

    const trixVals = trix(close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            results.push({ date: dates[i], TRIX: null });
        } else {
            results.push({
                date: dates[i],
                trix: trixVals[i - (period - 1)],
            });
        }
    }
    return results;
}

/**
 * 8) STOCH
 */
export function calculateSTOCH(data: ProcessedDataEntry[], kPeriod: number, dPeriod: number) {
    const { high, low, close, dates } = getDataArrays(data);

    const defaultConfig = {
        kPeriod: kPeriod,
        dPeriod: dPeriod
    };

    const stochResult = stoch(high, low, close, defaultConfig);

    const { k: kValues, d: dValues } = stochResult;

    const results = [];

    const totalDataPoints = data.length;
    const kStartIndex = kPeriod - 1;
    const dStartIndex = kPeriod + dPeriod - 2;

    for (let i = 0; i < totalDataPoints; i++) {
        const resultEntry: {
            date: string;
            STOCH_K: number | null;
            STOCH_D: number | null;
        } = {
            date: dates[i],
            STOCH_K: null,
            STOCH_D: null,
        };

        if (i >= kStartIndex) {
            const kIdx = i - kStartIndex;
            if (kIdx < kValues.length) {
                resultEntry.STOCH_K = kValues[kIdx];
            }
        }

        if (i >= dStartIndex) {
            const dIdx = i - dStartIndex;
            if (dIdx < dValues.length) {
                resultEntry.STOCH_D = dValues[dIdx];
            }
        }

        results.push(resultEntry);
    }

    return results;
}

/**
 * 9) CCI
 */
export function calculateCCI(data: ProcessedDataEntry[], period: number) {
    const { high, low, close, dates } = getDataArrays(data);
    const defaultConfig = { period: period }
    const cciArr = cci(high, low, close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period) {
            results.push({ date: dates[i], cci: null });
        } else {
            results.push({
                date: dates[i],
                cci: cciArr[i - period],
            });
        }
    }
    return results;
}

/**
 * 10) WILLR
 */
export function calculateWILLR(data: ProcessedDataEntry[], period: number) {
    const { high, low, close, dates } = getDataArrays(data);

    const defaultConfig = { period: period }
    const willrVals = willr(high, low, close, defaultConfig);

    const results = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period) {
            results.push({ date: dates[i], willr: null });
        } else {
            results.push({
                date: dates[i],
                willr: willrVals[i - period],
            });
        }
    }
    return results;
}

/**
 * Master function to calculate indicators with dynamic parameters.
 * @param indicatorName - The name of the indicator to calculate.
 * @param data - Array of processed data entries.
 * @param params - Additional parameters required by specific indicators.
 * @returns Array of indicator results with dates.
 */
export function calculateIndicator(
    indicatorName: string,
    data: ProcessedDataEntry[],
    params: { [key: string]: number }
) {
    switch (indicatorName) {

        // Moving Averages
        case "SMA":
            return calculateSMA(data, params.period);
        case "EMA":
            return calculateEMA(data, params.period);
        case "RMA":
            return calculateRMA(data, params.period);
        case "DEMA":
            return calculateDEMA(data, params.period);
        case "TRIMA":
            return calculateTRIMA(data, params.period);

        // Oscillators
        case "RSI":
            return calculateRSI(data, params.period);
        case "TRIX":
            return calculateTRIX(data, params.period);
        case "STOCH":
            return calculateSTOCH(data, params.kPeriod, params.dPeriod);
        case "CCI":
            return calculateCCI(data, params.period);
        case "WILLR":
            return calculateWILLR(data, params.period);

        default:
            console.warn(`Indicator ${indicatorName} is not recognized.`);
            return [];
    }
}