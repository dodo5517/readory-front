import React, { useEffect, useRef, useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import styles from "../../styles/GridPickerPopover.module.css";

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

interface GridPickerPopoverProps {
    mode: "month" | "year";
    value: { year: number; month?: number };
    label: React.ReactNode;
    onSelectMonth?: (year: number, month: number) => void;
    onSelectYear?: (year: number) => void;
    maxYear: number;
    maxMonth?: number;
    className?: string;
}

export default function GridPickerPopover({
    mode,
    value,
    label,
    onSelectMonth,
    onSelectYear,
    maxYear,
    maxMonth,
    className,
}: GridPickerPopoverProps) {
    const [open, setOpen] = useState(false);
    const [headerYear, setHeaderYear] = useState(value.year);
    const [yearPageStart, setYearPageStart] = useState(() => value.year - 5);

    const wrapRef = useRef<HTMLDivElement>(null);

    // 외부에서 연도가 바뀌면(화살표 클릭 등) 헤더도 동기화
    useEffect(() => {
        setHeaderYear(value.year);
        setYearPageStart(value.year - 5);
    }, [value.year]);

    // 팝오버 바깥 클릭 시 닫기
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Esc로 닫기
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    const handleTrigger = () => {
        if (!open) {
            setHeaderYear(value.year);
            setYearPageStart(value.year - 5);
        }
        setOpen(v => !v);
    };

    const monthGrid = () => {
        const allDisabled = headerYear > maxYear;
        return (
            <>
                <div className={styles.header}>
                    <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => setHeaderYear(y => y - 1)}
                        aria-label="이전 연도"
                    >
                        <CaretLeftIcon size={12} />
                    </button>
                    <span className={styles.headerTitle}>{headerYear}</span>
                    <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => setHeaderYear(y => Math.min(y + 1, maxYear))}
                        disabled={headerYear >= maxYear}
                        aria-label="다음 연도"
                    >
                        <CaretRightIcon size={12} />
                    </button>
                </div>
                <div className={styles.grid}>
                    {MONTHS.map((name, i) => {
                        const mo = i + 1;
                        const isSelected = value.year === headerYear && value.month === mo;
                        const isDisabled = allDisabled ||
                            (headerYear === maxYear && maxMonth !== undefined && mo > maxMonth);
                        return (
                            <button
                                key={name}
                                type="button"
                                className={[
                                    styles.cell,
                                    isSelected ? styles.cellSelected : "",
                                    isDisabled ? styles.cellDisabled : "",
                                ].filter(Boolean).join(" ")}
                                disabled={isDisabled}
                                onClick={() => { onSelectMonth?.(headerYear, mo); setOpen(false); }}
                            >
                                {name}
                            </button>
                        );
                    })}
                </div>
            </>
        );
    };

    const yearGrid = () => {
        const years = Array.from({ length: 12 }, (_, i) => yearPageStart + i);
        return (
            <>
                <div className={styles.header}>
                    <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => setYearPageStart(s => s - 12)}
                        aria-label="이전 연도 범위"
                    >
                        <CaretLeftIcon size={12} />
                    </button>
                    <span className={styles.headerTitle}>
                        {yearPageStart} – {yearPageStart + 11}
                    </span>
                    <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => setYearPageStart(s => s + 12)}
                        disabled={yearPageStart + 12 > maxYear}
                        aria-label="다음 연도 범위"
                    >
                        <CaretRightIcon size={12} />
                    </button>
                </div>
                <div className={styles.grid}>
                    {years.map(yr => {
                        const isSelected = value.year === yr;
                        const isDisabled = yr > maxYear;
                        return (
                            <button
                                key={yr}
                                type="button"
                                className={[
                                    styles.cell,
                                    isSelected ? styles.cellSelected : "",
                                    isDisabled ? styles.cellDisabled : "",
                                ].filter(Boolean).join(" ")}
                                disabled={isDisabled}
                                onClick={() => { onSelectYear?.(yr); setOpen(false); }}
                            >
                                {yr}
                            </button>
                        );
                    })}
                </div>
            </>
        );
    };

    return (
        <div ref={wrapRef} className={[styles.wrap, className ?? ""].filter(Boolean).join(" ")}>
            <button type="button" className={styles.trigger} onClick={handleTrigger}>
                {label}
            </button>
            {open && (
                <div className={styles.popover}>
                    {mode === "month" ? monthGrid() : yearGrid()}
                </div>
            )}
        </div>
    );
}
