export interface DayCount {
    date: string;   // YYYY-MM-DD
    count: number;
}

export interface CalendarSummary {
    totalDaysWithRecord: number;
    totalRecords: number;
    firstRecordedAt: string; // YYYY-MM-DD
    lastRecordedAt: string;  // YYYY-MM-DD
}

export interface CalendarRangeResponse {
    rangeStart: string;          // YYYY-MM-DD (inclusive)
    rangeEndExclusive: string;   // YYYY-MM-DD (exclusive)
    days: DayCount[];
    summary: CalendarSummary;
}
