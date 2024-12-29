import { rsi, bb, willr, vwma, sma, psar, Trend } from "indicatorts";

interface Asset {
    dates: Date[],
    closings: number[],
    highs: number[],
    lows: number[],
    volumes: number[]
}

enum Action {
    SELL = -1,
    HOLD = 0,
    BUY = 1
}

// @ts-ignore
export function rsi2Strategy(asset: Asset, config): Action[] {
    const indicator = rsi(asset.closings, config);

    const actions = new Array<Action>(indicator.length);
    for (let i = 0; i < actions.length; i++) {
        if (indicator[i] < 10) {
            actions[i] = Action.BUY;
        } else if (indicator[i] > 90) {
            actions[i] = Action.SELL;
        } else {
            actions[i] = Action.HOLD;
        }
    }

    return actions;
}

// @ts-ignore
export function bbStrategy(asset: Asset, config): Action[] {
    const result = bb(asset.closings, config);

    const actions = new Array<Action>(result.upper.length);

    for (let i = 0; i < actions.length; i++) {
        if (asset.closings[i] > result.upper[i]) {
            actions[i] = Action.SELL;
        } else if (asset.closings[i] < result.lower[i]) {
            actions[i] = Action.BUY;
        } else {
            actions[i] = Action.HOLD;
        }
    }

    return actions;
}

// @ts-ignore
export function willRStrategy(asset: Asset, config): Action[] {
    const result = willr(asset.highs, asset.lows, asset.closings, config);

    return result.map((value) => {
        if (value <= -80) {
            return Action.BUY;
        } else if (value >= -20) {
            return Action.SELL;
        } else {
            return Action.HOLD;
        }
    });
}

// @ts-ignore
export function vwmaStrategy(asset: Asset, config): Action[] {
    const smaValues = sma(asset.closings, config);
    const vwmaValues = vwma(asset.closings, asset.volumes, config);

    const result = new Array<Action>(vwmaValues.length);

    for (let i = 0; i < result.length; i++) {
        if (vwmaValues[i] > smaValues[i]) {
            result[i] = Action.BUY;
        } else if (vwmaValues[i] < smaValues[i]) {
            result[i] = Action.SELL;
        } else {
            result[i] = Action.HOLD;
        }
    }

    return result;
}

// @ts-ignore
export function psarStrategy(asset: Asset, config): Action[] {
    const result = psar(asset.highs, asset.lows, asset.closings, config);

    return result.trends.map((trend) => {
        switch (trend) {
            case Trend.FALLING:
                return Action.SELL;
            case Trend.RISING:
                return Action.BUY;
            case Trend.STABLE:
                return Action.HOLD;
            default:
                return Action.HOLD;
        }
    });
}

interface ProcessedDataEntry {
    date: string;
    last_trade_price: number;
    max: number;
    min: number;
    volume: number;
}

function convertToAsset(data: ProcessedDataEntry[]): Asset {
    return {
        dates: data.map(d => new Date(d.date)),
        closings: data.map(d => d.last_trade_price),
        highs: data.map(d => d.max),
        lows: data.map(d => d.min),
        volumes: data.map(d => d.volume),
    };
}


export function calculateRSI2Strategy(data: ProcessedDataEntry[], period: number) {
    const asset = convertToAsset(data);
    const config = { period };
    const actions: Action[] = rsi2Strategy(asset, config);

    return data.map((d, i) => ({
        date: d.date,
        action: actions[i],
    }));
}

export function calculateBBANDSStrategy(data: ProcessedDataEntry[], period: number) {
    const asset = convertToAsset(data);
    const config = { period };
    const actions: Action[] = bbStrategy(asset, config);

    return data.map((d, i) => ({
        date: d.date,
        action: actions[i],
    }));
}

export function calculateWILLRStrategy(data: ProcessedDataEntry[], period: number) {
    const asset = convertToAsset(data);
    const config = { period };
    const actions: Action[] = willRStrategy(asset, config);

    return data.map((d, i) => ({
        date: d.date,
        action: actions[i],
    }));
}

export function calculateVWMAStrategy(data: ProcessedDataEntry[], period: number) {
    const asset = convertToAsset(data);
    const config = { period };
    const actions: Action[] = vwmaStrategy(asset, config);

    return data.map((d, i) => ({
        date: d.date,
        action: actions[i],
    }));
}

export function calculatePSARStrategy(data: ProcessedDataEntry[], step: number, max: number) {
    const asset = convertToAsset(data);
    const config = { step, max };
    const actions: Action[] = psarStrategy(asset, config);

    return data.map((d, i) => ({
        date: d.date,
        action: actions[i],
    }));
}


/**
 * Master function to calculate strategies with dynamic parameters.
 * @param strategyName - The name of the strategy to calculate.
 * @param data - Array of processed data entries.
 * @param params - Additional parameters required by specific strategies.
 * @returns Array of strategy actions with dates.
 */

export function calculateStrategy(
    strategyName: string,
    data: ProcessedDataEntry[],
    params: { [key: string]: number }
) {
    switch (strategyName) {

        case "RSI2":
            return calculateRSI2Strategy(data, params.period);
        case "BBANDS":
            return calculateBBANDSStrategy(data, params.period);
        case "WILLR":
            return calculateWILLRStrategy(data, params.period);
        case "VWMA":
            return calculateVWMAStrategy(data, params.period);
        case "PSAR":
            return calculatePSARStrategy(data, params.acceleration, params.maximum);

        default:
            console.warn(`${strategyName} is not recognized.`);
            return [];
    }
}