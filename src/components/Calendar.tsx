// src/components/Calendar.tsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/Calendar.module.css";
import {
    formatYMD,
    getMonthMeta,
    toCountMap,
    calcMaxCount,
    countToIntensity,
} from "../utils/calendar";
import {fetchCalendarRange} from "../api/ReadingRecord";
import {CalendarRangeResponse} from "../types/calendar";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<CalendarRangeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const { y, m0, startDay, totalDays } = useMemo(
        () => getMonthMeta(currentDate),
        [currentDate]
    );

    useEffect(() => {
        setLoading(true);
        setErr(null);
        fetchCalendarRange(y, m0 + 1)
            .then((res) => setData(res))
            .catch((e) => setErr(e.message))
            .finally(() => setLoading(false));
    }, [y, m0]);

    const countMap = useMemo(
        () => toCountMap(data?.days ?? []),
        [data]
    );

    const maxCount = useMemo(
        () => calcMaxCount(data?.days ?? []),
        [data]
    );

    const changeMonth = (offset: number) => {
        const d = new Date(currentDate);
        d.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(d);
    };

    const days: React.ReactNode[] = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className={styles.day} />);
    }
    for (let day = 1; day <= totalDays; day++) {
        const fullDate = formatYMD(y, m0, day);
        const count = countMap.get(fullDate) ?? 0;
        const hasRecord = count > 0;
        const intensity = countToIntensity(count, maxCount);

        days.push(
            <div
                key={day}
                className={[
                    styles.day,
                    hasRecord ? styles.active : "",
                    hasRecord ? styles[`intensity-${intensity}`] : ""
                ].join(" ")}
                title={hasRecord ? `${fullDate} · ${count}건` : fullDate}
                role="button"
                tabIndex={0}
                onClick={() => {
                    // TODO: 날짜 클릭 동작 연결 (예: navigate(`/records?day=${fullDate}`))
                    console.log("clicked", fullDate);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") (e.currentTarget as HTMLDivElement).click();
                }}
                style={{ position: "relative", cursor: hasRecord ? "pointer" : "default" }}
            >
                {day}
                {/*뱃지 쓸지 말지 고민중...*/}
                {hasRecord && <span className={styles.badge}>{count}</span>}
            </div>
        );
    }

    return (
        <div>
            <hr className={styles.hr} />
            <section className={styles.calendar}>
                <div className={styles.header}>
                    <button onClick={() => changeMonth(-1)} aria-label="이전 달">‹</button>
                    <span className={styles.main}>
            <h2>{y}/ {m0 + 1}</h2>
            <p className={styles.subheading}>Reading Calendar</p>
          </span>
                    <button onClick={() => changeMonth(1)} aria-label="다음 달">›</button>
                </div>

                {loading && <div>불러오는 중…</div>}
                {err && <div style={{ color: "crimson" }}>오류: {err}</div>}

                <div className={styles.weekdays}>
                    {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                        <div key={i} className={styles.weekday}>{d}</div>
                    ))}
                </div>

                <div className={styles.grid}>{days}</div>
            </section>
        </div>
    );
}
