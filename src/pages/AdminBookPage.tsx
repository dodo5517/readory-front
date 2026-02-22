import React, { useEffect, useState } from "react";
import styles from "../styles/AdminBookPage.module.css";
import * as adminBook from "../api/AdminBook";
import { useSearchParams } from "react-router-dom";
import BookDetailModal from "../components/modal/admin/BookDetailModal";
import {PageResponse} from "../types/books";
import {BookDetailResponse, BookListResponse} from "../types/adminLog";
import { BooksIcon } from '@phosphor-icons/react';

export default function AdminBookPage() {
    const [sp, setSearchParams] = useSearchParams();

    const [keyword, setKeyword] = useState("");
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [page, setPage] = useState(0);
    const [size] = useState<number>(10);
    const [sort, setSort] = useState<"desc" | "asc">((sp.get("sort") ?? "desc") as "desc" | "asc");

    const [data, setData] = useState<PageResponse<BookListResponse> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 상세 모달 관련
    const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
    const [bookDetail, setBookDetail] = useState<BookDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);

    // 책 목록 조회
    const fetchList = async () => {
        try {
            setLoading(true);
            setError(null);
            const sortParam = `createdAt,${sort}`;
            const res = await adminBook.getBooks({
                keyword: keyword.trim() || undefined,
                includeDeleted,
                page,
                size,
                sort: sortParam,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "책 목록 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    // 책 상세 조회
    const openBookDetail = async (id: number) => {
        try {
            setSelectedBookId(id);
            setOpenDetail(true);
            setBookDetail(null);
            setDetailLoading(true);
            const detail = await adminBook.getBook(id);
            setBookDetail(detail);
        } catch (e) {
            setError(e instanceof Error ? e.message : "책 상세 조회 실패");
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setOpenDetail(false);
        setSelectedBookId(null);
        setBookDetail(null);
    };

    // 소프트 삭제
    const handleSoftDelete = async () => {
        if (!selectedBookId) return;
        if (!window.confirm("이 책을 삭제하시겠습니까? (복구 가능)")) return;

        try {
            await adminBook.softDeleteBook(selectedBookId);
            alert("삭제되었습니다.");
            closeDetail();
            await fetchList();
        } catch (e) {
            alert(e instanceof Error ? e.message : "삭제 실패");
        }
    };

    // 영구 삭제
    const handleHardDelete = async () => {
        if (!selectedBookId) return;
        if (!window.confirm("이 책을 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) return;
        if (!window.confirm("정말로 영구 삭제하시겠습니까?")) return;

        try {
            await adminBook.hardDeleteBook(selectedBookId);
            alert("영구 삭제되었습니다.");
            closeDetail();
            await fetchList();
        } catch (e) {
            alert(e instanceof Error ? e.message : "영구 삭제 실패");
        }
    };

    // 복구
    const handleRestore = async () => {
        if (!selectedBookId) return;
        if (!window.confirm("이 책을 복구하시겠습니까?")) return;

        try {
            await adminBook.restoreBook(selectedBookId);
            alert("복구되었습니다.");
            closeDetail();
            await fetchList();
        } catch (e) {
            alert(e instanceof Error ? e.message : "복구 실패");
        }
    };

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sort, includeDeleted]);

    // URL 파라미터 업데이트
    useEffect(() => {
        const params: Record<string, string> = {};
        if (sort !== "desc") params.sort = sort;
        setSearchParams(params, { replace: true });
    }, [sort, setSearchParams]);

    const handleSearch = () => {
        setPage(0);
        fetchList();
    };

    // 시간 포맷팅
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const totalPages = data?.totalPages ?? 0;
    const books = data?.content ?? [];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>관리자 · 책 관리</h1>

                <div className={styles.toolbar}>
                    <div className={styles.searchGroup}>
                        <input
                            className={styles.searchInput}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="제목/저자/출판사 검색"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                        <button className={styles.searchBtn} onClick={handleSearch}>
                            검색
                        </button>
                    </div>

                    <div className={styles.segment}>
                        <button
                            className={`${styles.segBtn} ${sort === "desc" ? styles.isActive : ""}`}
                            onClick={() => {
                                setSort("desc");
                                setPage(0);
                            }}
                        >
                            최신
                        </button>
                        <button
                            className={`${styles.segBtn} ${sort === "asc" ? styles.isActive : ""}`}
                            onClick={() => {
                                setSort("asc");
                                setPage(0);
                            }}
                        >
                            오래된
                        </button>
                    </div>
                </div>

                <div className={styles.filters}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={includeDeleted}
                            onChange={(e) => {
                                setIncludeDeleted(e.target.checked);
                                setPage(0);
                            }}
                        />
                        <span>삭제된 책 포함</span>
                    </label>
                </div>

                {error ? <div className={styles.error}>{error}</div> : null}

                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.empty}>로딩중...</div>
                    ) : books.length === 0 ? (
                        <div className={styles.empty}>책이 없습니다.</div>
                    ) : (
                        books.map((book) => (
                            <button
                                key={book.id}
                                className={styles.card}
                                onClick={() => openBookDetail(book.id)}
                            >
                                <div className={styles.coverArea}>
                                    {book.coverUrl ? (
                                        <img
                                            className={styles.cover}
                                            src={book.coverUrl}
                                            alt={book.title}
                                        />
                                    ) : (
                                        <div className={styles.noCover}>
                                            <span><BooksIcon /></span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.meta}>
                                    <div className={styles.topRow}>
                                        <strong className={styles.title}>{book.title}</strong>
                                    </div>
                                    <div className={styles.author}>{book.author}</div>
                                    <div className={styles.subRow}>
                                        <span className={styles.muted}>ID: {book.id}</span>
                                        <span className={styles.dot}>·</span>
                                        <span className={styles.muted}>{book.publisher}</span>
                                    </div>
                                </div>

                                <div className={styles.dateCol}>
                                    <div className={styles.dateLabel}>등록일</div>
                                    <div className={styles.dateValue}>{formatDate(book.createdAt)}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        disabled={page <= 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        이전
                    </button>

                    <span className={styles.pageInfo}>
                        {data ? `${data.number + 1} / ${totalPages}` : "-"}
                    </span>

                    <button
                        className={styles.pageBtn}
                        disabled={data ? data.last : true}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        다음
                    </button>
                </div>

                <BookDetailModal
                    isOpen={openDetail}
                    book={bookDetail}
                    loading={detailLoading}
                    onClose={closeDetail}
                    onSoftDelete={handleSoftDelete}
                    onHardDelete={handleHardDelete}
                    onRestore={handleRestore}
                />
            </div>
        </section>
    );
}