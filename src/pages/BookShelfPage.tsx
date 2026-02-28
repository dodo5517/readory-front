import React, {useEffect, useState} from "react";
import styles from "../styles/BookShelfPage.module.css";
import {PageResult, SummaryBook} from "../types/books";
import {fetchMyBooks, fetchDeleteBook} from "../api/ReadingRecord";
import {useNavigate} from "react-router-dom";
import Pagination from "../components/pagination/Pagination";
import { MagnifyingGlassIcon, TrashIcon } from '@phosphor-icons/react';
import {useDemoGuard} from "../hook/useDemoGuard";

export default function BookShelfPage() {
    const [data, setData] = useState<PageResult<SummaryBook >| null>(null);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10); // 데스크탑(10), 모바일(6)
    const [sort, setSort] = useState<"recent" | "title">("recent");
    const [q, setQ] = useState("");
    const [queryInput, setQueryInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // 화면 크기에 따라 페이지 사이즈 설정
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 768px)");

        const apply = (matches: boolean) => {
            const next = matches ? 6 : 10;
            setSize((prev) => (prev === next ? prev : next));
            // 화면 크기 바뀌면 첫 페이지로
            setPage(0);
        };

        // 초기 1회 동기화 (혹시 hydration 뒤 값이 달라졌을 경우)
        apply(mql.matches);

        const handler = (e: MediaQueryListEvent) => apply(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const json = await fetchMyBooks({page, size, sort, q});
                setData(json);
                console.log("fetchMyBooks");
            } catch (e: any){
                console.error(e);
                setError("불러오기 실패");
            } finally {
                setLoading(false);
            }
        })();
    },[page, sort, size, q]);

    if (loading) {
        return <div className={styles.container} aria-live="polite"></div>;
    }
    if (error) {
        return <div className={styles.container} role="alert">{error}</div>;
    }

    const books = data?.items ?? [];

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
                                setQ(queryInput.trim());           // Enter 시 API 트리거
                            }
                        }}
                        placeholder="책 제목, 저자 검색..."
                        className={styles.searchInput}
                    />
                    <button
                        className={styles.searchBtn}
                        onClick={() => {
                            setPage(0);
                            setQ(queryInput.trim()); /* 검색 실행 */
                        }}
                    >
                        <MagnifyingGlassIcon />
                    </button>
                </div>

                <div className={styles.segment}>
                    <button
                        className={`${styles.segBtn} ${sort === "recent" ? styles.isActive : ""}`}
                        onClick={() => {
                            setSort("recent");
                            setPage(0);
                        }}
                    >
                        최근순
                    </button>
                    <button
                        className={`${styles.segBtn} ${sort === "title" ? styles.isActive : ""}`}
                        onClick={() => {
                            setSort("title");
                            setPage(0);
                        }}
                    >
                        제목순
                    </button>
                </div>
            </div>

            {/* 그리드 */}
            <ul className={styles.grid}>
                {books.map(b => (
                    <li key={b.id} className={styles.card}>
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
                            <div className={styles.bookTitle} title={b.title}>{b.title}</div>
                            {b.author && <div className={styles.author}>{b.author}</div>}
                        </button>
                        <button
                            className={styles.deleteBtn}
                            onClick={(e) => handleDeleteBook(e, b.id, b.title)}
                            disabled={deletingId === b.id}
                            aria-label={`${b.title} 모든 기록 삭제`}
                            title="모든 기록 삭제"
                        >
                            {deletingId === b.id ? "…" : <TrashIcon size={13} />}
                        </button>
                    </li>
                ))}
            </ul>
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