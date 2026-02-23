import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import styles from "../styles/Calendar.module.css";
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import {
    formatYMD,
    getMonthMeta,
    toCountMap,
    calcMaxCount,
    countToIntensity,
} from "../utils/calendar";
import {fetchCalendarRange} from "../api/Calendar";
import {CalendarRangeResponse} from "../types/calendar";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<CalendarRangeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const navigate = useNavigate();

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

    // 하루 기록
    const goDay = (fullDate: string) => {
        console.log("goDay, fullDate: ", fullDate);
        navigate({
            pathname: "/calendar",
            search: `?${createSearchParams({
                mode: "day",
                date: fullDate,      // 예: 2025-07-03
            })}`,
        });
    };

    // 월 기록
    const goMonth = (year: number, month1: number) => {
        const mm = String(month1).padStart(2, "0");
        console.log("mm: ", mm);
        navigate({
            pathname: "/calendar",
            search: `?${createSearchParams({
                mode: "month",
                year: String(year),
                month: mm,           // 예: 07
            })}`,
        });
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
                onClick={() => goDay(fullDate)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") (e.currentTarget as HTMLDivElement).click();
                }}
                style={{ position: "relative", cursor: hasRecord ? "pointer" : "default" }}
            >
                <span>{day}</span>
                {hasRecord && <span className={styles.badge}>{count}</span>}
            </div>
        );
    }

    return (
        <div>
            <hr className={styles.hr} />
            <section className={styles.calendar}>
                <div className={styles.header}>
                    <button onClick={() => changeMonth(-1)} aria-label="이전 달"><CaretLeftIcon /></button>
                    <span className={styles.main}
                          onClick={()=> goMonth(y, m0 + 1)}>
                        <h2 className={styles.month}>{y}년 {m0 + 1}월</h2>
                        <p className={styles.subheading}>Reading Calendar</p>
                      </span>
                    <button onClick={() => changeMonth(1)} aria-label="다음 달"><CaretRightIcon /></button>
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