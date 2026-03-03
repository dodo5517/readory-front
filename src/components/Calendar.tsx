import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import styles from "../styles/Calendar.module.css";
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { formatYMD, getMonthMeta, toCountMap } from "../utils/calendar";
import { fetchCalendarRange } from "../api/Calendar";
import { CalendarRangeResponse } from "../types/calendar";

const HM_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BOOK_WIDTHS  = [12,14,16,18,20,22,24,26,28,30,13,17,21,25,15,19,23,27,11,29,16,22,14,20,26,18,24,13,28,21];
const BOOK_HEIGHTS = [52,58,64,70,76,82,88,94,100,106,55,67,73,85,91,103,60,72,80,96,48,65,78,88,56,74,84,98,62,90];

function seededRand(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

const MONTH_PALETTES: string[][] = Array.from({ length: 12 }, (_, m) =>
    [1, 2, 3, 4].map(i => `var(--book-${m + 1}-${i})`)
);

function pickBookColor(m: number, bookIdx: number): string {
    const palette = MONTH_PALETTES[m];
    return palette[bookIdx % palette.length];
}

interface BookSpine {
    idx: number;
    ghost: boolean;
    days: number;
    width: number;
    height: number;
    color: string;
}

interface MonthShelf {
    month: string;
    totalCount: number;
    isPast: boolean;
    books: BookSpine[];
    totalSlots: number;
}

function buildMonthShelves(
    countMap: Map<string, number>,
    year: number,
    todayStr: string,
    daysPerBook: number
): MonthShelf[] {
    return HM_MONTHS.map((month, m) => {
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        const lastDay = `${year}-${String(m + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
        const isPast = lastDay <= todayStr;
        const mm = String(m + 1).padStart(2, "0");
        const totalSlots = Math.ceil(daysInMonth / daysPerBook);
        let totalCount = 0;

        const slotHasRecord: boolean[] = Array.from({ length: totalSlots }, (_, i) => {
            const dayStart = i * daysPerBook + 1;
            const dayEnd = Math.min((i + 1) * daysPerBook, daysInMonth);
            let hasAny = false;
            for (let d = dayStart; d <= dayEnd; d++) {
                const dateStr = `${year}-${mm}-${String(d).padStart(2, "0")}`;
                if (dateStr > todayStr) break;
                const cnt = countMap.get(dateStr) ?? 0;
                totalCount += cnt;
                if (cnt > 0) hasAny = true;
            }
            return hasAny;
        });

        const books: BookSpine[] = Array.from({ length: totalSlots }, (_, i) => {
            const seed = m * 100 + i;
            const wIdx = Math.floor(seededRand(seed) * BOOK_WIDTHS.length);
            const hIdx = Math.floor(seededRand(seed + 50) * BOOK_HEIGHTS.length);
            return {
                idx: i,
                ghost: !slotHasRecord[i],
                days: daysPerBook,
                width: BOOK_WIDTHS[wIdx],
                height: BOOK_HEIGHTS[hIdx],
                color: pickBookColor(m, i),
            };
        });

        return { month, totalCount, isPast, books, totalSlots };
    });
}

type ViewMode = "calendar" | "heatmap";

function clipBooks(books: BookSpine[], maxW: number, gap = 2, scale = 1): BookSpine[] {
    let acc = 0;
    const result: BookSpine[] = [];
    for (const b of books) {
        const bw = b.width * scale;
        const w = bw + (result.length > 0 ? gap : 0);
        if (!b.ghost && acc + w > maxW) break;
        acc += b.ghost ? bw + gap : w;
        result.push(b);
    }
    return result;
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<CalendarRangeResponse | null>(null);
    const [yearData, setYearData] = useState<CalendarRangeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [view, setView] = useState<ViewMode>("calendar");
    const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());

    const shelfAreaRef = useRef<HTMLDivElement>(null);
    const mobileShelfAreaRef = useRef<HTMLDivElement>(null);

    const [daysPerBook, setDaysPerBook] = useState(6);
    const [mobileDaysPerBook, setMobileDaysPerBook] = useState(3);
    const [shelfCellWidth, setShelfCellWidth] = useState(999);
    const [mobileBookMaxH, setMobileBookMaxH] = useState(95);
    const [mobileBookW, setMobileBookW] = useState(18); // 모바일 책 균등 너비

    useEffect(() => {
        if (!shelfAreaRef.current) return;
        const measure = () => {
            const el = shelfAreaRef.current;
            if (!el) return;
            const cellW = el.clientWidth / 6;
            const BOOK_AVG_W = 21;
            const CELL_PADDING = 24;
            const booksPerCell = Math.max(2, Math.floor((cellW - CELL_PADDING) / BOOK_AVG_W));
            setDaysPerBook(Math.max(1, Math.round(30 / booksPerCell)));
            setShelfCellWidth(cellW - CELL_PADDING);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(shelfAreaRef.current);
        return () => ro.disconnect();
    }, [view]);

    useEffect(() => {
        if (!mobileShelfAreaRef.current) return;
        const measure = () => {
            const el = mobileShelfAreaRef.current;
            if (!el) return;

            // ── 셀 너비 기반으로 책 권수 & 너비 계산 ──
            // bookshelfAreaMobile은 3칸 그리드
            const cellW = el.clientWidth / 3;
            // shelf 좌우 padding 4px*2 + shelfInner padding 3px*2 = 14px
            const CELL_PADDING = 14;
            const usableW = cellW - CELL_PADDING;
            // gap=3px 포함한 책 한 권 최소 너비: 18px + 3px gap = 21px
            const BOOK_SLOT = 21;
            const booksPerCell = Math.max(2, Math.floor(usableW / BOOK_SLOT));
            // 실제 책 너비: 남은 공간을 booksPerCell로 균등 분할, gap 제외
            const bookW = Math.floor((usableW - (booksPerCell - 1) * 3) / booksPerCell);
            setMobileBookW(Math.max(11, bookW));
            // 30일을 booksPerCell 권으로 나누면 권당 일수
            setMobileDaysPerBook(Math.max(1, Math.ceil(30 / booksPerCell)));

            // ── 행 높이 기반으로 책 최대 높이 계산 ──
            const rowH = el.clientHeight;
            const labelH = 24;
            const bookAreaH = rowH - labelH - 4;
            setMobileBookMaxH(Math.max(80, Math.floor(bookAreaH * 0.80)));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(mobileShelfAreaRef.current);
        return () => ro.disconnect();
    }, [view]);

    const navigate = useNavigate();
    const { y, m0, startDay, totalDays } = useMemo(() => getMonthMeta(currentDate), [currentDate]);

    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();
    const isCurrentMonth = y === thisYear && m0 === thisMonth;
    const isFutureMonth = y > thisYear || (y === thisYear && m0 > thisMonth);

    useEffect(() => {
        if (isFutureMonth) setCurrentDate(new Date(thisYear, thisMonth, 1));
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
                role="button"
                tabIndex={0}
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
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    })();

    const monthShelves = useMemo(
        () => buildMonthShelves(yearCountMap, heatmapYear, todayStr, daysPerBook),
        [yearCountMap, heatmapYear, todayStr, daysPerBook]
    );

    const mobileMonthShelves = useMemo(
        () => buildMonthShelves(yearCountMap, heatmapYear, todayStr, mobileDaysPerBook),
        [yearCountMap, heatmapYear, todayStr, mobileDaysPerBook]
    );

    const renderDesktopBook = (b: BookSpine, i: number) =>
        b.ghost ? (
            <div key={i} style={{ width: b.width, height: 1, flexShrink: 0 }} />
        ) : (
            <div key={i} className={styles.book} style={{ width: b.width, height: b.height, background: b.color }}>
                <div className={styles.bookCap} />
                <div className={styles.bookStripe1} />
                <div className={styles.bookStripe2} />
            </div>
        );

    const renderMobileBook = (b: BookSpine, i: number) => {
        const ratio = b.height / 106;
        // 40~80% 범위로 높낮이 표현
        const mH = Math.round(mobileBookMaxH * (0.24 + ratio * 0.32));
        return b.ghost ? (
            <div key={i} style={{ width: mobileBookW, height: 1, flexShrink: 0 }} />
        ) : (
            <div key={i} className={styles.book} style={{ width: mobileBookW, height: mH, background: b.color }}>
                <div className={styles.bookCap} />
                <div className={styles.bookStripe1} />
                <div className={styles.bookStripe2} />
            </div>
        );
    };

    const renderShelf = (month: string, totalCount: number, books: BookSpine[], totalSlots: number, isMobile: boolean) => {
        const booksToRender = isMobile ? books : clipBooks(books, shelfCellWidth);
        const monthNum = HM_MONTHS.indexOf(month) + 1;

        return (
            <div
                key={month}
                className={styles.shelf}
                onClick={() => goMonth(heatmapYear, monthNum)}
                style={{ cursor: "pointer" }}
            >
                <div className={styles.shelfLabel}>
                    {month}
                </div>
                <div className={styles.shelfInner}>
                    <div className={styles.shelfRow}>
                        {booksToRender.map((b, i) =>
                            isMobile ? renderMobileBook(b, i) : renderDesktopBook(b, i)
                        )}
                    </div>
                    <div className={styles.shelfBoard} />
                </div>
            </div>
        );
    };

    const hmLegend = (
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
    );

    return (
        <div>
            <hr className={styles.hr} />
            <section className={styles.container}>

                {/* ── Left ── */}
                <div className={styles.left}>
                    <div className={styles.leftTop}>
                        <p className={styles.pageTitle}>Activity Log</p>

                        {view === "calendar" && (
                            <div className={styles.monthNav}>
                                <button onClick={() => changeMonth(-1)} aria-label="이전 달">
                                    <CaretLeftIcon size={12} />
                                </button>
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
                                >
                                    <CaretRightIcon size={12} />
                                </button>
                            </div>
                        )}

                        {view === "heatmap" && (
                            <div className={styles.monthNav}>
                                <button onClick={() => setHeatmapYear(prev => prev - 1)} aria-label="이전 연도">
                                    <CaretLeftIcon size={12} />
                                </button>
                                <span className={styles.main}>
                                    <span className={styles.monthLabel}>{heatmapYear}</span>
                                </span>
                                <button
                                    onClick={() => setHeatmapYear(prev => Math.min(prev + 1, thisYear))}
                                    aria-label="다음 연도"
                                    disabled={heatmapYear >= thisYear}
                                    className={heatmapYear >= thisYear ? styles.navDisabled : ""}
                                >
                                    <CaretRightIcon size={12} />
                                </button>
                            </div>
                        )}

                        <div className={styles.viewTabs}>
                            <button
                                className={[styles.viewTab, view === "calendar" ? styles.viewTabActive : ""].join(" ")}
                                onClick={() => setView("calendar")}
                            >Calendar</button>
                            <button
                                className={[styles.viewTab, view === "heatmap" ? styles.viewTabActive : ""].join(" ")}
                                onClick={() => setView("heatmap")}
                            >Heatmap</button>
                        </div>
                    </div>
                </div>

                <div className={styles.statsSpacer} />

                {/* ── Right ── */}
                <div className={styles.right}>
                    {err && <div style={{ color: "crimson" }}>오류: {err}</div>}

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
                            <div className={styles.bookcaseFrame}>
                                <div className={styles.bookcaseRow}>
                                    <div className={styles.bookshelfArea} ref={shelfAreaRef}>
                                        {monthShelves.slice(0, 6).map(({ month, totalCount, books, totalSlots }) =>
                                            renderShelf(month, totalCount, books, totalSlots, false)
                                        )}
                                    </div>
                                </div>
                                <div className={styles.bookcaseRow}>
                                    <div className={styles.bookshelfArea}>
                                        {monthShelves.slice(6, 12).map(({ month, totalCount, books, totalSlots }) =>
                                            renderShelf(month, totalCount, books, totalSlots, false)
                                        )}
                                    </div>
                                </div>
                            </div>
                            {hmLegend}
                        </div>
                    )}
                </div>

            </section>

            {/* ══ 모바일 전용 레이아웃 ══ */}
            <section className={styles.mobileContainer}>

                <div className={styles.mobileTop}>
                    <p className={styles.pageTitle}>Activity Log</p>
                    <div className={styles.mobileSubLine}>
                        <button
                            className={styles.mobileNavBtn}
                            onClick={() => view === "calendar" ? changeMonth(-1) : setHeatmapYear(prev => prev - 1)}
                            aria-label="이전"
                        >
                            <CaretLeftIcon size={13} />
                        </button>

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
                            >
                                <CaretRightIcon size={13} />
                            </button>
                        )}
                        {view === "heatmap" && (
                            <button
                                className={styles.mobileNavBtn}
                                onClick={() => setHeatmapYear(prev => Math.min(prev + 1, thisYear))}
                                disabled={heatmapYear >= thisYear}
                                style={{ opacity: heatmapYear >= thisYear ? 0.25 : 1 }}
                                aria-label="다음"
                            >
                                <CaretRightIcon size={13} />
                            </button>
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

                {view === "heatmap" && (
                    <div className={styles.heatmapWrapperMobile}>
                        <div className={styles.bookcaseFrameMobile}>
                            {[0, 3, 6, 9].map(rowStart => (
                                <div
                                    key={rowStart}
                                    className={styles.bookcaseRowMobile}
                                    ref={rowStart === 0 ? mobileShelfAreaRef : undefined}
                                >
                                    <div className={styles.bookshelfAreaMobile}>
                                        {mobileMonthShelves.slice(rowStart, rowStart + 3).map(({ month, totalCount, books, totalSlots }) =>
                                            renderShelf(month, totalCount, books, totalSlots, true)
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {hmLegend}
                    </div>
                )}

            </section>
        </div>
    );
}