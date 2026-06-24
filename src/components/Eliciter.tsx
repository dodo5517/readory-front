import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/Eliciter.module.css';
import { useModalOpen } from '../hook/useModalOpen';
import {
  elicit,
  saveDrawn,
  ElicitClusterInput,
  ElicitTurn,
  DrawnPair,
} from '../api/Reflection';

interface Props {
  bookId: number;
  tone?: string;
  clusters: ElicitClusterInput[];
  onClose: () => void;
}

export default function Eliciter({ bookId, tone, clusters, onClose }: Props) {
  useModalOpen(true);
  const [history, setHistory] = useState<ElicitTurn[]>([]);
  const [drawn, setDrawn] = useState<{ comment: string; theme: string }[]>([]);
  const [pairs, setPairs] = useState<DrawnPair[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  useEffect(() => {
    if (saveMsg) {
      const t = setTimeout(onClose, 2200);
      return () => clearTimeout(t);
    }
  }, [saveMsg, onClose]);

  const startConversation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await elicit({ bookId, tone, clusters, history: [] });
      setHistory([{ role: 'assistant', content: res.reply }]);
      setClosing(res.closing);
      setStarted(true);
    } catch (e: any) {
      setError(e?.message ?? '대화를 시작할 수 없어요.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const lastAssistant = [...history].reverse().find(h => h.role === 'assistant');
    const questionText = lastAssistant?.content ?? '';

    const newHistory: ElicitTurn[] = [...history, { role: 'user', content: text }];
    setHistory(newHistory);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const res = await elicit({ bookId, tone, clusters, history: newHistory });
      setHistory(prev => [...prev, { role: 'assistant', content: res.reply }]);
      setClosing(res.closing);
      if (res.fragment) {
        setDrawn(prev => [...prev, { comment: res.fragment, theme: res.theme }]);
        setPairs(prev => [...prev, { question: questionText, answer: res.fragment }]);
      }
    } catch (e: any) {
      setError(e?.message ?? '응답을 받지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFinish = async () => {
    if (pairs.length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      const count = await saveDrawn(bookId, pairs);
      if (count > 0) {
        setSaveMsg(`${count}개의 감상을 기록에 더했어요.`);
      } else {
        onClose();
      }
    } catch {
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <span className={styles.headerTitle}>
            감상 더 끌어내기
            {drawn.length > 0 && (
              <span className={styles.counter}>끌어난 감상 {drawn.length}개</span>
            )}
          </span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            &#x2715;
          </button>
        </header>

        <div className={styles.chatArea}>
          {!started ? (
            <div className={styles.startWrap}>
              {error && <p className={styles.errorMsg}>{error}</p>}
              {loading ? (
                <p className={styles.thinkingText}>준비하는 중...</p>
              ) : (
                <button className={styles.startBtn} onClick={startConversation}>
                  대화 시작하기
                </button>
              )}
            </div>
          ) : (
            <>
              {history.map((msg, i) => (
                msg.role === 'assistant' ? (
                  <div key={i} className={styles.assistantBlock}>
                    <span className={styles.senderLabel}>결</span>
                    <div className={styles.assistantMsg}>{msg.content}</div>
                  </div>
                ) : (
                  <div key={i} className={styles.userBubble}>
                    <div className={styles.userMsg}>{msg.content}</div>
                  </div>
                )
              ))}
              {loading && (
                <div className={styles.assistantBlock}>
                  <span className={styles.senderLabel}>결</span>
                  <div className={styles.assistantMsg}>
                    <span className={styles.thinkingText}>결이 생각하는 중...</span>
                  </div>
                </div>
              )}
              {error && <p className={styles.errorMsg}>{error}</p>}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {saveMsg ? (
          <div className={styles.saveMsg}>{saveMsg}</div>
        ) : started && (
          closing ? (
            <div className={styles.closingArea}>
              <button
                className={styles.continueBtn}
                onClick={() => setClosing(false)}
                disabled={saving}
              >
                더 얘기하기
              </button>
              <button
                className={styles.finishBtn}
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? '저장 중...' : '정리하고 묶음으로'}
              </button>
            </div>
          ) : (
            <div className={styles.inputArea}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="감상을 적어보세요..."
                rows={3}
                disabled={loading}
              />
              <div className={styles.inputButtons}>
                <button
                  className={styles.quitBtn}
                  onClick={handleFinish}
                  disabled={saving || loading}
                >
                  그만하고 정리하기
                </button>
                <button
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  보내기
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
