import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import styles from "../styles/Calendar.module.css";
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { formatYMD, getMonthMeta, toCountMap } from "../utils/calendar";
import { fetchCalendarRange } from "../api/Calendar";
import { CalendarRangeResponse } from "../types/calendar";

const HM_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface MonthShelf { month: string; totalCount: number; isPast: boolean; }

/** 월별 총 기록 수 집계 */
function buildMonthShelves(countMap: Map<string, number>, year: number, todayStr: string): MonthShelf[] {
    return HM_MONTHS.map((month, m) => {
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        let totalCount = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            if (dateStr <= todayStr) totalCount += countMap.get(dateStr) ?? 0;
        }
        const lastDay = `${year}-${String(m + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
        const isPast = lastDay <= todayStr;
        return { month, totalCount, isPast };
    });
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
    const [shelfWidth, setShelfWidth] = useState(120);
    const shelfAreaRef = useRef<HTMLDivElement>(null);
    const [mobileShelfWidth, setMobileShelfWidth] = useState(90);
    const mobileShelfAreaRef = useRef<HTMLDivElement>(null);

    // 데스크탑 칸 너비 측정
    useEffect(() => {
        if (!shelfAreaRef.current) return;
        const measure = () => {
            const el = shelfAreaRef.current;
            if (!el) return;
            const totalGap = 5 * 16;
            const w = Math.floor((el.clientWidth - totalGap) / 6);
            setShelfWidth(Math.max(80, w));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(shelfAreaRef.current);
        return () => ro.disconnect();
    }, [view]);

    // 모바일 칸 너비 측정 (3열, gap 12px)
    useEffect(() => {
        if (!mobileShelfAreaRef.current) return;
        const measure = () => {
            const el = mobileShelfAreaRef.current;
            if (!el) return;
            const totalGap = 2 * 12;
            const w = Math.floor((el.clientWidth - totalGap) / 3);
            setMobileShelfWidth(Math.max(70, w));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(mobileShelfAreaRef.current);
        return () => ro.disconnect();
    }, [view]);

    const navigate = useNavigate();
    const { y, m0, startDay, totalDays } = useMemo(() => getMonthMeta(currentDate), [currentDate]);

    // ── 오늘 기준으로 미래 달 이동 막기
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth(); // 0-based
    const isCurrentMonth = y === thisYear && m0 === thisMonth;
    const isFutureMonth = y > thisYear || (y === thisYear && m0 > thisMonth);

    // 미래 달이면 현재 달로 보정
    useEffect(() => {
        if (isFutureMonth) {
            setCurrentDate(new Date(thisYear, thisMonth, 1));
        }
    }, [isFutureMonth, thisYear, thisMonth]);

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

    const changeMonth = (offset: number) => {
        const d = new Date(currentDate);
        d.setMonth(currentDate.getMonth() + offset);
        // 미래 달로 이동 불가
        const ny = d.getFullYear(), nm = d.getMonth();
        if (ny > thisYear || (ny === thisYear && nm > thisMonth)) return;
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

    const todayStr = (() => {
        const t = new Date();
        return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
    })();

    const monthShelves = useMemo(
        () => buildMonthShelves(yearCountMap, heatmapYear, todayStr),
        [yearCountMap, heatmapYear, todayStr]
    );
    const hmMax = useMemo(() => {
        return Math.max(...monthShelves.map(s => s.totalCount), 1);
    }, [monthShelves]);

    return (
        <div>
            <hr className={styles.hr} />
            <section className={styles.container}>

                {/* ── Left ── */}
                <div className={styles.left}>
                    <div className={styles.leftTop}>
                        <p className={styles.pageTitle}>Activity Log</p>

                        {/* 달력: 월 네비 */}
                        {view === "calendar" && (
                            <div className={styles.monthNav}>
                                <button onClick={() => changeMonth(-1)} aria-label="이전 달"><CaretLeftIcon size={12} /></button>
                                <span className={styles.main} onClick={() => goMonth(y, m0 + 1)}>
                                    <span className={styles.monthLabel}>{y}</span>
                                    <span className={styles.monthSep}>/</span>
                                    <span className={styles.monthLabel}>{String(m0 + 1).padStart(2, "0")}</span>
                                </span>
                                <button
                                    onClick={() => changeMonth(1)}
                                    aria-label="다음 달"
                                    disabled={isCurrentMonth}
                                    className={isCurrentMonth ? styles.navDisabled : ""}
                                ><CaretRightIcon size={12} /></button>
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
                            <button className={[styles.viewTab, view === "calendar" ? styles.viewTabActive : ""].join(" ")} onClick={() => setView("calendar")}>Calendar</button>
                            <button className={[styles.viewTab, view === "heatmap" ? styles.viewTabActive : ""].join(" ")} onClick={() => setView("heatmap")}>Heatmap</button>
                        </div>
                    </div>
                </div>

                {/* ── Stats 자리 공백 (달력 + 히트맵 뷰 모두) ── */}
                <div className={styles.statsSpacer} />

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

                    {view === "heatmap" && (
                        <div className={styles.heatmapWrapper}>
                            <div className={styles.bookshelfArea} ref={shelfAreaRef}>
                                {monthShelves.map(({ month, totalCount }) => {
                                    // 칸 너비 기반으로 책 너비·개수 동적 계산
                                    const PADDING = 6; // shelfInner padding × 2
                                    const GAP = 3;
                                    const BOOK_WIDTHS = [20, 17, 23, 19, 21]; // 5종 너비 패턴
                                    const availW = shelfWidth - PADDING;
                                    // 몇 권까지 들어가는지 계산
                                    let cumW = 0; let maxBooks = 0;
                                    for (let i = 0; i < 20; i++) {
                                        const bw = BOOK_WIDTHS[i % 5];
                                        cumW += bw + (i > 0 ? GAP : 0);
                                        if (cumW > availW) break;
                                        maxBooks++;
                                    }
                                    maxBooks = Math.max(1, maxBooks);
                                    const bookCount = totalCount === 0 ? 0 : Math.max(1, Math.round((totalCount / hmMax) * maxBooks));
                                    return (
                                        <div key={month} className={styles.shelf}>
                                            <div className={styles.shelfInner}>
                                                <div className={styles.shelfRow}>
                                                    {Array.from({ length: bookCount }).map((_, i) => (
                                                        <div key={i} className={[styles.book, styles[`bookColor${(i % 5) + 1}`]].join(" ")}>
                                                            <div className={styles.bookCap} />
                                                            <div className={styles.bookStripe1} />
                                                            <div className={styles.bookStripe2} />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className={styles.shelfBoard} />
                                            </div>
                                            <div className={styles.shelfLabel}>
                                                {month}
                                                {totalCount > 0 && <span className={styles.shelfCount}>{totalCount}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className={styles.hmLegend}>
                                <span className={styles.hmLegendLabel}>fewer</span>
                                {[0, 1, 2, 3].map(level => (
                                    <div key={level} className={styles.hmLegendShelf}>
                                        <div className={styles.hmLegendRow}>
                                            {Array.from({ length: level }).map((_, i) => (
                                                <div key={i} className={[styles.hmLegendBook, styles[`hmLegendL${level}`]].join(" ")} />
                                            ))}
                                        </div>
                                        <div className={styles.hmLegendBoard} />
                                    </div>
                                ))}
                                <span className={styles.hmLegendLabel}>more</span>
                            </div>
                        </div>
                    )}
                </div>

            </section>

            {/* ══ 모바일 전용 레이아웃 ══ */}
            <section className={styles.mobileContainer}>

                {/* ── 모바일: 타이틀 + 서브라인  */}
                <div className={styles.mobileTop}>
                    <p className={styles.pageTitle}>Activity Log</p>
                    <div className={styles.mobileSubLine}>
                        <button
                            className={styles.mobileNavBtn}
                            onClick={() => view === "calendar" ? changeMonth(-1) : setHeatmapYear(y => y - 1)}
                            aria-label="이전"
                        ><CaretLeftIcon size={13} /></button>

                        {view === "calendar" && (
                            <span className={styles.mobileDateTitle} onClick={() => goMonth(y, m0 + 1)}>
                                {y} / {String(m0 + 1).padStart(2, "0")}
                            </span>
                        )}
                        {view === "heatmap" && (
                            <span className={styles.mobileDateTitle}>{heatmapYear}</span>
                        )}

                        {view === "calendar" && (
                            <button
                                className={styles.mobileNavBtn}
                                onClick={() => changeMonth(1)}
                                disabled={isCurrentMonth}
                                style={{ opacity: isCurrentMonth ? 0.25 : 1 }}
                                aria-label="다음"
                            ><CaretRightIcon size={13} /></button>
                        )}
                        {view === "heatmap" && (
                            <button
                                className={styles.mobileNavBtn}
                                onClick={() => setHeatmapYear(y => Math.min(y + 1, thisYear))}
                                disabled={heatmapYear >= thisYear}
                                style={{ opacity: heatmapYear >= thisYear ? 0.25 : 1 }}
                                aria-label="다음"
                            ><CaretRightIcon size={13} /></button>
                        )}

                        <span className={styles.mobileSubSep} />

                        <div className={styles.mobileViewToggle}>
                            <button
                                className={[styles.mobileToggleBtn, view === "calendar" ? styles.mobileToggleActive : ""].join(" ")}
                                onClick={() => setView("calendar")}
                            >Calendar</button>
                            <button
                                className={[styles.mobileToggleBtn, view === "heatmap" ? styles.mobileToggleActive : ""].join(" ")}
                                onClick={() => setView("heatmap")}
                            >Heatmap</button>
                        </div>
                    </div>
                </div>

                {/* 모바일 달력 */}
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

                {/* 모바일 책장 히트맵 */}
                {view === "heatmap" && (
                    <div className={styles.heatmapWrapperMobile}>
                        <div className={styles.bookshelfAreaMobile} ref={mobileShelfAreaRef}>
                            {monthShelves.map(({ month, totalCount }) => {
                                const PADDING = 8;
                                const GAP = 3;
                                const BOOK_WIDTHS = [18, 15, 20, 17, 18];
                                const availW = mobileShelfWidth - PADDING;
                                let cumW = 0; let maxBooks = 0;
                                for (let i = 0; i < 20; i++) {
                                    const bw = BOOK_WIDTHS[i % 5];
                                    cumW += bw + (i > 0 ? GAP : 0);
                                    if (cumW > availW) break;
                                    maxBooks++;
                                }
                                maxBooks = Math.max(1, maxBooks);
                                const bookCount = totalCount === 0 ? 0 : Math.max(1, Math.round((totalCount / hmMax) * maxBooks));
                                return (
                                    <div key={month} className={styles.shelf}>
                                        <div className={styles.shelfInner}>
                                            <div className={styles.shelfRow}>
                                                {Array.from({ length: bookCount }).map((_, i) => (
                                                    <div key={i} className={[styles.book, styles[`bookColor${(i % 5) + 1}`]].join(" ")}>
                                                        <div className={styles.bookCap} />
                                                        <div className={styles.bookStripe1} />
                                                        <div className={styles.bookStripe2} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.shelfBoard} />
                                        </div>
                                        <div className={styles.shelfLabel}>
                                            {month}
                                            {totalCount > 0 && <span className={styles.shelfCount}>{totalCount}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.hmLegend}>
                            <span className={styles.hmLegendLabel}>fewer</span>
                            {[0, 1, 2, 3].map(level => (
                                <div key={level} className={styles.hmLegendShelf}>
                                    <div className={styles.hmLegendRow}>
                                        {Array.from({ length: level }).map((_, i) => (
                                            <div key={i} className={[styles.hmLegendBook, styles[`hmLegendL${level}`]].join(" ")} />
                                        ))}
                                    </div>
                                    <div className={styles.hmLegendBoard} />
                                </div>
                            ))}
                            <span className={styles.hmLegendLabel}>more</span>
                        </div>
                    </div>
                )}

            </section>
        </div>
    );
}