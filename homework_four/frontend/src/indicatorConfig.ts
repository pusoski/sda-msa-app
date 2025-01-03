export type TimeFrame = 'day' | 'week' | 'month';

interface IndicatorPeriodConfig {
    [indicatorName: string]: {
        [key in TimeFrame]: { [param: string]: number };
    };
}

export const indicatorConfig: IndicatorPeriodConfig = {
    SMA: {
        day: { period: 10 },
        week: { period: 50 },
        month: { period: 20 },
    },
    EMA: {
        day: { period: 12 },
        week: { period: 60 },
        month: { period: 24 },
    },
    RMA: {
        day: { period: 10 },
        week: { period: 50 },
        month: { period: 20 },
    },
    DEMA: {
        day: { period: 10 },
        week: { period: 50 },
        month: { period: 20 },
    },
    TRIMA: {
        day: { period: 10 },
        week: { period: 50 },
        month: { period: 20 },
    },
    RSI: {
        day: { period: 14 },
        week: { period: 70 },
        month: { period: 28 },
    },
    TRIX: {
        day: { period: 1 },
        week: { period: 1 },
        month: { period: 1 },
    },
    STOCH: {
        day: { kPeriod: 14, dPeriod: 3 },
        week: { kPeriod: 70, dPeriod: 3 },
        month: { kPeriod: 28, dPeriod: 3 },
    },
    CCI: {
        day: { period: 14 },
        week: { period: 70 },
        month: { period: 28 },
    },
    WILLR: {
        day: { period: 14 },
        week: { period: 70 },
        month: { period: 28 },
    },
};

export function getIndicatorParams(
    indicatorName: string,
    timeFrame: TimeFrame
): { [key: string]: number } | null {
    const config = indicatorConfig[indicatorName];
    if (!config) {
        console.warn(`No configuration found for indicator: ${indicatorName}`);
        return null;
    }

    return config[timeFrame] || null;
}
