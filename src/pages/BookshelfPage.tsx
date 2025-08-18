import React, {useEffect, useMemo, useState} from "react";
import styles from "../styles/BookshelfPage.module.css";
import {PageResult, SummaryBook} from "../types/books";
import {fetchMyBooks} from "../api/ReadingRecord";

export default function BookshelfPage() {
    const [data, setData] = useState<PageResult<SummaryBook >| null>(null);
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState<"recent" | "title">("recent");
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const json = await fetchMyBooks({page: page, sort: sort, q: q});
                setData(json);
                console.log("fetchMyBooks");
            } catch (e: any){
                console.error(e);
                setError("불러오기 실패");
            } finally {
                setLoading(false);
            }
        })();
    },[page, sort, q]);

    if (loading) {
        return <div className={styles.container} aria-live="polite">로딩 중...</div>;
    }
    if (error) {
        return <div className={styles.container} role="alert">{error}</div>;
    }

    const books = data?.books ?? [];

    return (
        <section className={styles.container} aria-label="책장">
            <h1 className={styles.title}>My Bookshelf</h1>

            {/* 검색 + 정렬 툴바 */}
            <div className={styles.toolbar}>
                <div style={{display: "flex", gap: "8px", flex: 1}}>
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                            setPage(0);
                            setQ(e.target.value);
                        }}
                        placeholder="책 제목, 저자 검색..."
                        className={styles.searchInput}
                    />
                    <button
                        className={styles.searchBtn}
                        onClick={() => {
                            setPage(0); /* 검색 실행 */
                        }}
                    >
                        🔍
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
            <ul className={styles.grid} role="list">
                {books.map(b => (
                    <li key={b.id} className={styles.card}>
                        <button
                            className={styles.cardBtn}
                            // onClick={() => onSelect?.(b)}
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
                    </li>
                ))}
            </ul>
        </section>
    );
}
