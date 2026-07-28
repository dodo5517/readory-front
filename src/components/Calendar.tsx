import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, createSearchParams } from "react-router-dom";
import styles from "../styles/Calendar.module.css";
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { formatYMD, getMonthMeta, toCountMap } from "../utils/calendar";
import { fetchCalendarRange } from "../api/Calendar";
import { CalendarRangeResponse } from "../types/calendar";
import GridPickerPopover from "./calendar/GridPickerPopover";

const HM_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function seededRand(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

/* 한 해 = 글 한 편. 하루가 낱말 하나
   실제 글처럼 짧은 말이 많은 분포 — 낱말 폭 = --wu * 글자수 */
const WORD_LENS = [2,3,4,3,5,2,6,4,3,7,4,2,5,8,3,4,6,3,2,5,9,4,3,6,2,7,4,5,3,4,11,2,6,3,5];
const PUNCT_RATE = 0.16;

/** 0=기록 없음, 1=1건, 2=2건, 3=3건 이상 */
type InkLevel = 0 | 1 | 2 | 3;

interface DayWord {
    date: string;
    len: number;
    level: InkLevel;
    punct: boolean;
    /** 아직 오지 않은 날 — 낱말 자리는 있지만 1px 선으로만 그린다 */
    future: boolean;
}

interface MonthParagraph {
    month: string;
    monthNum: number;
    count: number;
    words: DayWord[];
    /** 아직 시작하지 않은 달 — 클릭 대상에서 제외 */
    isFuture: boolean;
}

/* 한 해 전체를 항상 만듦. */
function buildYearProse(
    countMap: Map<string, number>,
    year: number,
    todayStr: string
): MonthParagraph[] {
    const months: MonthParagraph[] = [];
    let dayOfYear = 0;

    for (let m = 0; m < 12; m++) {
        const mm = String(m + 1).padStart(2, "0");
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        const words: DayWord[] = [];
        let count = 0;

        for (let d = 1; d <= daysInMonth; d++) {
            dayOfYear++;
            const date = `${year}-${mm}-${String(d).padStart(2, "0")}`;
            const future = date > todayStr;
            const cnt = future ? 0 : (countMap.get(date) ?? 0);
            count += cnt;
            words.push({
                date,
                len: WORD_LENS[Math.floor(seededRand(dayOfYear) * WORD_LENS.length)],
                level: (cnt === 0 ? 0 : cnt === 1 ? 1 : cnt === 2 ? 2 : 3) as InkLevel,
                punct: seededRand(dayOfYear + 977) < PUNCT_RATE,
                future,
            });
        }

        months.push({
            month: HM_MONTHS[m],
            monthNum: m + 1,
            count,
            words,
            isFuture: words[0].future,
        });
    }

    return months;
}

const INK_CLASS = [styles.wordEmpty, styles.wordL2, styles.wordL3, styles.wordL4];

type ViewMode = "calendar" | "heatmap";

export default function Calendar() {
    const [searchParams, setSearchParams] = useSearchParams();

    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();

    const [currentDate, setCurrentDate] = useState<Date>(() => {
        const yr = parseInt(searchParams.get("year") ?? "", 10);
        const mo = parseInt(searchParams.get("month") ?? "", 10); // 1-based
        if (!isNaN(yr) && !isNaN(mo) && mo >= 1 && mo <= 12) {
            if (yr > thisYear || (yr === thisYear && mo - 1 > thisMonth)) {
                return new Date(thisYear, thisMonth, 1);
            }
            return new Date(yr, mo - 1, 1);
        }
        return new Date();
    });
    const [data, setData] = useState<CalendarRangeResponse | null>(null);
    const [yearData, setYearData] = useState<CalendarRangeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [view, setView] = useState<ViewMode>(() => {
        return searchParams.get("view") === "heatmap" ? "heatmap" : "calendar";
    });
    const [heatmapYear, setHeatmapYear] = useState<number>(() => {
        const yr = parseInt(searchParams.get("year") ?? "", 10);
        if (!isNaN(yr) && yr <= thisYear) return yr;
        return thisYear;
    });

    const navigate = useNavigate();
    const { y, m0, startDay, totalDays } = useMemo(() => getMonthMeta(currentDate), [currentDate]);

    const isCurrentMonth = y === thisYear && m0 === thisMonth;
    const isFutureMonth = y > thisYear || (y === thisYear && m0 > thisMonth);

    useEffect(() => {
        if (isFutureMonth) setCurrentDate(new Date(thisYear, thisMonth, 1));
    }, [isFutureMonth, thisYear, thisMonth]);

    // 상태가 바뀔 때마다 URL 쿼리를 동기화 (히스토리 미적재)
    useEffect(() => {
        const params: Record<string, string> = { view };
        if (view === "calendar") {
            params.year = String(y);
            params.month = String(m0 + 1);
        } else {
            params.year = String(heatmapYear);
        }
        setSearchParams(params, { replace: true });
    }, [view, y, m0, heatmapYear, setSearchParams]);

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
        navigate({ pathname: "/readingRecords", search: `?${createSearchParams({ mode: "day", date: fullDate })}` });
    };
    const goMonth = (year: number, month1: number) => {
        const mm = String(month1).padStart(2, "0");
        navigate({ pathname: "/readingRecords", search: `?${createSearchParams({ mode: "month", year: String(year), month: mm })}` });
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
            </div>
        );
    }

    const todayStr = (() => {
        const t = new Date();
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    })();

    const yearProse = useMemo(
        () => buildYearProse(yearCountMap, heatmapYear, todayStr),
        [yearCountMap, heatmapYear, todayStr]
    );

    /* 탭 스톱은 지나간 달만. 낱말 하나하나는 클릭 대상이 아님 */
    const prose = (
        <div className={styles.prose}>
            {yearProse.map(({ month, monthNum, count, words, isFuture }) => (
                <span
                    key={month}
                    className={[styles.monthGroup, isFuture ? styles.monthGroupFuture : ""].join(" ")}
                    role={isFuture ? undefined : "button"}
                    tabIndex={isFuture ? undefined : 0}
                    title={isFuture ? undefined : `${heatmapYear}.${String(monthNum).padStart(2, "0")} · ${count}건`}
                    onClick={isFuture ? undefined : () => goMonth(heatmapYear, monthNum)}
                    onKeyDown={isFuture ? undefined : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goMonth(heatmapYear, monthNum);
                        }
                    }}
                >
                    <span className={styles.monthName}>{month}</span>
                    {words.map(w => {
                        const ink = w.future ? styles.wordFuture : INK_CLASS[w.level];
                        return (
                            <React.Fragment key={w.date}>
                                <span
                                    className={[styles.word, ink, w.punct ? styles.wordTight : ""].join(" ")}
                                    style={{ width: `calc(var(--wu) * ${w.len})` }}
                                />
                                {w.punct && <span className={[styles.word, styles.punct, ink].join(" ")} />}
                                {/* 커서는 글 끝이 아니라 오늘 자리에 위치 */}
                                {w.date === todayStr && <span className={styles.cursor} />}
                            </React.Fragment>
                        );
                    })}
                </span>
            ))}
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
                                <GridPickerPopover
                                    mode="month"
                                    value={{ year: y, month: m0 + 1 }}
                                    label={
                                        <span className={styles.main}>
                                            <span className={styles.monthLabel}>{y}</span>
                                            <span className={styles.monthSep}>/</span>
                                            <span className={styles.monthLabel}>{String(m0 + 1).padStart(2, "0")}</span>
                                        </span>
                                    }
                                    onSelectMonth={(yr, mo) => setCurrentDate(new Date(yr, mo - 1, 1))}
                                    maxYear={thisYear}
                                    maxMonth={thisMonth + 1}
                                />
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
                                <GridPickerPopover
                                    mode="year"
                                    value={{ year: heatmapYear }}
                                    label={
                                        <span className={styles.main}>
                                            <span className={styles.monthLabel}>{heatmapYear}</span>
                                        </span>
                                    }
                                    onSelectYear={(yr) => { if (yr <= thisYear) setHeatmapYear(yr); }}
                                    maxYear={thisYear}
                                />
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
                        <div className={styles.heatmapWrapper}>{prose}</div>
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
                            <GridPickerPopover
                                mode="month"
                                value={{ year: y, month: m0 + 1 }}
                                label={
                                    <span className={styles.mobileDateTitle}>
                                        {y} / {String(m0 + 1).padStart(2, "0")}
                                    </span>
                                }
                                onSelectMonth={(yr, mo) => setCurrentDate(new Date(yr, mo - 1, 1))}
                                maxYear={thisYear}
                                maxMonth={thisMonth + 1}
                            />
                        )}
                        {view === "heatmap" && (
                            <GridPickerPopover
                                mode="year"
                                value={{ year: heatmapYear }}
                                label={<span className={styles.mobileDateTitle}>{heatmapYear}</span>}
                                onSelectYear={(yr) => { if (yr <= thisYear) setHeatmapYear(yr); }}
                                maxYear={thisYear}
                            />
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
                    <div className={styles.heatmapWrapperMobile}>{prose}</div>
                )}

            </section>
        </div>
    );
}
