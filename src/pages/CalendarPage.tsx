import React, {useEffect, useRef, useState} from 'react';
import styles from '../styles/ReadingRecordPage.module.css';
import {fetchCandidatesLocal, fetchCandidatesExternal, fetchMyRecords, fetchRemoveMatch, linkRecord} from "../api/ReadingRecord";
import {Record} from "../types/records";
import {BookCandidate, PageResult} from "../types/books";
import BookSelectModal from "../components/modal/BookSelectModal";
import Pagination from "../components/pagination/Pagination";
import RecordToolbar, {SearchParams} from "../components/RecordToolbar";
import {fetchMyDay, fetchMyMonth} from "../api/Calendar";
import {useNavigate, useSearchParams} from "react-router-dom";

// 초기 페이지크기: 모바일 6, 데스크탑 10
const getInitialPageSize = () => {
    if (typeof window === "undefined") return 10;
    return window.matchMedia("(max-width: 768px)").matches ? 6 : 10;
};

export default function CalendarPage() {
    const navigate = useNavigate();

    const [sp, setSearchParams] = useSearchParams();
    const mode  = (sp.get("mode") ?? "month") as "month" | "day";
    const date  = sp.get("date");   // YYYY-MM-DD
    const yearS  = sp.get("year");   // "2025"
    const monthS = sp.get("month");  // "07"

    // 문자열 → 숫자
    const year  = yearS ? parseInt(yearS, 10) : undefined;
    const month = monthS ? parseInt(monthS, 10) : undefined;

    const defaultMonthStr = year && month ? `${year}-${String(month).padStart(2, "0")}` : undefined;

    const [data, setData] = useState<PageResult<Record>| null>(null);
    const items = data?.items ?? [];
    const [page, setPage] = useState(0);
    const [size, setSize] = useState<number>(getInitialPageSize); //모바일=6, 데스크탑=10
    const [sort, setSort]   = useState<"asc"|"desc">((sp.get("sort") ?? "desc") as "asc"|"desc");
    const [q, setQ] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 모달/후보/연결용 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [candidates, setCandidates] = useState<BookCandidate[]>([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

    // 모달 검색 제어 상태
    const [modalKeyword, setModalKeyword] = useState("");
    const [modalSortKey, setModalSortKey] = useState<'title' | 'author'>('title');


    const lastParamsRef = useRef<string>("");
    const didInitURL = useRef(false);

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

    /** 초기 URL 정규화: 파라미터 없으면 먼저 URL만 채우고 fetch는 다음 렌더에서 1회 === */
    useEffect(() => {
        if (didInitURL.current) return;

        if (mode === "month" && (!year || !month)) {
            const now = new Date();
            setSearchParams({
                mode: "month",
                year: String(now.getFullYear()),
                month: String(now.getMonth() + 1).padStart(2, "0"),
                q: q || "",
                sort,
                page: String(page),
                size: String(size),
            }, { replace: true } as any);
            didInitURL.current = true;
            console.log("setSearchParams에 month 설정됨.");
            return;
        }
        if (mode === "day" && !date) {
            const pad2 = (n: number) => String(n).padStart(2, "0");
            const d = new Date();
            const today = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
            setSearchParams({
                mode: "day",
                date: today,
                q: q || "",
                sort,
                page: String(page),
                size: String(size),
            }, { replace: true } as any);
            didInitURL.current = true;
            console.log("setSearchParams에 date 설정됨.");
            return;
        }

        didInitURL.current = true;
    }, [mode, year, month, date, setSearchParams]); // 최소 의존성


    // 목록 fetch
    useEffect(() => {
        const paramsKey = JSON.stringify({ mode, date, year, month, page, size, q, sort });
        if (lastParamsRef.current === paramsKey) return; // 동일 조건이면 스킵
        lastParamsRef.current = paramsKey;

        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                if (mode === "day" && date) {
                    const res = await fetchMyDay({ date, page, sort, size, q });
                    if (!cancelled) {
                        setData(res);
                        console.log("fetchMyDay 실행됨.");
                    }
                } else if (mode === "month" && year && month) {
                    const res = await fetchMyMonth({ year, month, page, sort, size, q });
                    if (!cancelled) {
                        setData(res);
                        console.log("fetchMyMonth 실행됨.");
                    }
                }
            } catch {
                if (!cancelled) setError("불러오기 실패");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true };
    }, [mode, date, year, month, page, size, q, sort]);

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
            // 처음엔 로컬로 후보 검색
            const list = await fetchCandidatesLocal(rawTitle, rawAuthor);
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

    // 모달에서 검색 시 호출(로컬 검색)
    const handleModalSearchLocal = async () => {
        setCandidatesLoading(true);
        try {
            const title = modalSortKey === 'title' ? modalKeyword : "";
            const author = modalSortKey === 'author' ? modalKeyword : "";
            const list = await fetchCandidatesLocal(title, author);
            setCandidates(list);
            console.log("searched candidates: ", list);
        } catch (e) {
            console.error(e);
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
            setData(prev => prev ? {
                ...prev,
                items: prev.items.map(r => r.id === recordId ? { ...r, bookId: null } : r)
            } : prev);
        } catch (e) {
            console.error(e);
        } finally {
            setCandidatesLoading(false);
        }
    };

    // 월/일 변경 시 실행됨.(SearchParams 설정함)
    const handleToolbarSubmit = (p: SearchParams) => {
        setPage(p.page);
        setSize(p.size);
        setQ(p.q ?? "");
        setSort(p.sort);

        if (p.mode === "day") {
            setSearchParams({
                mode: "day",
                date: p.date,          // YYYY-MM-DD
                q: p.q ?? "",
                sort: p.sort,
                page: String(p.page),
                size: String(p.size),
            });
        } else {
            setSearchParams({
                mode: "month",
                year: String(p.year),
                month: String(p.month).padStart(2, "0"),
                q: p.q ?? "",
                sort: p.sort,
                page: String(p.page),
                size: String(p.size),
            });
        }
        console.log("handleToolbarSubmit 실행됨");
    };

    return (
        <section className={styles.container}>
            <h1 className={styles.title}>My Reading Calendar</h1>

            <div className={styles.recordToolbar}>
                {/* 검색 + 정렬 툴바 */}
                <RecordToolbar
                    key={`${mode}-${date ?? defaultMonthStr ?? ""}`}
                    defaultMode={mode}
                    defaultMonth={defaultMonthStr}
                    defaultDate={date}
                    defaultQ={sp.get("q") ?? ""}
                    defaultSort={(sp.get("sort") ?? "desc") as "asc" | "desc"}
                    defaultSize={10}
                    onSubmit={handleToolbarSubmit}
                />
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
                                    onClick={() => navigate(`/bookRecord/${record.bookId}`)}
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
                onSubmitSearch={handleModalSearchLocal} // 로컬 검색
                onAddExternalSearch={handleModalSearchExternal} // 외부에서 검색
            />
        </section>
    );
}