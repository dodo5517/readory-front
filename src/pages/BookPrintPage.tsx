import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/BookPrintPage.module.css";
import { fetchBookRecords } from "../api/ReadingRecord";
import { BookMeta } from "../types/books";
import { BookRecord, BookRecordsPage, Highlight } from "../types/records";

const pad = (n: number) => n.toString().padStart(2, "0");
function ymd(iso: string | null | undefined): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

// 배경 옵션 (기본: 베이지·도트). canvasBg/canvasDots = 인쇄 시 페이지 전체(캔버스) 배경
const BG_OPTIONS: {
    key: string; label: string; cls: string; sw: React.CSSProperties;
    canvasBg: string; canvasDots: string;
}[] = [
    { key: "beigeDots", label: "베이지·도트", cls: "bgBeigeDots", sw: { background: "#fbf9f2" }, canvasBg: "#fbf9f2", canvasDots: "#e4dec9" },
    { key: "whiteDots", label: "흰·도트", cls: "bgWhiteDots", sw: { background: "#ffffff" }, canvasBg: "#ffffff", canvasDots: "#e7e7e2" },
    { key: "white", label: "흰색", cls: "bgWhite", sw: { background: "#ffffff" }, canvasBg: "#ffffff", canvasDots: "transparent" },
    { key: "darkDots", label: "다크·도트", cls: "bgDarkDots", sw: { background: "#242422" }, canvasBg: "#242422", canvasDots: "#38382f" },
    { key: "dark", label: "다크", cls: "bgDark", sw: { background: "#2a2a28" }, canvasBg: "#2a2a28", canvasDots: "transparent" },
];

// 문장을 하이라이트 범위로 쪼개 렌더 (읽기 전용)
function renderSentence(sentence: string, highlights: Highlight[]): React.ReactNode[] {
    const sorted = [...(highlights ?? [])]
        .filter(h => h.start >= 0 && h.end <= sentence.length && h.start < h.end)
        .sort((a, b) => a.start - b.start);

    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    for (const h of sorted) {
        if (h.start < cursor) continue;
        if (h.start > cursor) nodes.push(<React.Fragment key={`t${cursor}`}>{sentence.slice(cursor, h.start)}</React.Fragment>);
        nodes.push(
            <mark key={`h${h.id}`} className={`${styles.mark} ${h.color === "PEACH" ? styles.mkPeach : styles.mkGreen}`}>
                {sentence.slice(h.start, h.end)}
            </mark>
        );
        cursor = h.end;
    }
    if (cursor < sentence.length) nodes.push(<React.Fragment key="tend">{sentence.slice(cursor)}</React.Fragment>);
    return nodes;
}

export default function BookPrintPage() {
    const { bookId } = useParams<{ bookId: string }>();
    const id = Number(bookId);
    const navigate = useNavigate();

    const [book, setBook] = useState<BookMeta | null>(null);
    const [records, setRecords] = useState<BookRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bg, setBg] = useState<string>("beigeDots");
    const loadedRef = useRef(false);

    // 명조/고딕 웹폰트 로드 (이 페이지에서만)
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&family=Noto+Sans+KR:wght@400;500;700&display=swap";
        document.head.appendChild(link);
        return () => { document.head.removeChild(link); };
    }, []);

    // 책 전체 기록을 커서 끝까지 로드
    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        (async () => {
            try {
                setLoading(true);
                const all: BookRecord[] = [];
                let cursor: string | null = null;
                let meta: BookMeta | null = null;
                // 안전장치: 최대 500페이지
                for (let i = 0; i < 500; i++) {
                    const page: BookRecordsPage<BookMeta, BookRecord> = await fetchBookRecords(id, cursor, 30);
                    if (!meta) meta = page.book;
                    all.push(...page.content);
                    if (!page.hasMore || !page.nextCursor) break;
                    cursor = page.nextCursor;
                }
                // 시간순(오름차순) 정렬
                all.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
                setBook(meta);
                setRecords(all);
            } catch (e: any) {
                setError(e?.message ?? "기록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // 기본(베이지·도트)은 .paper 기본값이라 별도 클래스 없음
    const paperClass = useMemo(() => {
        const cls = BG_OPTIONS.find(o => o.key === bg)?.cls;
        return cls && styles[cls] ? styles[cls] : "";
    }, [bg]);

    // 인쇄 캔버스(페이지 전체) 배경 = 선택한 배경 → 마지막 장 빈 공간까지 채워짐
    useEffect(() => {
        const opt = BG_OPTIONS.find(o => o.key === bg);
        const root = document.documentElement;
        root.style.setProperty("--print-bg", opt?.canvasBg ?? "#ffffff");
        root.style.setProperty("--print-dots", opt?.canvasDots ?? "transparent");
        return () => {
            root.style.removeProperty("--print-bg");
            root.style.removeProperty("--print-dots");
        };
    }, [bg]);

    // 인쇄창이 닫히면(저장/취소 공통) 기록 화면으로 조용히 복귀
    const handleSave = () => {
        const onAfterPrint = () => {
            window.removeEventListener("afterprint", onAfterPrint);
            navigate(`/bookRecord/${id}`, { replace: true });
        };
        window.addEventListener("afterprint", onAfterPrint);
        window.print();
    };

    const periodText = useMemo(() => {
        const s = ymd(book?.periodStart);
        const e = ymd(book?.periodEnd);
        if (!s && !e) return "";
        if (s === e) return s;
        return `${s} – ${e}`;
    }, [book]);

    return (
        <div className={styles.screen}>
            {/* 화면 전용 툴바 (인쇄 시 숨김) */}
            <div className={styles.toolbar}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>← 돌아가기</button>
                <div className={styles.bgOptions} role="group" aria-label="배경 선택">
                    {BG_OPTIONS.map(o => (
                        <button
                            key={o.key}
                            className={styles.bgBtn}
                            style={o.sw}
                            data-active={bg === o.key}
                            title={o.label}
                            aria-label={o.label}
                            aria-pressed={bg === o.key}
                            onClick={() => setBg(o.key)}
                        />
                    ))}
                </div>
                <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={loading || !!error}
                >
                    PDF로 저장
                </button>
            </div>

            {loading && <div className={styles.status}>불러오는 중…</div>}
            {error && <div className={styles.status}>{error}</div>}

            {!loading && !error && (
                <article className={`${styles.paper} ${paperClass}`}>
                  {/* thead/tfoot는 인쇄 시 페이지마다 반복 → 모든 페이지에 동일한 상·하단 여백 */}
                  <table className={styles.sheet}>
                    <thead><tr><td className={styles.spacerTop} /></tr></thead>
                    <tbody><tr><td className={styles.sheetCell}>

                    {/* 헤더: 표지 + 책 정보 */}
                    <header className={styles.header}>
                        {book?.coverUrl && (
                            <img className={styles.cover} src={book.coverUrl} alt={`${book?.title ?? ""} 표지`} />
                        )}
                        <div className={styles.headText}>
                            <h1 className={styles.title}>{book?.title ?? "제목 없음"}</h1>
                            {book?.author && <div className={styles.author}>{book.author}</div>}
                            {book?.publisher && <div className={styles.publisher}>{book.publisher}</div>}
                            <div className={styles.meta}>
                                기록 {records.length}개{periodText && ` · ${periodText}`}
                            </div>
                        </div>
                    </header>

                    <hr className={styles.divider} />

                    {/* 기록 목록 (시간순) */}
                    {records.map(r => (
                        <div key={r.id} className={styles.record}>
                            <div className={styles.date}>{ymd(r.recordedAt)}</div>
                            {r.sentence && (
                                <p className={styles.sentence}>{renderSentence(r.sentence, r.highlights ?? [])}</p>
                            )}
                            {r.comment && <p className={styles.comment}>{r.comment}</p>}
                        </div>
                    ))}

                    <div className={styles.footer}>readory</div>

                    </td></tr></tbody>
                    <tfoot><tr><td className={styles.spacerBottom} /></tr></tfoot>
                  </table>
                </article>
            )}
        </div>
    );
}
