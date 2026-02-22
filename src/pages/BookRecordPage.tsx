import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/BookRecordPage.module.css";
import {BookMeta} from "../types/books";
import {BookRecord} from "../types/records";
import {fetchBookRecords} from "../api/ReadingRecord";
import {useParams} from "react-router-dom";
import CreateRecordModal from "../components/modal/CreateRecordModal";

export default function BookRecordPage() {
    const { bookId } = useParams<{ bookId: string }>();
    const id = Number(bookId);

    const [book, setBook] = useState<BookMeta | null>(null);
    const [records, setRecords] = useState<BookRecord[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 기록 생성 모달 상태
    const [createOpen, setCreateOpen] = useState(false);

    const PAGE_SIZE = 10;
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const lockRef = useRef<boolean>(false);
    const lastRequestedCursorRef = useRef<string | null>(null);

    // 날짜 그룹 유틸
    function formatDateTime(iso: string) {
        const d = new Date(iso);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return { day: `${yyyy}.${mm}.${dd}`, time: `${hh}:${mi}` };
    }

    function formatYMD(iso: string): string {
        const d = new Date(iso);
        const yyyy = d.getFullYear();
        const MM = String(d.getMonth() + 1);
        const dd = String(d.getDate());
        return `${yyyy}.${MM}.${dd}`;
    }

    function groupByDay(items: BookRecord[]) {
        const map = new Map<string, BookRecord[]>();
        for (const r of items) {
            const { day } = formatDateTime(r.recordedAt);
            if (!map.has(day)) map.set(day, []);
            map.get(day)!.push(r);
        }
        // 날짜 그룹 내림차순
        const groups = Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
        // 각 그룹 내부를 미리 정렬(시간 내림차순)
        for (const [, arr] of groups) {
            arr.sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1));
        }
        return groups;
    }

    const grouped = useMemo(() => groupByDay(records), [records]);

    // 레코드 합치기
    function mergeUniqueById<T extends { id: string | number }>(prev: T[], next: T[]) {
        const map = new Map<string | number, T>();
        for (const it of prev) map.set(it.id, it);
        for (const it of next) map.set(it.id, it);
        return Array.from(map.values());
    }

    // 상태 초기화 (bookId 변할 때)
    useEffect(() => {
        setBook(null);
        setRecords([]);
        setCursor(null);
        setHasMore(true);
        setError(null);
        loadNext(true);
    }, [bookId]);

    // 다음 페이지 로드(중복 방지 포함)
    const loadNext = async (isInitial = false) => {
        const usedCursor = cursor ?? null;
        if (lockRef.current) return;
        if (loading || loadingMore) return;
        if (!hasMore && !isInitial) return;
        if (!isInitial && usedCursor === lastRequestedCursorRef.current) return;

        lastRequestedCursorRef.current = usedCursor;
        lockRef.current = true;
        lastRequestedCursorRef.current = usedCursor;
        isInitial ? setLoading(true) : setLoadingMore(true);
        setError(null);

        try {
            const data = await fetchBookRecords(id, usedCursor, PAGE_SIZE);
            setBook(prev => prev ?? data.book);
            setRecords(prev => mergeUniqueById(prev, data.content));
            setCursor(data.nextCursor ?? null);
            setHasMore(Boolean(data.hasMore));
        } catch (e: any) {
            setError(e?.message ?? "불러오기 실패");
        } finally {
            isInitial ? setLoading(false) : setLoadingMore(false);
            lockRef.current = false;
        }
    };

    // 기록 생성 후 새로고침
    const handleRecordCreated = () => {
        setRecords([]);
        setCursor(null);
        setHasMore(true);
        loadNext(true);
    };

    // IntersectionObserver로 센티널 진입 시 다음 페이지 로드
    useEffect(() => {
        const target = sentinelRef.current;
        if (!target) return;
        if (loading) return;

        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry.isIntersecting) return;
                if (lockRef.current || loading || loadingMore || !hasMore) return;
                io.unobserve(entry.target);
                loadNext(false)
                    .catch(() => {})
                    .finally(() => {
                        if (sentinelRef.current && hasMore) {
                            setTimeout(() => io.observe(sentinelRef.current as Element), 0);
                        }
                    });
            },
            { root: null, rootMargin: "200px", threshold: 0 }
        );

        io.observe(target);
        return () => io.disconnect();
    }, [loading, loadingMore, hasMore, cursor, bookId]);

    return (
        <section className={styles.wrap} aria-label="책 기록 상세">
            {/* 상단 헤더 카드 */}
            <header className={styles.header}>
                <div className={styles.coverBox}>
                    {book?.coverUrl ? (
                        <img src={book.coverUrl} alt={`${book.title} 표지`} className={styles.cover} loading="lazy" />
                    ) : (
                        <div className={styles.coverPlaceholder}>No Image</div>
                    )}
                </div>

                <div className={styles.bookInfo}>
                    <div className={styles.book}>
                        <h1 className={styles.title}>{book?.title ?? "제목 없음"}</h1>
                        {!!book?.author && <div className={styles.author}>{book.author}</div>}
                        <div className={styles.subMeta}>
                            {!!book?.publisher && <span>{book.publisher}</span>}
                            {!!book?.publishedDate && <span>· {book.publishedDate}</span>}
                        </div>

                        {book?.periodStart || book?.periodEnd ? (
                            <div className={styles.periodCard}>
                                <div className={styles.periodLabel}>기록한 기간</div>
                                <div className={styles.periodValue}>
                                    {formatYMD(book?.periodStart) ?? "—"} ~ {formatYMD(book?.periodEnd) ?? "—"}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* 기록 추가 버튼 */}
                    <button
                        className={styles.addRecordBtn}
                        onClick={() => setCreateOpen(true)}
                    >
                        기록 추가
                    </button>
                </div>
            </header>

            <hr className={styles.divider} />

            {/* 리스트 영역 */}
            {loading && <div className={styles.helper}>불러오는 중…</div>}
            {error && <div className={styles.helper}>{error}</div>}

            {!loading && !error && (
                <div className={styles.readable}>
                    <div className={styles.list}>
                        {grouped.map(([day, recs]) => (
                            <section key={day} className={styles.dayGroup} aria-label={day}>
                                <h2 className={styles.dayHeading}>{day}</h2>
                                <ul className={styles.recordUl}>
                                    {recs.map((r) => {
                                        const { time } = formatDateTime(r.recordedAt);
                                        return (
                                            <li key={r.id} className={styles.recordItem}>
                                                <time className={styles.time}>{time}</time>
                                                <div className={styles.recordCard} data-time={time}>
                                                    {r.sentence && <blockquote className={styles.quote}>{r.sentence}</blockquote>}
                                                    {r.comment && <p className={styles.comment}>{r.comment}</p>}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))}

                        {/* 무한 스크롤 */}
                        <div ref={sentinelRef} className={styles.sentinel} aria-hidden style={{ height: 1 }} />
                        {loadingMore && <div className={styles.helper}>더 불러오는 중…</div>}
                        {!hasMore && records.length > 0 && (
                            <div className={styles.helper}>마지막 기록까지 다 봤어요.</div>
                        )}
                    </div>
                </div>
            )}

            {/* 기록 생성 모달 */}
            <CreateRecordModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={handleRecordCreated}
                initialTitle={book?.title}
                initialAuthor={book?.author}
            />
        </section>
    );
}