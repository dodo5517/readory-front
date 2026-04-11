import React, {useEffect, useState} from "react";
import styles from "../styles/BookShelfPage.module.css";
import {PageResult, SummaryBook} from "../types/books";
import {fetchMyBooks, fetchDeleteBook, fetchPinBook, fetchUnpinBook} from "../api/ReadingRecord";
import {useNavigate} from "react-router-dom";
import Pagination from "../components/pagination/Pagination";
import { MagnifyingGlassIcon, HeartIcon, DotsThreeIcon, TrashIcon } from '@phosphor-icons/react';
import {useDemoGuard} from "../hook/useDemoGuard";

// year 기준으로 그룹핑: [ { year, books[] }, ... ] 내림차순
function groupByYear(books: SummaryBook[]): { year: number | null; books: SummaryBook[] }[] {
    const map = new Map<number | null, SummaryBook[]>();
    for (const b of books) {
        const y = b.year ?? null;
        if (!map.has(y)) map.set(y, []);
        map.get(y)!.push(b);
    }
    // null(년도 미상)은 맨 뒤로
    const sorted = Array.from(map.entries()).sort(([a], [b]) => {
        if (a === null) return 1;
        if (b === null) return -1;
        return b - a;
    });
    return sorted.map(([year, books]) => ({ year, books }));
}

export default function BookShelfPage() {
    const [data, setData] = useState<PageResult<SummaryBook> | null>(null);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10); // 데스크탑(10), 모바일(6)
    const [sort, setSort] = useState<"recent" | "title">("recent");
    const [q, setQ] = useState("");
    const [queryInput, setQueryInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pinningId, setPinningId] = useState<number | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    const { demoGuard } = useDemoGuard();
    const navigate = useNavigate();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDeleteBook = demoGuard(async (e: React.MouseEvent, bookId: number, title: string) => {
        e.stopPropagation();
        if (!window.confirm(`정말 "${title}"의 모든 기록을 삭제할까요?`)) return;
        if (!window.confirm(`"${title}"의 모든 기록이 영구 삭제되며 복구할 수 없습니다.\n계속 진행할까요?`)) return;
        try {
            setDeletingId(bookId);
            await fetchDeleteBook(bookId);
            setData(prev => prev ? {
                ...prev,
                items: prev.items.filter(b => b.id !== bookId),
            } : prev);
        } catch {
            alert("삭제에 실패했습니다.");
        } finally {
            setDeletingId(null);
        }
    });

    const handleTogglePin = async (e: React.MouseEvent, bookId: number, pinned: boolean) => {
        e.stopPropagation();
        if (pinningId === bookId) return;
        try {
            setPinningId(bookId);
            if (pinned) {
                await fetchUnpinBook(bookId);
            } else {
                await fetchPinBook(bookId);
            }
            await loadBooks();
        } catch {
            alert("즐겨찾기 변경에 실패했습니다.");
        } finally {
            setPinningId(null);
        }
    };


    // 바깥 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = () => setMenuOpenId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // 화면 크기에 따라 페이지 사이즈 설정
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 768px)");

        const apply = (matches: boolean) => {
            const next = matches ? 6 : 10;
            setSize((prev) => (prev === next ? prev : next));
            setPage(0);
        };

        apply(mql.matches);

        const handler = (e: MediaQueryListEvent) => apply(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const json = await fetchMyBooks({page, size, sort, q});
            setData(json);
        } catch (e: any) {
            console.error(e);
            setError("불러오기 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooks();
    }, [page, sort, size, q]);

    if (loading) {
        return <div className={styles.container} aria-live="polite"></div>;
    }
    if (error) {
        return <div className={styles.container} role="alert">{error}</div>;
    }

    const books = data?.items ?? [];
    const groups = groupByYear(books);

    return (
        <section className={styles.container} aria-label="책장">
            <h1 className={styles.title}>My Bookshelf</h1>

            {/* 검색 + 정렬 툴바 */}
            <div className={styles.toolbar}>
                <div style={{display: "flex", gap: "8px", flex: 1}}>
                    <input
                        type="text"
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setPage(0);
                                setQ(queryInput.trim());
                            }
                        }}
                        placeholder="책 제목, 저자 검색..."
                        className={styles.searchInput}
                    />
                    <button
                        className={styles.searchBtn}
                        onClick={() => {
                            setPage(0);
                            setQ(queryInput.trim());
                        }}
                    >
                        <MagnifyingGlassIcon />
                    </button>
                </div>

                <div className={styles.segment}>
                    <button
                        className={`${styles.segBtn} ${sort === "recent" ? styles.isActive : ""}`}
                        onClick={() => { setSort("recent"); setPage(0); }}
                    >
                        최근순
                    </button>
                    <button
                        className={`${styles.segBtn} ${sort === "title" ? styles.isActive : ""}`}
                        onClick={() => { setSort("title"); setPage(0); }}
                    >
                        제목순
                    </button>
                </div>
            </div>

            {/* 년도별 그룹 */}
            {groups.map(({ year, books: groupBooks }) => (
                <div key={year ?? "unknown"} className={styles.yearGroup}>
                    <div className={styles.yearLabel}>{year ?? "날짜 없음"}</div>
                    <ul className={styles.grid}>
                        {groupBooks.map(b => (
                            <li key={b.id} className={`${styles.card} ${b.pinned ? styles.isPinned : ""}`}>
                                <button
                                    className={styles.cardBtn}
                                    onClick={() => navigate(`/bookRecord/${b.id}`)}
                                    aria-label={`${b.title}${b.author ? `, ${b.author}` : ""}`}
                                >
                                    <div className={styles.coverWrap}>
                                        {b.coverUrl ? (
                                            <img className={styles.cover} src={b.coverUrl} alt={`${b.title} 표지`} loading="lazy" />
                                        ) : (
                                            <div className={styles.coverPlaceholder}>No Image</div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: "auto" }}>
                                        <div className={styles.bookTitle} title={b.title}>{b.title}</div>
                                        {b.author && <div className={styles.author}>{b.author}</div>}
                                    </div>
                                </button>

                                {/* 데스크탑 전용: 핀된 책 좌상단 하트 뱃지 */}
                                {b.pinned && (
                                    <div className={styles.pinnedHeart}>
                                        <HeartIcon size={12} weight="fill" />
                                    </div>
                                )}

                                {/* 메뉴 트리거 버튼
                                    - 데스크탑: 항상 ··· (호버 시 표시)
                                    - 모바일 핀됨: 하트 버튼 (항상 표시)
                                    - 모바일 핀 안됨: ··· (항상 표시) */}
                                <button
                                    className={`${styles.menuBtn} ${b.pinned ? styles.menuBtnPinned : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenId(menuOpenId === b.id ? null : b.id);
                                    }}
                                    aria-label="더보기"
                                    title="더보기"
                                >
                                    {/* 모바일 핀된 책: 하트 아이콘 / 나머지: ··· */}
                                    <span className={styles.menuIconDots}><DotsThreeIcon size={16} weight="bold" /></span>
                                    <span className={styles.menuIconHeart}><HeartIcon size={13} weight="fill" /></span>
                                </button>

                                {/* 드롭다운 */}
                                {menuOpenId === b.id && (
                                    <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={(e) => { handleTogglePin(e, b.id, b.pinned); setMenuOpenId(null); }}
                                            disabled={pinningId === b.id}
                                        >
                                            <HeartIcon size={13} weight={b.pinned ? "fill" : "regular"} />
                                            {b.pinned ? "즐겨찾기 해제" : "즐겨찾기"}
                                        </button>
                                        <button
                                            className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                                            onClick={(e) => { handleDeleteBook(e, b.id, b.title); setMenuOpenId(null); }}
                                            disabled={deletingId === b.id}
                                        >
                                            <TrashIcon size={13} />
                                            {deletingId === b.id ? "삭제 중…" : "삭제"}
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* 페이지네이션 */}
            <Pagination
                page={data?.page ?? page}
                totalPages={data?.totalPages ?? 0}
                hasPrev={data?.hasPrev}
                hasNext={data?.hasNext}
                onChange={(next) => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setPage(next);
                }}
                pageSize={size}
                onChangePageSize={(s) => {
                    setPage(0);
                    setSize(s);
                }}
                disabled={loading}
                windowSize={5}
            />
        </section>
    );
}