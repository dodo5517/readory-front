import React, { useState, useEffect } from "react";
import styles from "../../../styles/AdminModal.module.css";
import * as adminUser from "../../../api/AdminUser";
import {AdminPageUserResponse} from "../../../types/adminUser";
import { XIcon } from '@phosphor-icons/react';

interface Props {
    isOpen: boolean;
    userId: number | null;
    initialUsername: string;
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
}

export default function UpdateUsernameModal({ isOpen, userId, initialUsername, onClose, onSuccess }: Props) {
    const [newUsername, setNewUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setNewUsername(initialUsername);
            setError(null);
        }
    }, [isOpen, initialUsername]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            await adminUser.updateUsername(userId, { newUsername: newUsername.trim() });
            onClose();
            await onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "수정 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modalSmall}>
                <div className={styles.header}>
                    <h2 className={styles.title}>이름 수정</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <XIcon />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>현재 이름</label>
                        <div className={styles.fieldValue}>{initialUsername ?? "-"}</div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="newUsername">
                            새 이름
                        </label>
                        <input
                            id="newUsername"
                            className={styles.input}
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="새 이름 입력"
                            autoFocus
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