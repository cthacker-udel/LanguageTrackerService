import type { ActivityLevel, TimeMeasurement } from "./ActivityEnums";

type ActivityData = {
    title: string;
    description: string;
    link: string;
    totalTime: string;
    totalTimeMeasurement: TimeMeasurement;
    level: ActivityLevel;
};

export type { ActivityData };
