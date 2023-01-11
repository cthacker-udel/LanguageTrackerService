import type {
    ActivityLanguage,
    ActivityLevel,
    ActivityType,
    TimeMeasurement,
} from "./ActivityEnums";

export type Activity = {
    activity_date: Date;
    description: string;
    language_type: ActivityLanguage;
    activity_level: ActivityLevel;
    link: string;
    title: string;
    total_time: number;
    time_type: TimeMeasurement;
    activity_type: ActivityType;
};
