import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import styles from "../styles/Calendar.module.css";
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { formatYMD, getMonthMeta, toCountMap, calcMaxCount } from "../utils/calendar";
import { fetchCalendarRange } from "../api/Calendar";
import { CalendarRangeResponse } from "../types/calendar";

function buildHeatmapWeeks(countMap: Map<string, number>, year: number): { date: string; count: number }[][] {
    const jan1 = new Date(year, 0, 1);
    const start = new Date(year, 0, 1);
    start.setDate(1 - jan1.getDay());
    const end = new Date(year, 11, 31);
    const weeks: { date: string; count: number }[][] = [];
    const cur = new Date(start);
    while (cur <= end) {
        const week: { date: string; count: number }[] = [];
        for (let d = 0; d < 7; d++) {
            const yyyy = cur.getFullYear();
            const mm = String(cur.getMonth() + 1).padStart(2, "0");
            const dd = String(cur.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;
            week.push({ date: dateStr, count: countMap.get(dateStr) ?? 0 });
            cur.setDate(cur.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
}

function buildMonthLabels(weeks: { date: string; count: number }[][], year: number): { label: string; col: number }[] {
    const labels: { label: string; col: number }[] = [];
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
        const d = new Date(week[0].date);
        if (d.getMonth() !== lastMonth && d.getFullYear() === year) {
            labels.push({ label: MONTHS[d.getMonth()], col });
            lastMonth = d.getMonth();
        }
    });
    return labels;
}

type ViewMode = "calendar" | "heatmap";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<CalendarRangeResponse | null>(null);
    const [yearData, setYearData] = useState<CalendarRangeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [view, setView] = useState<ViewMode>("calendar");
    const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());

    const navigate = useNavigate();
    const { y, m0, startDay, totalDays } = useMemo(() => getMonthMeta(currentDate), [currentDate]);

    useEffect(() => {
        setLoading(true); setErr(null);
        fetchCalendarRange(y, m0 + 1)
            .then(res => setData(res))
            .catch(e => setErr(e.message))
            .finally(() => setLoading(false));
    }, [y, m0]);

    useEffect(() => {
        fetchCalendarRange(heatmapYear, 0)
            .then(res => setYearData(res))
            .catch(() => {});
    }, [heatmapYear]);

    const countMap = useMemo(() => toCountMap(data?.days ?? []), [data]);
    const yearCountMap = useMemo(() => toCountMap(yearData?.days ?? data?.days ?? []), [yearData, data]);

    const stats = useMemo(() => {
        const days = data?.days ?? [];
        const totalThisMonth = days.reduce((sum, d) => sum + d.count, 0);
        const activeDays = days.filter(d => d.count > 0).length;
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            if (yearCountMap.get(key)) streak++;
            else if (i > 0) break;
        }
        return { totalThisMonth, activeDays, streak };
    }, [data, yearCountMap]);

    const changeMonth = (offset: number) => {
        const d = new Date(currentDate);
        d.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(d);
    };

    const goDay = (fullDate: string) => {
        navigate({ pathname: "/calendar", search: `?${createSearchParams({ mode: "day", date: fullDate })}` });
    };
    const goMonth = (year: number, month1: number) => {
        const mm = String(month1).padStart(2, "0");
        navigate({ pathname: "/calendar", search: `?${createSearchParams({ mode: "month", year: String(year), month: mm })}` });
    };

    const days: React.ReactNode[] = [];
    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} className={styles.day} />);
    for (let day = 1; day <= totalDays; day++) {
        const fullDate = formatYMD(y, m0, day);
        const count = countMap.get(fullDate) ?? 0;
        const hasRecord = count > 0;
        days.push(
            <div
                key={day}
                className={[styles.day, hasRecord ? styles.active : "", hasRecord ? styles["intensity-4"] : ""].join(" ")}
                title={hasRecord ? `${fullDate} · ${count}건` : fullDate}
                role="button" tabIndex={0}
                onClick={() => goDay(fullDate)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") (e.currentTarget as HTMLDivElement).click(); }}
                style={{ cursor: hasRecord ? "pointer" : "default" }}
            >
                <span>{day}</span>
                {hasRecord && <span className={styles.badge}>{count}</span>}
            </div>
        );
    }

    const heatmapWeeks = useMemo(() => buildHeatmapWeeks(yearCountMap, heatmapYear), [yearCountMap, heatmapYear]);
    const monthLabels = useMemo(() => buildMonthLabels(heatmapWeeks, heatmapYear), [heatmapWeeks, heatmapYear]);
    const hmMax = useMemo(() => {
        let max = 0;
        heatmapWeeks.forEach(w => w.forEach(d => { if (d.count > max) max = d.count; }));
        return max;
    }, [heatmapWeeks]);

    const todayStr = (() => {
        const t = new Date();
        return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
    })();

    const thisYear = new Date().getFullYear();

    return (
        <div>
            <hr className={styles.hr} />
            <section className={styles.container}>

                {/* ── Left ── */}
                <div className={styles.left}>
                    <div className={styles.leftTop}>
                        <p className={styles.pageTitle}>Reading Calendar</p>

                        {/* 달력: 월 네비 */}
                        {view === "calendar" && (
                            <div className={styles.monthNav}>
                                <button onClick={() => changeMonth(-1)} aria-label="이전 달"><CaretLeftIcon size={12} /></button>
                                <span className={styles.main} onClick={() => goMonth(y, m0 + 1)}>
                                    <span className={styles.monthLabel}>{y}</span>
                                    <span className={styles.monthSep}>/</span>
                                    <span className={styles.monthLabel}>{String(m0 + 1).padStart(2, "0")}</span>
                                </span>
                                <button onClick={() => changeMonth(1)} aria-label="다음 달"><CaretRightIcon size={12} /></button>
                            </div>
                        )}

                        {/* 히트맵: 연도 네비 */}
                        {view === "heatmap" && (
                            <div className={styles.monthNav}>
                                <button onClick={() => setHeatmapYear(y => y - 1)} aria-label="이전 연도"><CaretLeftIcon size={12} /></button>
                                <span className={styles.main}>
                                    <span className={styles.monthLabel}>{heatmapYear}</span>
                                </span>
                                <button
                                    onClick={() => setHeatmapYear(y => Math.min(y + 1, thisYear))}
                                    aria-label="다음 연도"
                                    disabled={heatmapYear >= thisYear}
                                    className={heatmapYear >= thisYear ? styles.navDisabled : ""}
                                ><CaretRightIcon size={12} /></button>
                            </div>
                        )}

                        <div className={styles.viewTabs}>
                            <button className={[styles.viewTab, view === "calendar" ? styles.viewTabActive : ""].join(" ")} onClick={() => setView("calendar")}>달력</button>
                            <button className={[styles.viewTab, view === "heatmap" ? styles.viewTabActive : ""].join(" ")} onClick={() => setView("heatmap")}>히트맵</button>
                        </div>
                    </div>
                </div>

                {/* ── Stats 자리 공백 (달력 뷰만) ── */}
                {view === "calendar" && (
                    <div className={styles.statsSpacer} />
                )}

                {/* ── Right ── */}
                <div className={styles.right}>
                    {err && <div style={{ color: "crimson" }}>오류: {err}</div>}

                    {/* 달력 */}
                    {view === "calendar" && (
                        <div className={styles.calendarArea}>
                            {loading && <div />}
                            <div className={styles.weekdays}>
                                {["일","월","화","수","목","금","토"].map((d, i) => (
                                    <div key={i} className={styles.weekday}>{d}</div>
                                ))}
                            </div>
                            <div className={styles.grid}>{days}</div>
                        </div>
                    )}

                    {/* 히트맵 */}
                    {view === "heatmap" && (
                        <div className={styles.heatmapArea}>
                            {[0, 1].map((half) => {
                                const start = half === 0 ? 0 : Math.ceil(heatmapWeeks.length / 2);
                                const end = half === 0 ? Math.ceil(heatmapWeeks.length / 2) : heatmapWeeks.length;
                                const halfWeeks = heatmapWeeks.slice(start, end);
                                const halfLabels = monthLabels.filter(({ col }) => col >= start && col < end);
                                return (
                                    <div key={half} className={styles.heatmapHalf}>
                                        <div className={styles.heatmapMonthRow} style={{ gridTemplateColumns: `repeat(${halfWeeks.length}, 1fr)` }}>
                                            {halfLabels.map(({ label, col }) => (
                                                <div key={col} className={styles.heatmapMonthLabel} style={{ gridColumn: col - start + 1 }}>{label}</div>
                                            ))}
                                        </div>
                                        <div className={styles.heatmapGrid} style={{ gridTemplateColumns: `repeat(${halfWeeks.length}, 1fr)` }}>
                                            {halfWeeks.map((week, wi) => (
                                                <div key={wi} className={styles.heatmapCol}>
                                                    {week.map(({ date, count }) => {
                                                        const level = count === 0 ? 0 : Math.ceil((count / Math.max(hmMax, 1)) * 4);
                                                        const isFuture = date > todayStr;
                                                        return (
                                                            <div
                                                                key={date}
                                                                className={[styles.hmCell, isFuture ? styles.hmFuture : styles[`hmLevel${level}`]].join(" ")}
                                                                title={count > 0 ? `${date} · ${count}건` : date}
                                                                onClick={() => count > 0 && goDay(date)}
                                                                style={{ cursor: count > 0 ? "pointer" : "default" }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </section>

            {/* ══ 모바일 전용 레이아웃 ══ */}
            <section className={styles.mobileContainer}>

                {/* 모바일 헤더: 중앙 정렬 큰 월 타이틀 + 좌우 네비 */}
                <div className={styles.mobileHeader}>
                    {view === "calendar" && (
                        <button className={styles.mobileNavBtn} onClick={() => changeMonth(-1)} aria-label="이전 달">
                            <CaretLeftIcon size={16} />
                        </button>
                    )}
                    {view === "heatmap" && (
                        <button className={styles.mobileNavBtn} onClick={() => setHeatmapYear(y => y - 1)} aria-label="이전 연도">
                            <CaretLeftIcon size={16} />
                        </button>
                    )}

                    <div className={styles.mobileTitleBlock}>
                        {view === "calendar" && (
                            <h2 className={styles.mobileDateTitle} onClick={() => goMonth(y, m0 + 1)}>
                                {y}년 {m0 + 1}월
                            </h2>
                        )}
                        {view === "heatmap" && (
                            <h2 className={styles.mobileDateTitle}>{heatmapYear}년</h2>
                        )}
                        <div className={styles.mobileViewToggle}>
                            <button
                                className={[styles.mobileToggleBtn, view === "calendar" ? styles.mobileToggleActive : ""].join(" ")}
                                onClick={() => setView("calendar")}
                            >달력</button>
                            <span className={styles.mobileToggleSep} />
                            <button
                                className={[styles.mobileToggleBtn, view === "heatmap" ? styles.mobileToggleActive : ""].join(" ")}
                                onClick={() => setView("heatmap")}
                            >히트맵</button>
                        </div>
                    </div>

                    {view === "calendar" && (
                        <button className={styles.mobileNavBtn} onClick={() => changeMonth(1)} aria-label="다음 달">
                            <CaretRightIcon size={16} />
                        </button>
                    )}
                    {view === "heatmap" && (
                        <button
                            className={styles.mobileNavBtn}
                            onClick={() => setHeatmapYear(y => Math.min(y + 1, thisYear))}
                            disabled={heatmapYear >= thisYear}
                            style={{ opacity: heatmapYear >= thisYear ? 0.25 : 1 }}
                            aria-label="다음 연도"
                        >
                            <CaretRightIcon size={16} />
                        </button>
                    )}
                </div>

                {/* 모바일 달력: 가운데 정렬 */}
                {view === "calendar" && (
                    <div className={styles.mobileCalendar}>
                        <div className={styles.weekdays}>
                            {["일","월","화","수","목","금","토"].map((d, i) => (
                                <div key={i} className={styles.weekday}>{d}</div>
                            ))}
                        </div>
                        <div className={styles.grid}>{days}</div>
                    </div>
                )}

                {/* 모바일 히트맵: scroll-snap 캐러셀 */}
                {view === "heatmap" && (
                    <div className={styles.mobileHeatmapCarousel}>
                        <div className={styles.mobileHeatmapTrack}>
                            {[0, 1].map((half) => {
                                const start = half === 0 ? 0 : Math.ceil(heatmapWeeks.length / 2);
                                const end = half === 0 ? Math.ceil(heatmapWeeks.length / 2) : heatmapWeeks.length;
                                const halfWeeks = heatmapWeeks.slice(start, end);
                                const halfLabels = monthLabels.filter(({ col }) => col >= start && col < end);
                                return (
                                    <div key={half} className={styles.mobileHeatmapSlide}>
                                        <div className={styles.heatmapMonthRow} style={{ gridTemplateColumns: `repeat(${halfWeeks.length}, 1fr)` }}>
                                            {halfLabels.map(({ label, col }) => (
                                                <div key={col} className={styles.heatmapMonthLabel} style={{ gridColumn: col - start + 1 }}>{label}</div>
                                            ))}
                                        </div>
                                        <div className={styles.heatmapGrid} style={{ gridTemplateColumns: `repeat(${halfWeeks.length}, 1fr)` }}>
                                            {halfWeeks.map((week, wi) => (
                                                <div key={wi} className={styles.heatmapCol}>
                                                    {week.map(({ date, count }) => {
                                                        const level = count === 0 ? 0 : Math.ceil((count / Math.max(hmMax, 1)) * 4);
                                                        const isFuture = date > todayStr;
                                                        return (
                                                            <div
                                                                key={date}
                                                                className={[styles.hmCell, isFuture ? styles.hmFuture : styles[`hmLevel${level}`]].join(" ")}
                                                                title={count > 0 ? `${date} · ${count}건` : date}
                                                                onClick={() => count > 0 && goDay(date)}
                                                                style={{ cursor: count > 0 ? "pointer" : "default" }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </section>
        </div>
    );
}