import React, {useMemo} from "react";
import styles from "../../styles/Pagination.module.css";

type Props = {
    page: number;
    totalPages: number;
    hasPrev?: boolean;
    hasNext?: boolean;
    // 페이지 변경
    onChange: (nextPage: number) => void;
    // 페이지 크기 변경
    pageSize?: number;
    onChangePageSize?: (size: number) => void;
    // 번호 버튼 윈도우 사이즈 (기본 5)
    windowSize?: number;
    // 로딩 중이면 버튼 비활성화 */
    disabled?: boolean;
};

function makeWindow(current: number, total: number, windowSize: number) {
    if (total <= 0) return [];
    const size = Math.max(3, windowSize); // 최소 3
    const half = Math.floor(size / 2);
    let start = Math.max(0, current - half);
    let end = Math.min(total - 1, start + size - 1);
    start = Math.max(0, Math.min(start, end - size + 1));

    const pages: (number | "...")[] = [];

    // 앞쪽 엘립시스
    if (start > 0) {
        pages.push(0);
        if (start > 1) pages.push("...");
    }

    // 중앙 윈도우
    for (let p = start; p <= end; p++) pages.push(p);

    // 뒤쪽 엘립시스
    if (end < total - 1) {
        if (end < total - 2) pages.push("...");
        pages.push(total - 1);
    }

    return pages;
}

export default function Pagination({
                                       page,
                                       totalPages,
                                       hasPrev,
                                       hasNext,
                                       onChange,
                                       pageSize,
                                       onChangePageSize,
                                       windowSize = 5,
                                       disabled = false,
                                   }: Props) {
    const items = useMemo(
        () => makeWindow(page, totalPages, windowSize),
        [page, totalPages, windowSize]
    );

    if (!totalPages || totalPages <= 1) return null;

    const go = (next: number) => {
        if (disabled) return;
        const clamped = Math.max(0, Math.min(totalPages - 1, next));
        if (clamped !== page) onChange(clamped);
    };

    const prevDisabled = disabled || (typeof hasPrev === "boolean" ? !hasPrev : page <= 0);
    const nextDisabled = disabled || (typeof hasNext === "boolean" ? !hasNext : page >= totalPages - 1);

    return (
        <nav className={styles.wrap} aria-label="페이지네이션">
            <ul className={styles.list} role="list">
                <li>
                    <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => go(0)}
                        aria-label="첫 페이지"
                        disabled={prevDisabled}
                    >
                        «
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => go(page - 1)}
                        aria-label="이전 페이지"
                        disabled={prevDisabled}
                    >
                        ‹
                    </button>
                </li>

                {items.map((it, idx) =>
                    it === "..." ? (
                        <li key={`ellipsis-${idx}`} className={styles.ellipsis} aria-hidden="true">
                            …
                        </li>
                    ) : (
                        <li key={it}>
                            <button
                                type="button"
                                className={`${styles.pageBtn} ${it === page ? styles.active : ""}`}
                                aria-current={it === page ? "page" : undefined}
                                onClick={() => go(it as number)}
                                disabled={disabled}
                            >
                                {(it as number) + 1}
                            </button>
                        </li>
                    )
                )}

                <li>
                    <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => go(page + 1)}
                        aria-label="다음 페이지"
                        disabled={nextDisabled}
                    >
                        ›
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        className={styles.navBtn}
                        onClick={() => go(totalPages - 1)}
                        aria-label="마지막 페이지"
                        disabled={nextDisabled}
                    >
                        »
                    </button>
                </li>
            </ul>
        </nav>
    );
}
