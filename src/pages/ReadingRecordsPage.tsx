import React, {useEffect, useState} from 'react';
import styles from '../styles/ReadingRecordsPage.module.css';
import {fetchCandidates, fetchDeleteRecord, fetchMyRecords, fetchRemoveMatch, linkRecord} from "../api/ReadingRecord";
import {Record} from "../types/records";
import {BookCandidate, PageResult} from "../types/books";
import BookSelectModal from "../components/BookSelectModal";
import Pagination from "../components/pagination/Pagination";
import RecordEditModal from "../components/RecordEditModal";

// 초기 페이지크기: 모바일 6, 데스크탑 10
const getInitialPageSize = () => {
    if (typeof window === "undefined") return 10;
    return window.matchMedia("(max-width: 768px)").matches ? 6 : 10;
};

export default function ReadingRecordsPage() {
    const [data, setData] = useState<PageResult<Record>| null>(null);
    const items = data?.items ?? [];
    const [page, setPage] = useState(0);
    const [size, setSize] = useState<number>(getInitialPageSize); //모바일=6, 데스크탑=10
    const [scope, setScope] = useState<"titleAndAuthor" | "sentenceAndComment">("titleAndAuthor");
    const [q, setQ] = useState("");
    const [queryInput, setQueryInput] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const PLACEHOLDER = {
        titleAndAuthor: '제목/작가에서 검색...',
        sentenceAndComment: '문장/메모에서 검색...',
    };

    // 책 연결 모달/후보/연결용 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [candidates, setCandidates] = useState<BookCandidate[]>([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

    // 기록 수정 모달 상태
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Record | null>(null);
    const openEditModal = (rec: Record) => {
        setEditing(rec);
        setEditOpen(true);
    };

    // 모달 검색 제어 상태
    const [modalKeyword, setModalKeyword] = useState("");
    const [modalSortKey, setModalSortKey] = useState<'title' | 'author'>('title');

    // 기록 삭제 핸들러
    const handleDeleteRecord = async (record:Record) => {
        // eslint-disable-next-line no-restricted-globals
        const ok = confirm("이 기록을 삭제할까요? 삭제 후 되돌릴 수 없습니다.");
        if (!ok) return;
        try {
            await fetchDeleteRecord(record.id);
            // 삭제 후 현재 페이지 재조회
            const updated = await fetchMyRecords({ page, size, q });
            setData(updated);
        } catch (e:any) {
            alert(e?.message ?? "삭제에 실패했습니다.");
        } finally {
            setEditOpen(false);
            alert("해당 기록을 삭제했습니다.");
        }
    };

    // 화면 크기 변경 시 size 동기화
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 768px)");
        const apply = (matches: boolean) => {
            const next = matches ? 6 : 10;
            // 값이 달라질 때만 업데이트 (불필요한 재요청 방지)
            setSize(prev => (prev === next ? prev : next));
            setPage(0);
        };
        apply(mql.matches);
        const handler = (e: MediaQueryListEvent) => apply(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    // 목록 fetch: page/size/q 변화에 반응
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const next = await fetchMyRecords({ page, scope, size, q });
                if (!aborted) setData(next);
            } catch (e: any) {
                if (!aborted) setError("불러오기 실패");
            } finally {
                if (!aborted) setLoading(false);
            }
        })();
        return () => { aborted = true; };
    }, [page, size, q]);

    // 책 후보 검색 후 모달 띄움
    const openSelectModal = async (rec: Record) => {
        console.log("openSelectModal");
        setSelectedRecordId(rec.id);
        // 기록에 있는 제목/작가를 초기 키워드로 사용 (없으면 빈 문자열)
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
        setModalOpen(true); // UX상 먼저 열고 "불러오는 중…" 보여줌
        try {
            const list = await fetchCandidates(rawTitle, rawAuthor);
            setCandidates(list);
            console.log("fetchCandidates candidates: ", candidates);
        } catch (e: any) {
            console.error(e);
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
            // 책 선택 → 서버 반영 후 현재 페이지 재조회
            const updated = await fetchMyRecords({ page, size, q });
            setData(updated);
            setModalOpen(false);
        } catch (e: any) {
            alert(e?.message ?? "기록과 책 연결에 실패했습니다.");
        }
    };

    // 모달에서 검색 시 호출
    const handleModalSearch = async () => {
        setCandidatesLoading(true);
        try {
            const title = modalSortKey === 'title' ? modalKeyword : "";
            const author = modalSortKey === 'author' ? modalKeyword : "";
            const list = await fetchCandidates(title, author);
            setCandidates(list);
            console.log("searched candidates: ", list);
        } catch (e) {
            console.error(e);
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
            const updated = await fetchMyRecords({ page, size, q });
            setData(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setCandidatesLoading(false);
        }
    };

    return (
        <section className={styles.container}>
            <h1 className={styles.title}>My Reading Records</h1>

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
                        placeholder={PLACEHOLDER[scope]}
                        aria-label={PLACEHOLDER[scope]}
                        className={styles.searchInput}
                    />
                    <button
                        className={styles.searchBtn}
                        onClick={() => {
                            setPage(0);
                            setQ(queryInput.trim());
                        }}
                    >
                        🔍
                    </button>
                </div>

                <div className={styles.segment}>
                    <button
                        className={`${styles.segBtn} ${scope === "titleAndAuthor" ? styles.isActive : ""}`}
                        onClick={() => {
                            setScope("titleAndAuthor");
                            setPage(0);
                        }}
                    >
                        제목/작가
                    </button>
                    <button
                        className={`${styles.segBtn} ${scope === "sentenceAndComment" ? styles.isActive : ""}`}
                        onClick={() => {
                            setScope("sentenceAndComment");
                            setPage(0);
                        }}
                    >
                        문장/메모
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading} aria-live="polite">로딩 중…</div>
            ) : error ? (
                <div className={styles.error} role="alert">{error}</div>
            ) : (
                <>
                    <div className={styles.list}>
                        {items.map((record) => (
                            <div key={record.id} className={styles.card}>
                                <div className={styles.coverArea}>
                                    {record.bookId ? (
                                        <img
                                            src={record.coverUrl ?? undefined} // null이면 undefined로 변환
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
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.editBtn}
                                onClick={() => openEditModal(record)}
                                aria-label="기록 수정"
                                title="기록 수정"
                            >
                                ✏️ 수정
                            </button>

                            <button
                                type="button"
                                className={styles.linkBtn}
                                onClick={() => openSelectModal(record)}
                            >
                                {record.bookId ? "책 다시 연결" : "책 연결"}
                            </button>
                            {record.bookId && (<button
                                    type="button"
                                    className={styles.linkBtn}
                                    onClick={() => handleRemoveMatch(record.id)}
                                >
                                    책 연결 끊기
                                </button>
                            )}

                            <button
                                type="button"
                                className={styles.dangerBtn}
                                onClick={() => handleDeleteRecord(record)}
                                aria-label="기록 삭제"
                                title="기록 삭제"
                            >
                                🗑️ 삭제
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

            {/* 책 후보 선택 모달 */}
            <BookSelectModal
                open={modalOpen}
                candidates={candidates}
                onSelect={handleSelectCandidate}
                onClose={() => setModalOpen(false)}
                loading={candidatesLoading}

                keyword={modalKeyword}               // 모달 상단 검색창과 동기화(제목 기준)
                onKeywordChange={setModalKeyword}
                sortKey={modalSortKey}
                onSortKeyChange={setModalSortKey}
                onSubmitSearch={handleModalSearch}
            />

            {/*책 수정 모달*/}
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
                    onSave={async (form) => {
                        const updated = await fetchMyRecords({ page, size, q });
                        setData(updated);
                    }}
                    onDelete={async (id) => handleDeleteRecord(editing)}
                    onClose={() => setEditOpen(false)}
                />
            )}
        </section>
    );
}