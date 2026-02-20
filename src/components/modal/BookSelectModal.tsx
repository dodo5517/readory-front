import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/BookSelectModal.module.css";
import {BookCandidate} from "../../types/books";

type Props = {
    open: boolean;
    candidates: BookCandidate[];
    onSelect: (book: BookCandidate) => void;
    onClose: () => void;
    loading?: boolean;
    keyword?: string;                 // 상단 검색 입력값(선택)
    onKeywordChange?: (v: string) => void;

    sortKey?: 'title' | 'author';
    onSortKeyChange?: (k: 'title' | 'author') => void;

    onSubmitSearch?: () => void; // 검색 클릭 시 호출
    onAddExternalSearch?: () => void;
};

export default function BookSelectModal({open, candidates, onSelect, onClose,
                                            loading = false, keyword = "", onKeywordChange,
                                            sortKey = 'title', onSortKeyChange,
                                            onSubmitSearch, onAddExternalSearch}: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [focused, setFocused] = useState<number>(-1);
    // 로컬 검색인지 외부 검색인지 확인
    const isLocal = candidates?.[0]?.source === "LOCAL";

    // 접근성: 열릴 때 포커스
    useEffect(() => {
        if (open) {
            setFocused(-1);
            overlayRef.current?.focus();
            // 스크롤 잠금
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [open]);

    const empty = !loading && candidates.length === 0;
    const list = useMemo(() => candidates, [candidates]);
    if (!open) return null;

    return (
        <div
            className={styles.overlay}
            ref={overlayRef}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
            onClick={(e) => {
                // 바깥 클릭 닫기
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <section className={styles.modal}>
                <header className={styles.header}>
                    <h2 className={styles.title}>책 선택</h2>
                </header>
                <form className={styles.toolbar} onSubmit={(e) => {
                    e.preventDefault();
                    onSubmitSearch?.(); // 로컬로 검색(없으면 외부 호출함)
                }}>
                    {/* 세그먼트: 버튼 2개 */}
                    <div className={styles.segment}>
                        <button
                            type="button"
                            className={`${styles.segBtn} ${sortKey === 'title' ? styles.isActive : ''}`}
                            aria-pressed={sortKey === 'title'}
                            onClick={() =>  onSortKeyChange?.('title')}
                        >
                            제목
                        </button>
                        <button
                            type="button"
                            className={`${styles.segBtn} ${sortKey === 'author' ? styles.isActive : ''}`}
                            aria-pressed={sortKey === 'author'}
                            onClick={() => onSortKeyChange?.('author')}
                        >
                            작가
                        </button>
                    </div>

                    {/* 인풋 + 내부 버튼 */}
                    <div className={styles.field}>
                        <input
                            className={styles.searchInput}
                            placeholder="제목 또는 작가를 입력하세요"
                            value={keyword}
                            onChange={(e) => onKeywordChange?.(e.target.value)}
                            aria-label="검색어"
                        />
                        {!!keyword && (
                            <button type="button"
                                    className={`${styles.searchBtn} ${styles.searchBtnClear}`}
                                    onClick={() => onKeywordChange?.('')}
                                    aria-label="검색어 지우기">×</button>
                        )}
                        <button type="submit" className={styles.searchBtn} aria-label="검색">🔎</button>
                    </div>
                </form>

                <div className={styles.content}>
                    {loading && <div className={styles.helperText}>불러오는 중…</div>}
                    {empty && <div className={styles.helperText}>검색 결과가 없습니다.</div>}

                    {!loading && !empty && (
                        <>
                            {/* 데스크탑: 세로 스크롤 리스트 */}
                            <ul className={styles.list} role="listbox" aria-label="책 후보 목록">
                                {list.map((b, idx) => (
                                    <li
                                        key={`${b.isbn13 ?? b.isbn10 ?? b.title}-${idx}`}
                                        className={`${styles.item} ${focused === idx ? styles.itemFocused : ""}`}
                                        role="option"
                                        aria-selected={focused === idx}
                                        onMouseEnter={() => setFocused(idx)}
                                        onClick={() => onSelect(b)}
                                    >
                                        <div className={styles.thumbWrap}>
                                            {b.thumbnailUrl ? (
                                                <img className={styles.thumb} src={b.thumbnailUrl}
                                                     alt={`${b.title} 표지`}/>
                                            ) : (
                                                <div className={styles.thumbPlaceholder}>No Image</div>
                                            )}
                                        </div>

                                        <div className={styles.meta}>
                                            <div className={styles.bookTitle}>{b.title}</div>
                                            <div className={styles.subLine}>
                                                {b.author?.length ? b.author : "작가 미상"}
                                            </div>
                                            <div className={styles.subLine}>
                                                {b.publisher ?? "출판사 미상"}{b.publishedDate ? ` · ${b.publishedDate}` : ""}
                                            </div>
                                            <div className={styles.badges}>
                                                {b.isbn13 && <span className={styles.badge}>ISBN13 {b.isbn13}</span>}
                                                {b.isbn10 && <span className={styles.badge}>ISBN10 {b.isbn10}</span>}
                                                {b.source && <span className={styles.badgeLight}>{b.source}</span>}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* 모바일: 가로 스크롤 카드 */}
                            <div className={styles.cardTrack} aria-hidden>
                                {list.map((b, idx) => (
                                    <button
                                        key={`m-${b.isbn13 ?? b.isbn10 ?? b.title}-${idx}`}
                                        className={styles.card}
                                        onClick={() => onSelect(b)}
                                    >
                                        <div className={styles.cardThumbWrap}>
                                            {b.thumbnailUrl ? (
                                                <img className={styles.cardThumb} src={b.thumbnailUrl} alt=""/>
                                            ) : (
                                                <div className={styles.thumbPlaceholder}>No Image</div>
                                            )}
                                        </div>
                                        <div className={styles.cardTitle} title={b.title}>{b.title}</div>
                                        <div className={styles.cardAuthor}>
                                            {b.author?.length ? b.author : "작가 미상"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <footer className={styles.footer}>
                    {isLocal && <button className={styles.secondaryBtn} onClick={onAddExternalSearch}>더 많은 결과 검색</button>}
                    <button className={styles.secondaryBtn} onClick={onClose}>취소</button>
                </footer>
            </section>
        </div>
    );
}
