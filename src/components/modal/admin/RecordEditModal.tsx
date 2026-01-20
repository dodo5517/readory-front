import React, { useState, useEffect } from "react";
import styles from "../../../styles/AdminModal.module.css";
import recordStyles from "../../../styles/AdminRecordPage.module.css";
import {AdminRecordDetailResponse} from "../../../types/adminRecord";

interface Props {
    isOpen: boolean;
    record: AdminRecordDetailResponse | null;
    onClose: () => void;
    onSubmit: (data: {
        rawTitle: string;
        rawAuthor: string;
        sentence: string;
        comment: string;
    }) => Promise<void>;
}

export default function RecordEditModal({ isOpen, record, onClose, onSubmit }: Props) {
    const [rawTitle, setRawTitle] = useState("");
    const [rawAuthor, setRawAuthor] = useState("");
    const [sentence, setSentence] = useState("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && record) {
            setRawTitle(record.rawTitle ?? "");
            setRawAuthor(record.rawAuthor ?? "");
            setSentence(record.sentence ?? "");
            setComment(record.comment ?? "");
            setError(null);
        }
    }, [isOpen, record]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rawTitle.trim()) {
            setError("제목을 입력해주세요.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await onSubmit({
                rawTitle: rawTitle.trim(),
                rawAuthor: rawAuthor.trim(),
                sentence: sentence.trim(),
                comment: comment.trim(),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "수정 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>기록 수정</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>제목 (rawTitle)</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={rawTitle}
                            onChange={(e) => setRawTitle(e.target.value)}
                            placeholder="책 제목"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>저자 (rawAuthor)</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={rawAuthor}
                            onChange={(e) => setRawAuthor(e.target.value)}
                            placeholder="저자명"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>문장 (sentence)</label>
                        <textarea
                            className={recordStyles.textarea}
                            value={sentence}
                            onChange={(e) => setSentence(e.target.value)}
                            placeholder="기록할 문장"
                            rows={4}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>메모 (comment)</label>
                        <textarea
                            className={recordStyles.textarea}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="메모 (선택사항)"
                            rows={3}
                        />
                    </div>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            취소
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "저장중..." : "저장"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}