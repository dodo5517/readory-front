import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/CreateRecordModal.module.css";
import { createReadingRecord } from "../../api/ReadingRecord";
import { XIcon } from '@phosphor-icons/react';
import { nowDatetimeLocal } from "../../utils/datetime";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
    initialTitle?: string;
    initialAuthor?: string;
}

export default function CreateRecordModal({ open, onClose, onCreated, initialTitle, initialAuthor }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [rawTitle, setRawTitle] = useState("");
    const [rawAuthor, setRawAuthor] = useState("");
    const [sentence, setSentence] = useState("");
    const [comment, setComment] = useState("");
    const [recordedAt, setRecordedAt] = useState(() => nowDatetimeLocal());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const autoResize = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    // 초기화
    useEffect(() => {
        if (!open) return;
        setRawTitle(initialTitle ?? "");
        setRawAuthor(initialAuthor ?? "");
        setSentence("");
        setComment("");
        setRecordedAt(nowDatetimeLocal());
        setError(null);
    }, [open, initialTitle, initialAuthor]);

    if (!open) return null;

    const handleCreateRecord = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);
            await createReadingRecord({
                rawTitle: rawTitle.trim(),
                rawAuthor: rawAuthor.trim(),
                sentence: sentence.trim(),
                comment: comment.trim(),
                recordedAt,
            });
        } catch (e: any) {
            setError(e?.message ?? "기록 생성을 실패했습니다.");
        } finally {
            setSaving(false);
            onCreated();
            onClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    return (
        <div
            className={styles.overlay}
            ref={overlayRef}
            onTouchMove={(e) => e.stopPropagation()}
            onClick={handleOverlayClick}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
        >
            <section className={styles.modal}
                     onTouchStart={(e) => e.stopPropagation()}
            >
                <header className={styles.header}>
                    <h2 className={styles.title}>새 기록 추가</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}><XIcon/></button>
                </header>

                <form className={styles.form} onSubmit={handleCreateRecord}>
                    <div className={styles.grid2}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>제목</span>
                            <input
                                type="text"
                                value={rawTitle}
                                onChange={(e) => setRawTitle(e.target.value)}
                                className={styles.input}
                                placeholder="책 제목"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>작가</span>
                            <input
                                type="text"
                                value={rawAuthor}
                                onChange={(e) => setRawAuthor(e.target.value)}
                                className={styles.input}
                                placeholder="작가"
                            />
                        </label>
                    </div>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>날짜</span>
                        <input
                            type="datetime-local"
                            value={recordedAt}
                            onChange={(e) => setRecordedAt(e.target.value)}
                            className={styles.input}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>문장</span>
                        <textarea
                            className={`${styles.textarea} ${styles.quoteArea}`}
                            placeholder="책에서 인용하고 싶은 문장"
                            value={sentence}
                            onChange={(e) => { setSentence(e.target.value); autoResize(e.target); }}
                            ref={el => { if (el) autoResize(el); }}
                            maxLength={1000}
                        />
                        <div className={styles.counter}>{sentence.length}/1000</div>
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>메모</span>
                        <textarea
                            className={styles.textarea}
                            placeholder="당신의 생각, 느낌을 적어주세요"
                            value={comment}
                            onChange={(e) => { setComment(e.target.value); autoResize(e.target); }}
                            ref={el => { if (el) autoResize(el); }}
                            maxLength={2000}
                        />
                        <div className={styles.counter}>{comment.length}/2000</div>
                    </label>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <footer className={styles.footer}>
                        <div></div>
                        <div className={styles.actionsRight}>
                            <button type="button" className={styles.secondaryBtn} onClick={onClose}>취소</button>
                            <button type="submit" className={styles.primaryBtn} disabled={saving}>
                                {saving ? "저장 중…" : "저장"}
                            </button>
                        </div>
                    </footer>
                </form>
            </section>
        </div>
    );
}
