import React, {useEffect, useState} from 'react';
import styles from '../styles/ReadingRecordsPage.module.css';
import {fetchCandidates, fetchMyRecords, linkRecord} from "../api/ReadingRecord";
import {Record} from "../types/records";
import {BookCandidate} from "../types/books";
import BookSelectModal from "../components/BookSelectModal";

export default function ReadingRecordsPage() {
    const [record, setRecord] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'title' | 'author' | 'date'>('title');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const query = `?sort=${sortKey}&order=${sortOrder}`;

    // 모달/후보/연결용 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [candidates, setCandidates] = useState<BookCandidate[]>([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

    // 모달 상단 검색창과 동기화할 키워드(제목/작가)
    const [modalTitleKeyword, setModalTitleKeyword] = useState("");
    const [modalAuthorKeyword, setModalAuthorKeyword] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const items = await fetchMyRecords();
                setRecord(items);
                console.log("fetchMyRecords");
            } catch (e: any) {
                console.error(e);
                setError("불러오기 실패");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 책 후보 검색 후 모달 띄움
    const openSelectModal = async (rec: Record) => {
        console.log("openSelectModal");
        setSelectedRecordId(rec.id);
        // 기록에 있는 제목/작가를 초기 키워드로 사용 (없으면 빈 문자열)
        const rawTitle = rec.title ?? "";
        const rawAuthor = rec.author ?? "";
        setModalTitleKeyword(rawTitle);
        setModalAuthorKeyword(rawAuthor);

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
            // 낙관적 업데이트: 목록에 선택한 책 정보 반영
            setRecord((prev) =>
                prev.map((r) =>
                    r.id === selectedRecordId
                        ? {
                            ...r,
                            title: book.title,
                            author: book.author?.[0] ?? r.author ?? "",
                            // matched/bookId 등 서버 응답에 맞춰 업데이트하고 싶으면 fetchMyRecords 재호출 권장
                        }
                        : r
                )
            );
            setModalOpen(false);
        } catch (e: any) {
            alert(e?.message ?? "기록과 책 연결에 실패했습니다.");
        }
    };

    return (
        <section className={styles.container}>
            <h1 className={styles.title}>My Reading Records</h1>

            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Search by title, sentence, or comment"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />

                <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as 'title' | 'author' | 'date')}
                    className={styles.select}
                >
                    <option value="title">제목</option>
                    <option value="author">작가</option>
                    <option value="date">날짜</option>
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className={styles.select}
                >
                    <option value="asc">오름차순</option>
                    <option value="desc">내림차순</option>
                </select>

            </div>

            <div className={styles.list}>
                {record.map((record) => (
                    <div key={record.id} className={styles.card}>
                        <div className={styles.date}>{record.recordedAt}</div>
                        <div className={styles.info}>
                            <h3 className={styles.bookTitle}>{record.title}</h3>
                            <div className={styles.author}>{record.author?.length ? record.author+"(작가)" : ""}</div>
                            <div className={styles.sentence}>{record.sentence}</div>
                            <div className={styles.comment}>{record.comment}</div>
                        </div>
                        <div className={styles.actions}>
                            <button
                                className={styles.linkBtn}
                                onClick={() => openSelectModal(record)}
                            >
                                책 연결
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 책 후보 선택 모달 */}
            <BookSelectModal
                open={modalOpen}
                candidates={candidates}
                loading={candidatesLoading}
                keyword={modalTitleKeyword}                 // 모달 상단 검색창과 동기화(제목 기준)
                onKeywordChange={setModalTitleKeyword}
                onSelect={handleSelectCandidate}
                onClose={() => setModalOpen(false)}
            />
        </section>
    );
}