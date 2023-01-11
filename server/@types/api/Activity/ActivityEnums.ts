/* eslint-disable no-shadow -- does not work with enums */
/* eslint-disable no-unused-vars -- does not work with enums */

enum ActivityLevel {
    NONE = -1,
    VERYEASY = 0,
    EASY = 1,
    EASYMEDIUM = 2,
    MEDIUM = 3,
    MEDIUMHARD = 4,
    HARD = 5,
    VERYHARD = 6,
    INSANE = 7,
}

enum TimeMeasurement {
    NONE = -1,
    SECONDS = 0,
    MINUTES = 1,
    HOURS = 2,
}

enum ActivityType {
    NONE = -1,
    CODEWARS = 0,
    EDABIT = 1,
    LEETCODE = 2,
    LANGUAGES = 3,
}

enum ActivityLanguage {
    NONE = -1,
    PYTHON = 0,
    JAVASCRIPT = 1,
    TYPESCRIPT = 2,
    C = 3,
    CPP = 4,
    CSHARP = 5,
    SQL = 6,
    JAVA = 7,
    HTML = 8,
    CSS = 9,
}

export { ActivityLanguage, ActivityLevel, ActivityType, TimeMeasurement };
