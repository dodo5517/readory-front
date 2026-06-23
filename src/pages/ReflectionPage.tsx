import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/ReflectionPage.module.css';
import {
  clusterReflection, composeReflection, saveReflection, getSavedReflection, deleteReflection,
  Cluster, ClusterResult, ReflectionSection, SavedReflection,
} from '../api/Reflection';
import { fetchBookRecords } from '../api/ReadingRecord';
import { BookRecord, BookRecordsPage } from '../types/records';
import { BookMeta } from '../types/books';
import Eliciter from '../components/Eliciter';

type Phase =
  | 'loading'
  | 'clustering'
  | 'clustered'
  | 'writing'
  | 'saving'
  | 'saved'
  | 'editing'
  | 'error';

const QUOTE_RE = /("[^"]*"|"[^"]*")/;

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

function buildMarkdown(sections: ReflectionSection[]): string {
  return sections
    .map(s => {
      if (s.closing === 'true') return `## 맺음말\n\n${s.body}`;
      return `## ${s.heading}\n\n${s.body}`;
    })
    .join('\n\n');
}

function extractToc(md: string): { id: string; text: string }[] {
  let i = 0;
  return md
    .split('\n')
    .filter(l => /^##\s+/.test(l))
    .map(l => ({ id: `section-${i++}`, text: l.replace(/^##\s+/, '').trim() }));
}

function createMarkdownComponents() {
  let idx = 0;
  return {
    h2: ({ children }: any) => {
      const id = `section-${idx++}`;
      return <h2 id={id} className={styles.mdH2}>{children}</h2>;
    },
    p: ({ children }: any) => <p className={styles.mdP}>{children}</p>,
    blockquote: ({ children }: any) => <blockquote className={styles.mdBlockquote}>{children}</blockquote>,
    hr: () => <hr className={styles.mdHr} />,
  };
}

export default function ReflectionPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const id = Number(bookId);
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('loading');
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [clusterSections, setClusterSections] = useState<{ heading: string; clusterIndices: number[] }[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState('');
  const [sections, setSections] = useState<ReflectionSection[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [eliciterOpen, setEliciterOpen] = useState(false);

  const [savedReflection, setSavedReflection] = useState<SavedReflection | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [remaking, setRemaking] = useState(false);

  const [recordsOpen, setRecordsOpen] = useState(false);
  const [allRecords, setAllRecords] = useState<BookRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsLoaded, setRecordsLoaded] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const sectionsRef = useRef<ReflectionSection[]>([]);
  const composeTitleRef = useRef('');

  const runCluster = useCallback(async () => {
    setPhase('clustering');
    setClusters([]);
    setClusterSections([]);
    setSelectedIndices(new Set());
    setTitle('');
    setTone('');
    setSections([]);
    sectionsRef.current = [];
    setErrorMsg(null);

    try {
      const result: ClusterResult = await clusterReflection(id);
      setClusters(result.clusters);
      setClusterSections(result.sections);
      setTitle(result.title);
      setTone(result.tone);
      composeTitleRef.current = result.title;
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
    let cancelled = false;
    getSavedReflection(id)
      .then(saved => {
        if (cancelled) return;
        if (saved) {
          setSavedReflection(saved);
          setPhase('saved');
        } else {
          runCluster();
        }
      })
      .catch(() => {
        if (!cancelled) runCluster();
      });
    return () => { cancelled = true; };
  }, [id, runCluster]);

  const startCompose = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setSections([]);
    sectionsRef.current = [];
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
        onSection: (s) => {
          setSections(prev => {
            const next = [...prev, s];
            sectionsRef.current = next;
            return next;
          });
        },
        onDone: async () => {
          const md = buildMarkdown(sectionsRef.current);
          const saveTitle = composeTitleRef.current;
          setPhase('saving');
          try {
            const saved = await saveReflection(id, saveTitle, md);
            setSavedReflection(saved);
            setPhase('saved');
          } catch (e: any) {
            setErrorMsg(e?.message ?? '저장에 실패했습니다.');
            setPhase('error');
          }
        },
        onError: (msg) => {
          setErrorMsg(msg);
          setPhase('error');
        },
      },
      ctrl.signal
    );
  }, [id, tone, clusters, clusterSections, selectedIndices]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
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
    } catch {}
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

  const handleEdit = () => {
    if (!savedReflection) return;
    setEditTitle(savedReflection.title);
    setEditContent(savedReflection.content);
    setPhase('editing');
  };

  const handleEditSave = async () => {
    if (editSaving) return;
    setEditSaving(true);
    try {
      const saved = await saveReflection(id, editTitle.trim(), editContent.trim());
      setSavedReflection(saved);
      setPhase('saved');
    } catch (e: any) {
      alert(e?.message ?? '저장에 실패했습니다.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemake = async () => {
    if (!window.confirm('독후감을 삭제하고 처음부터 다시 만들까요?')) return;
    setRemaking(true);
    try {
      await deleteReflection(id);
      setSavedReflection(null);
      runCluster();
    } catch (e: any) {
      alert(e?.message ?? '삭제에 실패했습니다.');
    } finally {
      setRemaking(false);
    }
  };

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toc = savedReflection ? extractToc(savedReflection.content) : [];
  const showDraft = phase === 'writing' || phase === 'saving';

  return (
    <section className={styles.wrap} aria-label="독후감">
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← 돌아가기
      </button>

      {(phase === 'loading' || phase === 'clustering') && (
        <div className={styles.progress}>
          <p className={styles.statusText}>
            {phase === 'loading' ? '불러오는 중...' : '기록을 읽고 있어요...'}
          </p>
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
            <button className={styles.elicitBtn} onClick={() => setEliciterOpen(true)}>
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
          <p className={styles.writingIndicator}>
            {phase === 'saving' ? '저장 중...' : '쓰는 중...'}
          </p>
        </div>
      )}

      {phase === 'saved' && savedReflection && (
        <div className={styles.savedView}>
          <div className={styles.savedActions}>
            <button
              className={styles.remakeBtn}
              onClick={handleRemake}
              disabled={remaking}
            >
              {remaking ? '삭제 중...' : '다시 만들기'}
            </button>
            <button className={styles.editBtn} onClick={handleEdit}>
              수정
            </button>
          </div>

          <h1 className={styles.savedTitle}>{savedReflection.title}</h1>

          {toc.length > 0 && (
            <nav className={styles.toc} aria-label="목차">
              {toc.map(item => (
                <button
                  key={item.id}
                  className={styles.tocItem}
                  onClick={() => scrollTo(item.id)}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          )}

          <div className={styles.markdownContent}>
            <ReactMarkdown components={createMarkdownComponents()}>
              {savedReflection.content}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {phase === 'editing' && (
        <div className={styles.editWrap}>
          <div className={styles.editActions}>
            <button
              className={styles.editCancelBtn}
              onClick={() => setPhase('saved')}
              disabled={editSaving}
            >
              취소
            </button>
            <button
              className={styles.editSaveBtn}
              onClick={handleEditSave}
              disabled={editSaving || !editTitle.trim() || !editContent.trim()}
            >
              {editSaving ? '저장 중...' : '저장'}
            </button>
          </div>

          <input
            className={styles.editTitleInput}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="제목"
          />

          <textarea
            className={styles.editContentArea}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder={`## 소제목\n\n본문...`}
            spellCheck={false}
          />
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
