import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/ReflectionPage.module.css';
import { composeReflection, ReflectionSection } from '../api/Reflection';
import { fetchBookRecords } from '../api/ReadingRecord';
import { BookRecord, BookRecordsPage } from '../types/records';
import { BookMeta } from '../types/books';

type Phase = 'idle' | 'clustering' | 'clustered' | 'outlined' | 'writing' | 'done' | 'error';

const QUOTE_RE = /("[^"]*"|“[^”]*”)/;

function renderBody(body: string): React.ReactNode[] {
  return body.split(QUOTE_RE).map((part, i) => {
    if (!part) return null;
    const isQuote =
      (part.startsWith('"') && part.endsWith('"') && part.length > 1) ||
      (part.startsWith('“') && part.endsWith('”'));
    return isQuote ? (
      <em key={i} className={styles.quoteSpan}>{part}</em>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    );
  });
}

export default function ReflectionPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const id = Number(bookId);
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('idle');
  const [clusterThemes, setClusterThemes] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState('');
  const [sections, setSections] = useState<ReflectionSection[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [recordsOpen, setRecordsOpen] = useState(false);
  const [allRecords, setAllRecords] = useState<BookRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsLoaded, setRecordsLoaded] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const startCompose = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setPhase('clustering');
    setClusterThemes([]);
    setTitle('');
    setTone('');
    setSections([]);
    setErrorMsg(null);

    composeReflection(
      id,
      {
        onClustered: (d) => {
          setClusterThemes(d.clusters.map((c) => c.theme));
          setTone(d.tone);
          setPhase('clustered');
        },
        onOutline: (d) => {
          setTitle(d.title);
          setTone(d.tone);
          setPhase('outlined');
        },
        onSection: (s) => {
          setSections((prev) => [...prev, s]);
          setPhase('writing');
        },
        onDone: () => setPhase('done'),
        onError: (msg) => {
          setErrorMsg(msg);
          setPhase('error');
        },
      },
      ctrl.signal
    );
  }, [id]);

  useEffect(() => {
    startCompose();
    return () => {
      abortRef.current?.abort();
    };
  }, [startCompose]);

  const loadAllRecords = async () => {
    setLoadingRecords(true);
    const collected: BookRecord[] = [];
    try {
      let cursor: string | null = null;
      let keepGoing = true;
      while (keepGoing) {
        const page: BookRecordsPage<BookMeta, BookRecord> = await fetchBookRecords(id, cursor, 100);
        collected.push(...page.content);
        if (page.hasMore && page.nextCursor) {
          cursor = page.nextCursor;
        } else {
          keepGoing = false;
        }
      }
      setAllRecords(collected);
    } catch (e) {}
    finally {
      setLoadingRecords(false);
    }
  };

  const handleToggleRecords = () => {
    const next = !recordsOpen;
    setRecordsOpen(next);
    if (next && !recordsLoaded) {
      setRecordsLoaded(true);
      loadAllRecords();
    }
  };

  const showProgress = phase === 'clustering' || phase === 'clustered';
  const showDraft = phase === 'outlined' || phase === 'writing' || phase === 'done';

  const statusText: Partial<Record<Phase, string>> = {
    clustering: '기록을 읽고 있어요...',
    clustered: `감정의 결 ${clusterThemes.length}개로 묶었어요`,
  };

  return (
    <section className={styles.wrap} aria-label="독후감">
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← 돌아가기
      </button>

      {showProgress && (
        <div className={styles.progress}>
          <p className={styles.statusText}>{statusText[phase]}</p>
          {phase === 'clustered' && clusterThemes.length > 0 && (
            <ul className={styles.themeList}>
              {clusterThemes.map((t, i) => (
                <li key={i} className={styles.themeItem}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showDraft && (
        <div className={styles.draft}>
          <h1 className={styles.draftTitle}>{title}</h1>
          {tone && <p className={styles.draftTone}>{tone}</p>}

          {phase === 'outlined' && (
            <p className={styles.outlineNote}>구성을 잡았어요</p>
          )}

          {sections.length > 0 && (
            <div className={styles.sectionList}>
              {sections.map((s, i) => (
                <div key={i} className={styles.sectionWrap}>
                  <h2 className={styles.sectionHeading}>{s.heading}</h2>
                  <p className={styles.sectionBody}>{renderBody(s.body)}</p>
                </div>
              ))}
            </div>
          )}

          {phase === 'writing' && (
            <p className={styles.writingIndicator}>쓰는 중...</p>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className={styles.accordion}>
          <hr className={styles.divider} />
          <button className={styles.accordionHeader} onClick={handleToggleRecords}>
            내가 남긴 감상 전체 보기
            <span className={styles.chevron}>{recordsOpen ? '▴' : '▾'}</span>
          </button>
          {recordsOpen && (
            <div className={styles.accordionBody}>
              {loadingRecords ? (
                <p className={styles.helper}>불러오는 중...</p>
              ) : allRecords.filter((r) => r.sentence || r.comment).length === 0 ? (
                <p className={styles.helper}>남긴 감상이 없어요.</p>
              ) : (
                allRecords
                  .filter((r) => r.sentence || r.comment)
                  .map((r) => (
                    <div key={r.id} className={styles.record}>
                      {r.sentence && (
                        <blockquote className={styles.recordSentence}>{r.sentence}</blockquote>
                      )}
                      {r.comment && (
                        <p className={styles.recordComment}>{r.comment}</p>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {phase === 'error' && (
        <div className={styles.errorWrap}>
          <p className={styles.errorMsg}>{errorMsg ?? '오류가 발생했습니다.'}</p>
          <button className={styles.retryBtn} onClick={startCompose}>
            다시 시도
          </button>
        </div>
      )}
    </section>
  );
}
