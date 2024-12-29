export type TimeFrame = 'day' | 'week' | 'month';

interface IndicatorPeriodConfig {
    [indicatorName: string]: {
        [key in TimeFrame]: { [param: string]: number };
    };
}

export const indicatorConfig: IndicatorPeriodConfig = {
    RSI2: {
        day: { period: 14 },
        week: { period: 70 },
        month: { period: 28 },
    },
    WILLR: {
        day: { period: 14 },
        week: { period: 70 },
        month: { period: 28 },
    },
    PSAR: {
        day: { step: 0.02, max: 0.2 },
        week: { step: 0.02, max: 0.2 },
        month: { step: 0.02, max: 0.2 },
    },
    BBANDS: {
        day: { period: 20, stdDev: 2 },
        week: { period: 50, stdDev: 2 },
        month: { period: 20, stdDev: 2 },
    },
    VWMA: {
        day: { period: 20 },
        week: { period: 50 },
        month: { period: 20 },
    },
};

export function getStrategyParams(
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
