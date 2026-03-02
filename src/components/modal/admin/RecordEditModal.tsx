import React, { useState, useEffect } from "react";
import styles from "../../../styles/AdminModal.module.css";
import * as adminRecord from "../../../api/AdminRecord";
import {AdminRecordDetailResponse} from "../../../types/adminRecord";
import { XIcon } from '@phosphor-icons/react';

interface Props {
    isOpen: boolean;
    recordId: number | null;
    initialData: AdminRecordDetailResponse | null;
    onClose: () => void;
    onUpdated: (updated: AdminRecordDetailResponse) => void;
}

export default function RecordEditModal({
                                            isOpen,
                                            recordId,
                                            initialData,
                                            onClose,
                                            onUpdated,
                                        }: Props) {
    const [rawTitle, setRawTitle] = useState("");
    const [rawAuthor, setRawAuthor] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setRawTitle(initialData.rawTitle ?? "");
            setRawAuthor(initialData.rawAuthor ?? "");
            setError(null);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recordId) return;

        if (!rawTitle.trim()) {
            setError("제목을 입력해주세요.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const updated = await adminRecord.updateRecord(recordId, {
                rawTitle: rawTitle.trim(),
                rawAuthor: rawAuthor.trim(),
            });

            onUpdated(updated);
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
                        <XIcon />
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