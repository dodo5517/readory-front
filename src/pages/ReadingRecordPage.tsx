import React, {useEffect, useState} from 'react';
import styles from '../styles/ReadingRecordPage.module.css';
import {fetchCandidatesLocal, fetchCandidatesExternal, fetchDeleteRecord, fetchMyRecords, fetchRemoveMatch, linkRecord} from "../api/ReadingRecord";
import { MagnifyingGlassIcon, CaretLeftIcon, CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import {Record} from "../types/records";
import {BookCandidate, PageResult} from "../types/books";
import BookSelectModal from "../components/modal/BookSelectModal";
import Pagination from "../components/pagination/Pagination";
import RecordEditModal from "../components/modal/EditRecordModal";
import CreateRecordModal from "../components/modal/CreateRecordModal";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useDemoGuard} from "../hook/useDemoGuard";
import {fetchMyDay, fetchMyMonth} from "../api/Calendar";

const getInitialPageSize = () => {
    if (typeof window === "undefined") return 10;
    return window.matchMedia("(max-width: 768px)").matches ? 6 : 10;
};

const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function ReadingRecordPage() {
    const [sp, setSearchParams] = useSearchParams();
    const mode = sp.get("mode") as "day" | "month" | null;
    const date = sp.get("date");
    const yearS = sp.get("year");
    const monthS = sp.get("month");
    const year = yearS ? parseInt(yearS, 10) : undefined;
    const month = monthS ? parseInt(monthS, 10) : undefined;

    const [data, setData] = useState<PageResult<Record> | null>(null);
    const items = data?.items ?? [];
    const [page, setPage] = useState(0);
    const [size, setSize] = useState<number>(getInitialPageSize);
    const [scope, setScope] = useState<"titleAndAuthor" | "sentenceAndComment">("titleAndAuthor");
    const [sort] = useState<"asc" | "desc">("desc");
    const [q, setQ] = useState("");
    const [queryInput, setQueryInput] = useState("");

    const { demoGuard } = useDemoGuard();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const PLACEHOLDER = {
        titleAndAuthor: '제목/작가에서 검색...',
        sentenceAndComment: '문장/메모에서 검색...',
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [candidates, setCandidates] = useState<BookCandidate[]>([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Record | null>(null);
    const openEditModal = (rec: Record) => {
        setEditing(rec);
        setEditOpen(true);
    };

    const [createOpen, setCreateOpen] = useState(false);

    const [modalKeyword, setModalKeyword] = useState("");
    const [modalSortKey, setModalSortKey] = useState<'title' | 'author'>('title');

    // 화면 크기 변경 시 size 동기화
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 768px)");
        const apply = (matches: boolean) => {
            const next = matches ? 6 : 10;
            setSize(prev => (prev === next ? prev : next));
            setPage(0);
        };
        apply(mql.matches);
        const handler = (e: MediaQueryListEvent) => apply(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    // 목록 fetch
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                let next: PageResult<Record>;
                if (mode === "day" && date) {
                    next = await fetchMyDay({ date, page, sort, size, q });
                } else if (mode === "month" && year && month) {
                    next = await fetchMyMonth({ year, month, page, sort, size, q });
                } else {
                    next = await fetchMyRecords({ page, scope, size, q });
                }
                if (!aborted) setData(next);
            } catch (e: any) {
                if (!aborted) setError("불러오기 실패");
            } finally {
                if (!aborted) setLoading(false);
            }
        })();
        return () => { aborted = true; };
    }, [mode, date, year, month, page, size, q, scope, sort]);

    // 현재 모드에 맞게 목록 재조회
    const refetchCurrentPage = async (overridePage?: number): Promise<PageResult<Record>> => {
        const p = overridePage ?? page;
        if (mode === "day" && date) {
            return fetchMyDay({ date, page: p, sort, size, q });
        } else if (mode === "month" && year && month) {
            return fetchMyMonth({ year, month, page: p, sort, size, q });
        }
        return fetchMyRecords({ page: p, scope, size, q });
    };

    // 목록 새로고침
    const refreshList = async () => {
        try {
            setLoading(true);
            const updated = await refetchCurrentPage(0);
            setData(updated);
            setPage(0);
        } catch (e: any) {
            setError(e?.message ?? "목록 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    // 기록 삭제 핸들러
    const handleDeleteRecord = async (record: Record) => {
        // eslint-disable-next-line no-restricted-globals
        const ok = confirm("이 기록을 삭제할까요? 삭제 후 되돌릴 수 없습니다.");
        if (!ok) return;
        try {
            await fetchDeleteRecord(record.id);
            const updated = await refetchCurrentPage();
            setData(updated);
        } catch (e: any) {
            alert(e?.message ?? "삭제에 실패했습니다.");
        } finally {
            setEditOpen(false);
            alert("해당 기록을 삭제했습니다.");
        }
    };

    // 책 후보 검색 후 모달 띄움
    const openSelectModal = async (rec: Record) => {
        setSelectedRecordId(rec.id);
        const rawTitle = rec.title ?? "";
        const rawAuthor = rec.author ?? "";
        if (rawTitle) {
            setModalSortKey('title');
            setModalKeyword(rawTitle);
        } else {
            setModalSortKey('author');
            setModalKeyword(rawAuthor);
        }
        setCandidatesLoading(true);
        setModalOpen(true);
        try {
            const list = await fetchCandidatesLocal(rawTitle, rawAuthor);
            setCandidates(list);
        } catch (e: any) {
            setCandidates([]);
        } finally {
            setCandidatesLoading(false);
        }
    };

    // 책 후보 모달에서 책 선택
    const handleSelectCandidate = async (book: BookCandidate) => {
        if (!selectedRecordId) return;
        try {
            await linkRecord(selectedRecordId, book);
            const updated = await refetchCurrentPage();
            setData(updated);
            setModalOpen(false);
        } catch (e: any) {
            alert(e?.message ?? "기록과 책 연결에 실패했습니다.");
        }
    };

    // 모달에서 검색 시 호출(로컬 검색)
    const handleModalSearchLocal = async () => {
        setCandidatesLoading(true);
        try {
            const title = modalSortKey === 'title' ? modalKeyword : "";
            const author = modalSortKey === 'author' ? modalKeyword : "";
            const list = await fetchCandidatesLocal(title, author);
            setCandidates(list);
        } catch (e) {
            setCandidates([]);
        } finally {
            setCandidatesLoading(false);
        }
    };

    // 모달에서 검색 시 호출(외부 검색)
    const handleModalSearchExternal = async () => {
        setCandidatesLoading(true);
        try {
            const title = modalSortKey === 'title' ? modalKeyword : "";
            const author = modalSortKey === 'author' ? modalKeyword : "";
            const list = await fetchCandidatesExternal(title, author);
            setCandidates(list);
        } catch (e) {
            setCandidates([]);
        } finally {
            setCandidatesLoading(false);
        }
    };

    // 책 매칭 취소
    const handleRemoveMatch = async (recordId: number) => {
        setCandidatesLoading(true);
        try {
            await fetchRemoveMatch(recordId);
            const updated = await refetchCurrentPage();
            setData(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setCandidatesLoading(false);
        }
    };

    // ── 날짜 컨텍스트 배너 계산 ──
    const today = new Date();
    const todayStr = fmtDate(today);
    const thisYear = today.getFullYear();
    const thisMonth1 = today.getMonth() + 1;

    const isNextDayDisabled = mode === "day" && !!date && date >= todayStr;
    const isNextMonthDisabled = mode === "month" && !!year && !!month &&
        (year > thisYear || (year === thisYear && month >= thisMonth1));

    const dayLabel = (() => {
        if (mode !== "day" || !date) return "";
        const parts = date.split('-').map(Number);
        return `${parts[0]}년 ${parts[1]}월 ${parts[2]}일 기록`;
    })();
    const monthLabel = (mode === "month" && year && month) ? `${year}년 ${month}월 기록` : "";

    const handlePrevDay = () => {
        if (!date) return;
        const [y, m, d] = date.split('-').map(Number);
        const prev = new Date(y, m - 1, d - 1);
        setPage(0);
        setSearchParams({ mode: "day", date: fmtDate(prev) });
    };

    const handleNextDay = () => {
        if (!date || isNextDayDisabled) return;
        const [y, m, d] = date.split('-').map(Number);
        const next = new Date(y, m - 1, d + 1);
        setPage(0);
        setSearchParams({ mode: "day", date: fmtDate(next) });
    };

    const handlePrevMonth = () => {
        if (!year || !month) return;
        const prev = new Date(year, month - 2, 1);
        setPage(0);
        setSearchParams({ mode: "month", year: String(prev.getFullYear()), month: String(prev.getMonth() + 1).padStart(2, '0') });
    };

    const handleNextMonth = () => {
        if (!year || !month || isNextMonthDisabled) return;
        const next = new Date(year, month, 1);
        setPage(0);
        setSearchParams({ mode: "month", year: String(next.getFullYear()), month: String(next.getMonth() + 1).padStart(2, '0') });
    };

    const handleClearDate = () => {
        setPage(0);
        setSearchParams({});
    };

    const isDateMode = mode === "day" || mode === "month";

    return (
        <section className={styles.container}>
            <h1 className={styles.title}>My Reading Records</h1>

            {/* 날짜 컨텍스트 배너 */}
            {isDateMode && (
                <div className={styles.dateBanner}>
                    <button
                        type="button"
                        className={styles.dateNavBtn}
                        onClick={mode === "day" ? handlePrevDay : handlePrevMonth}
                        aria-label="이전"
                    >
                        <CaretLeftIcon size={14} />
                    </button>
                    <span className={styles.dateBannerLabel}>
                        {mode === "day" ? dayLabel : monthLabel}
                    </span>
                    <button
                        type="button"
                        className={styles.dateNavBtn}
                        onClick={mode === "day" ? handleNextDay : handleNextMonth}
                        disabled={mode === "day" ? isNextDayDisabled : isNextMonthDisabled}
                        aria-label="다음"
                    >
                        <CaretRightIcon size={14} />
                    </button>
                    <button
                        type="button"
                        className={styles.clearDateBtn}
                        onClick={handleClearDate}
                        aria-label="전체 보기"
                    >
                        전체 보기
                    </button>
                </div>
            )}

            {/* 툴바: 세그먼트 | 검색창 + 돋보기 + 기록 추가 */}
            <div className={styles.toolbar}>
                {!isDateMode && (
                    <div className={styles.segment}>
                        <button
                            className={`${styles.segBtn} ${scope === "titleAndAuthor" ? styles.isActive : ""}`}
                            onClick={() => { setScope("titleAndAuthor"); setPage(0); }}
                        >
                            제목/작가
                        </button>
                        <button
                            className={`${styles.segBtn} ${scope === "sentenceAndComment" ? styles.isActive : ""}`}
                            onClick={() => { setScope("sentenceAndComment"); setPage(0); }}
                        >
                            문장/메모
                        </button>
                    </div>
                )}

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
                    placeholder={isDateMode ? '기록 검색...' : PLACEHOLDER[scope]}
                    aria-label={isDateMode ? '기록 검색...' : PLACEHOLDER[scope]}
                    className={styles.searchInput}
                />

                <button
                    className={styles.searchBtn}
                    onClick={() => { setPage(0); setQ(queryInput.trim()); }}
                >
                    <MagnifyingGlassIcon />
                </button>

                <button
                    className={styles.createBtn}
                    onClick={() => setCreateOpen(true)}
                >
                    <PlusIcon size={14} weight="bold" />
                    <span>기록 추가</span>
                </button>
            </div>

            {loading ? (
                <div className={styles.loading} aria-live="polite"></div>
            ) : error ? (
                <div className={styles.error} role="alert">{error}</div>
            ) : (
                <>
                    <div className={styles.list}>
                        {items.map((record) => (
                            <div
                                key={record.id}
                                className={styles.card}
                                onClick={() => record.bookId && navigate(`/bookRecord/${record.bookId}`)}
                                style={{ cursor: record.bookId ? 'pointer' : 'default' }}
                            >
                                <div className={styles.coverArea}>
                                    {record.bookId ? (
                                        <img
                                            src={record.coverUrl ?? undefined}
                                            alt={`${record.title} 표지`}
                                            className={styles.coverImg}
                                            loading="lazy"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </div>
                                <div className={styles.meta}>
                                    <div className={styles.date}>{record.recordedAt}</div>
                                    <div className={styles.info}>
                                        <h3 className={styles.bookTitle}>{record.title}</h3>
                                        <div className={styles.author}>{record.author?.length ? record.author + "(작가)" : ""}</div>
                                        <div className={styles.sentence}>{record.sentence}</div>
                                        <div className={styles.comment}>{record.comment}</div>
                                        {record.bookId && <span className={styles.badgeLinked}>연결됨</span>}
                                    </div>
                                </div>
                                <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        className={styles.editBtn}
                                        onClick={() => openEditModal(record)}
                                        aria-label="기록 수정"
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.linkBtn}
                                        onClick={() => openSelectModal(record)}
                                    >
                                        {record.bookId ? "책 다시 연결" : "책 연결"}
                                    </button>
                                    {record.bookId && (
                                        <button
                                            type="button"
                                            className={styles.linkBtn}
                                            onClick={() => handleRemoveMatch(record.id)}
                                        >
                                            연결 끊기
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.dangerBtn}
                                        onClick={demoGuard(() => handleDeleteRecord(record))}
                                        aria-label="기록 삭제"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

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
                        onChangePageSize={(s) => { setPage(0); setSize(s); }}
                        disabled={loading}
                        windowSize={5}
                    />
                </>
            )}

            <BookSelectModal
                open={modalOpen}
                candidates={candidates}
                onSelect={handleSelectCandidate}
                onClose={() => setModalOpen(false)}
                loading={candidatesLoading}
                keyword={modalKeyword}
                onKeywordChange={setModalKeyword}
                sortKey={modalSortKey}
                onSortKeyChange={setModalSortKey}
                onSubmitSearch={handleModalSearchLocal}
                onAddExternalSearch={handleModalSearchExternal}
            />

            {editing && editOpen && (
                <RecordEditModal
                    open={editOpen}
                    initial={{
                        id: editing.id,
                        recordedAt: editing.recordedAt,
                        title: editing.title ?? "",
                        author: editing.author ?? "",
                        sentence: editing.sentence ?? "",
                        comment: editing.comment ?? "",
                    }}
                    onSave={async () => {
                        const updated = await refetchCurrentPage();
                        setData(updated);
                    }}
                    onClose={() => setEditOpen(false)}
                />
            )}

            <CreateRecordModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={refreshList}
            />
        </section>
    );
}