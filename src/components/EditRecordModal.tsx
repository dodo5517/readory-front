import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/EditRecordModal.module.css";
import {UpdateRecord} from "../types/records";
import {fetchUpdateRecord} from "../api/ReadingRecord";

export type RecordEditForm = {
    id: number;
    recordedAt: string;        // ISO
    title?: string;
    author?: string;
    sentence?: string;
    comment?: string;
};

type Props = {
    open: boolean;
    initial: RecordEditForm;
    onSave: (form: RecordEditForm) => Promise<void> | void;
    onClose: () => void;
    onDelete?: (id: number | string) => Promise<void> | void;
};

export default function RecordEditModal({ open, initial, onSave, onClose, onDelete }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const recordId: number = initial.id;
    const date = initial.recordedAt;
    const [record, setRecord] = useState<UpdateRecord>({
        rawTitle: initial.title ?? "",
        rawAuthor: initial.author ?? "",
        sentence: initial.sentence ?? "",
        comment: initial.comment ?? "",
    });
    const [saving, setSaving] = useState(false);

    // 초기화
    useEffect(() => {
        if (!open) return;
        setRecord({
            rawTitle: initial.title ?? "",
            rawAuthor: initial.author ?? "",
            sentence: initial.sentence ?? "",
            comment: initial.comment ?? "",
        });
    }, [open, initial]);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        let ok = false;
        try {
            setSaving(true);
            await fetchUpdateRecord(recordId, record);
            await onSave({
                id: initial.id,
                recordedAt: initial.recordedAt,
                title: record.rawTitle ?? undefined,
                author: record.rawAuthor ?? undefined,
                sentence: record.sentence ?? undefined,
                comment: record.comment ?? undefined,
            });
            ok = true;
        } finally {
            setSaving(false);
            if (ok) onClose();
        }
    };

    return (
        <div
            className={styles.overlay}
            ref={overlayRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
        >
            <section className={styles.modal}>
                <header className={styles.header}>
                    <h2 className={styles.title}>기록 수정</h2>
                    <div className={styles.dateChip} aria-label="기록 시각">{date}</div>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.grid2}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>제목</span>
                            <input
                                type="text"
                                value={record.rawTitle}
                                onChange={(e) => setRecord({...record, rawTitle: e.target.value})}
                                className={styles.input}
                                placeholder="책 제목"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>작가</span>
                            <input
                                type="text"
                                value={record.rawAuthor}
                                onChange={(e) => setRecord({...record, rawAuthor: e.target.value})}
                                className={styles.input}
                                placeholder="작가"
                            />
                        </label>
                    </div>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>문장 <span className={styles.muted}></span></span>
                        <textarea
                            className={`${styles.textarea} ${styles.quoteArea}`}
                            placeholder="책에서 인용하고 싶은 문장"
                            value={record.sentence ?? ""}
                            onChange={(e) => setRecord({...record, sentence: e.target.value})}
                            rows={4}
                            maxLength={1000}
                        />
                        <div className={styles.counter}>{record.sentence?.length}/1000</div>
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>메모 <span className={styles.muted}></span></span>
                        <textarea
                            className={styles.textarea}
                            placeholder="당신의 생각, 느낌을 적어주세요"
                            value={record.comment ?? ""}
                            onChange={(e) => setRecord({...record, comment: e.target.value})}
                            rows={5}
                            maxLength={1000}
                        />
                        <div className={styles.counter}>{record.comment?.length}/2000</div>
                    </label>

                    <footer className={styles.footer}>
                        {initial.id && onDelete && (
                            <button type="button" className={styles.dangerBtn} onClick={() => onDelete(initial.id!)}>삭제</button>
                        )}
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
