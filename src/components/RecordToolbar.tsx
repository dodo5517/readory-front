import React, { useEffect, useId, useRef, useState } from "react";
import styles from "../styles/RecordToolbar.module.css";
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';

type Mode = "month" | "day";

export type SearchParams =
    | { mode: "month"; year: number; month: number; q?: string; sort: "asc" | "desc"; page: number; size: number }
    | { mode: "day"; date: string; q?: string; sort: "asc" | "desc"; page: number; size: number };

type Props = {
    defaultMode?: Mode;
    defaultYear?: number;
    defaultMonth?: string; // "2025-08"
    defaultDate?: string | null;  // "2025-08-23"
    defaultQ?: string;
    defaultSort?: "asc" | "desc";
    // UI에서는 숨기지만 서버로는 전달 (페이지 크기)
    defaultSize?: number;
    onSubmit: (params: SearchParams) => void;
};

export default function  RecordToolbar({
                                          defaultMode = "month",
                                          defaultMonth,
                                          defaultDate,
                                          defaultQ = "",
                                          defaultSort = "desc",
                                          defaultSize = 10,
                                          onSubmit,
                                      }: Props) {
    const [mode, setMode] = useState<Mode>(defaultMode);
    const [monthValue, setMonthValue] = useState(defaultMonth ?? "");
    const [dateValue, setDateValue] = useState(defaultDate ?? "");
    const [q, setQ] = useState(defaultQ);
    const [sort, setSort] = useState<"asc" | "desc">(defaultSort);
    const [size] = useState<number>(defaultSize); // UI 제거
    const [error, setError] = useState<string | null>(null);

    const isFirstMonthSearch = useRef(true);
    const isFirstDateSearch = useRef(true);

    // 모바일: 기본 접힘 / 데스크탑: 기본 펼침
    const [open, setOpen] = useState<boolean>(true);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const apply = () => setOpen(!mq.matches); // 모바일이면 false, 데스크탑이면 true
        apply();
        mq.addEventListener?.("change", apply);
        return () => mq.removeEventListener?.("change", apply);
    }, []);

    const isMonth = mode === "month";
    const tabsId = useId();

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setError(null);

        if (isMonth) {
            if (!monthValue) return setError("월을 선택해주세요.");
            const [y, m] = monthValue.split("-");
            const year = Number(y), month = Number(m);
            if (!year || !month || month < 1 || month > 12) return setError("유효한 월을 선택해주세요.");
            onSubmit({ mode: "month", year, month, q: q || undefined, sort, page: 0, size });
        } else {
            if (!dateValue) return setError("날짜를 선택해주세요.");
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return setError("유효한 날짜 형식이 아닙니다.");
            onSubmit({ mode: "day", date: dateValue, q: q || undefined, sort, page: 0, size });
        }
    };

    // 이번 달/오늘 설정
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const getToday = () => {
        const d = new Date();
        setMode("day");
        setDateValue(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`); // YYYY-MM-DD
    };
    const getThisMonth = () => {
        const d = new Date();
        setMode("month")
        setMonthValue(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`); // YYYY-MM
    };

    const summaryLabel = `${isMonth ? "월" : "일"} · 
        ${isMonth ? (monthValue || "미선택") : (dateValue || "미선택")} · 
        ${sort === "desc" ? "최근순" : "오래된순"}`;

    // monthValue 또는 sort 변경 시 자동 검색
    useEffect(() => {
        if (isFirstMonthSearch.current) {
            isFirstMonthSearch.current = false;
            return;
        }
        if (mode !== "month") return;
        if (!monthValue) return;

        const [y, m] = monthValue.split("-");
        const year = Number(y), mon = Number(m);
        if (!year || !mon || mon < 1 || mon > 12) return;

        onSubmit({ mode: "month", year, month: mon, q: q || undefined, sort, page: 0, size });
    }, [monthValue, sort]); // eslint-disable-line react-hooks/exhaustive-deps

    // dateValue 또는 sort 변경 시 자동 검색
    useEffect(() => {
        if (isFirstDateSearch.current) {
            isFirstDateSearch.current = false;
            return;
        }
        if (mode !== "day") return;
        if (!dateValue) return;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return;

        onSubmit({ mode: "day", date: dateValue, q: q || undefined, sort, page: 0, size });
    }, [dateValue, sort]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <form className={styles.toolbar} onSubmit={handleSubmit} aria-labelledby={tabsId}>
            {/* 상단 바: 모바일에선 검색 + (필터 토글/빠른 제출), 데스크탑에서는 아무 영향 없이 그대로 */}
            <div className={styles.topBar}>
                {/* 모바일 전용 검색 (항상 보임) */}
                <label className={`${styles.search} ${styles.searchMobile}`}>
                    <span className={styles.searchIcon} aria-hidden><MagnifyingGlassIcon /></span>
                    <input
                        className={styles.searchInput}
                        placeholder="문장/메모 검색…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label="검색어"
                    />
                    {q && (
                        <button
                            type="button"
                            onClick={() => setQ("")}
                            className={styles.clearBtn}
                            aria-label="검색어 지우기"
                            title="지우기"
                        ><XIcon /></button>
                    )}
                </label>

                {/* 모바일 전용: 필터 토글 + 빠른 제출 */}
                <div className={styles.mobileActions}>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        aria-expanded={open}
                        onClick={() => setOpen(v => !v)}
                        title="필터 열기/닫기"
                    >필터</button>
                    <button type="submit" className={`${styles.iconBtn} ${styles.submitIcon}`} title="검색 실행" aria-label="검색 실행">
                        <MagnifyingGlassIcon />
                    </button>
                </div>
            </div>

            {/* 요약칩: 모바일에서 접힘일 때만 */}
            {!open && <div className={styles.summaryChip} aria-hidden>{summaryLabel}</div>}

            {/* 필터 영역
          - 데스크탑: 항상 보임 (한 줄로)
          - 모바일: open 상태일 때만 보임 */}
            <div className={`${styles.filters} ${open ? styles.show : ""}`}>
                {/* 탭(월/일) */}
                <div className={styles.tabs} role="tablist" aria-label="보기 모드" id={tabsId}>
                    <button
                        role="tab"
                        aria-selected={isMonth}
                        className={`${styles.tab} ${isMonth ? styles.isActive : ""}`}
                        type="button"
                        onClick={() => getThisMonth()}
                    >월
                    </button>
                    <button
                        role="tab"
                        aria-selected={!isMonth}
                        className={`${styles.tab} ${!isMonth ? styles.isActive : ""}`}
                        type="button"
                        onClick={() => getToday()}
                    >일
                    </button>
                </div>

                {/* 기간 */}
                <div className={styles.period}>
                    {isMonth ? (
                        <input
                            type="month"
                            value={monthValue}
                            onChange={(e) => setMonthValue(e.target.value)}
                            className={styles.input}
                            placeholder="YYYY-MM"
                            aria-label="조회 월"
                        />
                    ) : (
                        <input
                            type="date"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            className={styles.input}
                            placeholder="YYYY-MM-DD"
                            aria-label="조회 날짜"
                        />
                    )}
                </div>

                {/* 데스크탑 전용 검색(한 줄 배치 위해) */}
                <label className={`${styles.search} ${styles.searchDesktop}`}>
                    <span className={styles.searchIcon} aria-hidden><MagnifyingGlassIcon /></span>
                    <input
                        className={styles.searchInput}
                        placeholder="문장/코멘트 검색…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label="검색어"
                    />
                    {q && (
                        <button
                            type="button"
                            onClick={() => setQ("")}
                            className={styles.clearBtn}
                            aria-label="검색어 지우기"
                            title="지우기"
                        ><XIcon /></button>
                    )}
                </label>

                {/* 정렬 */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as "asc" | "desc")}
                    className={styles.select}
                    aria-label="정렬"
                    title="정렬"
                >
                    <option value="desc">최근순</option>
                    <option value="asc">오래된순</option>
                </select>

                {/* 실행(데스크탑용) */}
                <button type="submit" className={`${styles.primary} ${styles.desktopOnly}`} aria-label="검색 실행">
                    <MagnifyingGlassIcon />
                </button>
            </div>

            {error && <p className={styles.error} role="alert" aria-live="polite">{error}</p>}
        </form>
    );
}
