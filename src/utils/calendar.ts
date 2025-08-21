import { DayCount } from "../types/calendar";

export const formatYMD = (y: number, m0: number, d: number) =>
    `${y}-${String(m0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function getMonthMeta(date: Date) {
    const y = date.getFullYear();
    const m0 = date.getMonth(); // 0-based
    const startOfMonth = new Date(y, m0, 1);
    const endOfMonth = new Date(y, m0 + 1, 0); // 마지막 날짜
    const startDay = startOfMonth.getDay();  // 0(일)~6(토)
    const totalDays = endOfMonth.getDate();
    return { y, m0, startDay, totalDays };
}

export function toCountMap(days: DayCount[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const d of days) map.set(d.date, d.count);
    return map;
}

export function calcMaxCount(days: DayCount[]): number {
    return days.reduce((max, d) => Math.max(max, d.count), 0);
}

/** count를 강도(1~4)로 매핑 (최대값 기준 구간화) */
export function countToIntensity(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
    if (count <= 0 || maxCount <= 0) return 0;
    const r = count / maxCount;
    if (r >= 0.75) return 4;
    if (r >= 0.5)  return 3;
    if (r >= 0.25) return 2;
    return 1;
}
