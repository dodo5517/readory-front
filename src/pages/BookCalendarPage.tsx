import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import styles from "../styles/BookCalendarPage.module.css";
import { formatYMD, getMonthMeta, toCountMap, toCoverMap } from "../utils/calendar";
import { fetchCalendarRange } from "../api/Calendar";
import { CalendarRangeResponse } from "../types/calendar";
import GridPickerPopover from "../components/calendar/GridPickerPopover";

type ViewMode = "month" | "year";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ["일","월","화","수","목","금","토"];
const MINI_WEEKDAYS = ["S","M","T","W","T","F","S"];

export default function BookCalendarPage() {
    const navigate = useNavigate();

    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth(); // 0-based

    const [view, setView] = useState<ViewMode>("month");
    const [currentDate, setCurrentDate] = useState(() => new Date(thisYear, thisMonth, 1));
    const [viewYear, setViewYear] = useState(thisYear);

    const [monthData, setMonthData] = useState<CalendarRangeResponse | null>(null);
    const [yearData, setYearData] = useState<CalendarRangeResponse | null>(null);

    const { y, m0, startDay, totalDays } = useMemo(() => getMonthMeta(currentDate), [currentDate]);

    const isCurrentMonth = y === thisYear && m0 === thisMonth;
    const isFutureMonth = y > thisYear || (y === thisYear && m0 > thisMonth);

    useEffect(() => {
        if (isFutureMonth) setCurrentDate(new Date(thisYear, thisMonth, 1));
    }, [isFutureMonth, thisYear, thisMonth]);

    useEffect(() => {
        if (view !== "month") return;
        fetchCalendarRange(y, m0 + 1)
            .then(res => setMonthData(res))
            .catch(() => {});
    }, [view, y, m0]);

    useEffect(() => {
        if (view !== "year") return;
        fetchCalendarRange(viewYear, 0)
            .then(res => setYearData(res))
            .catch(() => {});
    }, [view, viewYear]);

    const countMap = useMemo(() => toCountMap(monthData?.days ?? []), [monthData]);
    const coverMap = useMemo(() => toCoverMap(monthData?.days ?? []), [monthData]);

    const yearCountMap = useMemo(() => toCountMap(yearData?.days ?? []), [yearData]);
    const yearCoverMap = useMemo(() => toCoverMap(yearData?.days ?? []), [yearData]);

    const changeMonth = (offset: number) => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + offset);
        const ny = d.getFullYear(), nm = d.getMonth();
        if (ny > thisYear || (ny === thisYear && nm > thisMonth)) return;
        setCurrentDate(d);
    };

    const goDay = (date: string) => {
        navigate({ pathname: "/readingRecords", search: `?${createSearchParams({ mode: "day", date })}` });
    };

    const switchToMonth = (year: number, month1: number) => {
        setCurrentDate(new Date(year, month1 - 1, 1));
        setView("month");
    };

    // ── Month view cells ──
    const monthCells: React.ReactNode[] = [];
    for (let i = 0; i < startDay; i++) {
        monthCells.push(<div key={`e-${i}`} className={styles.cell} />);
    }
    for (let day = 1; day <= totalDays; day++) {
        const fullDate = formatYMD(y, m0, day);
        const count = countMap.get(fullDate) ?? 0;
        const coverUrl = coverMap.get(fullDate) ?? null;
        const hasRecord = count > 0;
        monthCells.push(
            <div
                key={day}
                className={[styles.cell, hasRecord ? styles.cellActive : ""].filter(Boolean).join(" ")}
                onClick={() => { if (hasRecord) goDay(fullDate); }}
                title={hasRecord ? `${fullDate} · ${count}건` : undefined}
                role={hasRecord ? "button" : undefined}
                tabIndex={hasRecord ? 0 : undefined}
                onKeyDown={hasRecord
                    ? (e) => { if (e.key === "Enter" || e.key === " ") goDay(fullDate); }
                    : undefined
                }
            >
                <span className={styles.dayNum}>{day}</span>
                {hasRecord && coverUrl && (
                    <div
                        className={styles.coverThumb}
                        style={{ backgroundImage: `url(${coverUrl})` }}
                    />
                )}
                {hasRecord && !coverUrl && <span className={styles.dot} />}
                {hasRecord && coverUrl && count >= 2 && (
                    <span className={styles.coverMore}>+{count - 1}</span>
                )}
            </div>
        );
    }

    // ── Year view: 12 mini months ──
    const renderMiniMonth = (monthIdx: number) => {
        const month1 = monthIdx + 1;
        const mm = String(month1).padStart(2, "0");
        const daysInMonth = new Date(viewYear, monthIdx + 1, 0).getDate();
        const firstDow = new Date(viewYear, monthIdx, 1).getDay();
        const isFuture = viewYear > thisYear || (viewYear === thisYear && monthIdx > thisMonth);

        const miniCells: React.ReactNode[] = [];
        for (let i = 0; i < firstDow; i++) {
            miniCells.push(<div key={`me-${i}`} className={styles.miniCell} />);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${viewYear}-${mm}-${String(d).padStart(2, "0")}`;
            const count = yearCountMap.get(dateStr) ?? 0;
            const coverUrl = yearCoverMap.get(dateStr) ?? null;
            const hasRecord = count > 0;
            miniCells.push(
                <div key={d} className={styles.miniCell}>
                    {hasRecord && coverUrl && (
                        <div className={styles.miniCoverThumb} style={{ backgroundImage: `url(${coverUrl})` }} />
                    )}
                    {hasRecord && !coverUrl && <span className={styles.miniDot} />}
                </div>
            );
        }

        return (
            <div key={monthIdx} className={[styles.miniMonth, isFuture ? styles.miniMonthFuture : ""].filter(Boolean).join(" ")}>
                <div
                    className={styles.miniMonthHeader}
                    onClick={() => { if (!isFuture) switchToMonth(viewYear, month1); }}
                    style={{ cursor: isFuture ? "default" : "pointer" }}
                >
                    {MONTH_LABELS[monthIdx]}
                </div>
                <div className={styles.miniWeekdays}>
                    {MINI_WEEKDAYS.map((wd, i) => (
                        <div key={i} className={styles.miniWeekday}>{wd}</div>
                    ))}
                </div>
                <div className={styles.miniGrid}>{miniCells}</div>
            </div>
        );
    };

    const isNextYearDisabled = view === "year" ? viewYear >= thisYear : isCurrentMonth;

    return (
        <div className={styles.page}>
            {/* ── 헤더 ── */}
            <div className={styles.pageHeader}>
                <h1 className={styles.title}>Reading Calendar</h1>

                <div className={styles.navRow}>
                    {/* 이전 버튼 */}
                    <button
                        className={styles.navBtn}
                        onClick={() => view === "month" ? changeMonth(-1) : setViewYear(yr => yr - 1)}
                        aria-label="이전"
                    >
                        <CaretLeftIcon size={12} />
                    </button>

                    {/* 날짜 피커 */}
                    {view === "month" && (
                        <GridPickerPopover
                            mode="month"
                            value={{ year: y, month: m0 + 1 }}
                            label={
                                <span className={styles.navLabel}>
                                    <span className={styles.navYear}>{y}</span>
                                    <span className={styles.navSep}>/</span>
                                    <span className={styles.navMonth}>{String(m0 + 1).padStart(2, "0")}</span>
                                </span>
                            }
                            onSelectMonth={(yr, mo) => setCurrentDate(new Date(yr, mo - 1, 1))}
                            maxYear={thisYear}
                            maxMonth={thisMonth + 1}
                        />
                    )}
                    {view === "year" && (
                        <GridPickerPopover
                            mode="year"
                            value={{ year: viewYear }}
                            label={
                                <span className={styles.navLabel}>
                                    <span className={styles.navYear}>{viewYear}</span>
                                </span>
                            }
                            onSelectYear={(yr) => { if (yr <= thisYear) setViewYear(yr); }}
                            maxYear={thisYear}
                        />
                    )}

                    {/* 다음 버튼 */}
                    <button
                        className={styles.navBtn}
                        onClick={() => {
                            if (view === "month") changeMonth(1);
                            else setViewYear(yr => Math.min(yr + 1, thisYear));
                        }}
                        disabled={isNextYearDisabled}
                        aria-label="다음"
                    >
                        <CaretRightIcon size={12} />
                    </button>

                    <span className={styles.controlSep} />

                    {/* Month / Year 탭 */}
                    <div className={styles.viewTabs}>
                        <button
                            className={[styles.viewTab, view === "month" ? styles.viewTabActive : ""].filter(Boolean).join(" ")}
                            onClick={() => setView("month")}
                        >Month</button>
                        <button
                            className={[styles.viewTab, view === "year" ? styles.viewTabActive : ""].filter(Boolean).join(" ")}
                            onClick={() => setView("year")}
                        >Year</button>
                    </div>
                </div>
            </div>

            <hr className={styles.hr} />

            {/* ── 콘텐츠 ── */}
            <div className={styles.calendarWrap}>
                {view === "month" && (
                    <div>
                        <div className={styles.weekdays}>
                            {WEEKDAYS.map((wd, i) => (
                                <div key={i} className={styles.weekday}>{wd}</div>
                            ))}
                        </div>
                        <div className={styles.monthGrid}>
                            {monthCells}
                        </div>
                    </div>
                )}

                {view === "year" && (
                    <div className={styles.yearView}>
                        {Array.from({ length: 12 }, (_, i) => renderMiniMonth(i))}
                    </div>
                )}
            </div>
        </div>
    );
}
