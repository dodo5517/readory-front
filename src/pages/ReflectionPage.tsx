import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/ReflectionPage.module.css';
import { clusterReflection, composeReflection, Cluster, ClusterResult, ReflectionSection } from '../api/Reflection';
import { fetchBookRecords } from '../api/ReadingRecord';
import { BookRecord, BookRecordsPage } from '../types/records';
import { BookMeta } from '../types/books';
import Eliciter from '../components/Eliciter';

type Phase = 'idle' | 'clustering' | 'clustered' | 'writing' | 'done' | 'error';

const QUOTE_RE = /("[^"]*"|"[^"]*")/;

function renderBody(body: string): React.ReactNode[] {
  return body.split(QUOTE_RE).map((part, i) => {
    if (!part) return null;
    const isQuote =
      (part.startsWith('"') && part.endsWith('"') && part.length > 1) ||
      (part.startsWith('"') && part.endsWith('"'));
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
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [clusterSections, setClusterSections] = useState<{ heading: string; clusterIndices: number[] }[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState('');
  const [sections, setSections] = useState<ReflectionSection[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [eliciterOpen, setEliciterOpen] = useState(false);

  const [recordsOpen, setRecordsOpen] = useState(false);
  const [allRecords, setAllRecords] = useState<BookRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsLoaded, setRecordsLoaded] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const runCluster = useCallback(async () => {
    setPhase('clustering');
    setClusters([]);
    setClusterSections([]);
    setSelectedIndices(new Set());
    setTitle('');
    setTone('');
    setSections([]);
    setErrorMsg(null);

    try {
      const result: ClusterResult = await clusterReflection(id);
      setClusters(result.clusters);
      setClusterSections(result.sections);
      setTitle(result.title);
      setTone(result.tone);
      setSelectedIndices(
        new Set(result.clusters.map((c, i) => (!c.thin ? i : -1)).filter(i => i >= 0))
      );
      setPhase('clustered');
    } catch (e: any) {
      setErrorMsg(e?.message ?? '묶기에 실패했습니다.');
      setPhase('error');
    }
  }, [id]);

  useEffect(() => {
    runCluster();
  }, [runCluster]);

  const startCompose = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setSections([]);
    setPhase('writing');

    const filteredSections = clusterSections
      .map(sec => ({
        ...sec,
        clusterIndices: sec.clusterIndices.filter(ci => selectedIndices.has(ci)),
      }))
      .filter(sec => sec.clusterIndices.length > 0);

    composeReflection(
      { bookId: id, tone, clusters, sections: filteredSections },
      {
        onSection: (s) => setSections((prev) => [...prev, s]),
        onDone: () => setPhase('done'),
        onError: (msg) => {
          setErrorMsg(msg);
          setPhase('error');
        },
      },
      ctrl.signal
    );
  }, [id, tone, clusters, clusterSections, selectedIndices]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleEliciterClose = () => {
    setEliciterOpen(false);
    runCluster();
  };

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

  const showDraft = phase === 'writing' || phase === 'done';

  return (
    <section className={styles.wrap} aria-label="독후감">
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← 돌아가기
      </button>

      {phase === 'clustering' && (
        <div className={styles.progress}>
          <p className={styles.statusText}>기록을 읽고 있어요...</p>
        </div>
      )}

      {phase === 'clustered' && (
        <div className={styles.progress}>
          <p className={styles.statusText}>
            감정의 결을 골라보세요
            <span className={styles.statusHint}>고른 결만 독후감에 담겨요</span>
          </p>
          <ul className={styles.clusterCheckList}>
            {clusters.map((c, i) => (
              <li key={i} className={styles.clusterCheckItem}>
                <label className={styles.clusterLabel}>
                  <input
                    type="checkbox"
                    checked={selectedIndices.has(i)}
                    onChange={() => {
                      setSelectedIndices(prev => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i); else next.add(i);
                        return next;
                      });
                    }}
                    className={styles.clusterCheckbox}
                  />
                  <span className={styles.clusterTheme}>{c.theme}</span>
                  {c.thin && <span className={styles.thinBadge}>감상이 적어요</span>}
                </label>
                {c.summary && (
                  <p className={styles.clusterSummary}>{c.summary}</p>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.clusteredActions}>
            <button
              className={styles.elicitBtn}
              onClick={() => setEliciterOpen(true)}
            >
              감상 더 끌어내기
            </button>
            <button
              className={styles.composeBtn}
              onClick={startCompose}
              disabled={selectedIndices.size === 0}
            >
              독후감 만들기
            </button>
          </div>
          {selectedIndices.size === 0 && (
            <p className={styles.selectHint}>하나 이상의 결을 골라야 독후감을 만들 수 있어요.</p>
          )}
        </div>
      )}

      {showDraft && (
        <div className={styles.draft}>
          <h1 className={styles.draftTitle}>{title}</h1>
          {tone && <p className={styles.draftTone}>{tone}</p>}

          {sections.length > 0 && (
            <div className={styles.sectionList}>
              {sections.map((s, i) =>
                s.closing === 'true' ? (
                  <div key={i} className={styles.closingSection}>
                    <p className={styles.sectionBody}>{renderBody(s.body)}</p>
                  </div>
                ) : (
                  <div key={i} className={styles.sectionWrap}>
                    <h2 className={styles.sectionHeading}>{s.heading}</h2>
                    <p className={styles.sectionBody}>{renderBody(s.body)}</p>
                  </div>
                )
              )}
            </div>
          )}

          {phase === 'writing' && (
            <p className={styles.writingIndicator}>쓰는 중...</p>
          )}
        </div>
      )}

      {phase === 'done' && clusters.length > 0 && (
        <div className={styles.elicitRow}>
          <button
            className={styles.elicitBtn}
            onClick={() => setEliciterOpen(true)}
          >
            감상 더 끌어내기
          </button>
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
          <button className={styles.retryBtn} onClick={runCluster}>
            다시 시도
          </button>
        </div>
      )}

      {eliciterOpen && (
        <Eliciter
          bookId={id}
          tone={tone}
          clusters={clusters.map(({ theme, summary, thin }) => ({ theme, summary, thin }))}
          onClose={handleEliciterClose}
        />
      )}
    </section>
  );
}
