import React, { useState, useEffect } from "react";
import styles from "../../../styles/AdminModal.module.css";
import * as adminUser from "../../../api/AdminUser";
import {AdminPageUserResponse} from "../../../types/adminUser";

interface Props {
    isOpen: boolean;
    userId: number | null;
    userLabel: string;
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
}

export default function UpdatePasswordModal({ isOpen, userId, userLabel, onClose, onSuccess }: Props) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword.trim()) {
            setError("새 비밀번호를 입력해주세요.");
            return;
        }

        if (newPassword.length < 8) {
            setError("비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            await adminUser.updatePassword(userId, { newPassword });
            alert("비밀번호가 변경되었습니다.");
            onClose();
            await onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "변경 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setNewPassword("");
            setConfirmPassword("");
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modalSmall}>
                <div className={styles.header}>
                    <h2 className={styles.title}>비밀번호 변경</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>대상 유저</label>
                        <div className={styles.fieldValue}>
                            {userLabel ?? "-"}
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="newPassword">
                            새 비밀번호 (8자 이상)
                        </label>
                        <input
                            id="newPassword"
                            className={styles.input}
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호 입력"
                            autoFocus
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="confirmPassword">
                            비밀번호 확인
                        </label>
                        <input
                            id="confirmPassword"
                            className={styles.input}
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                        />
                    </div>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <div className={styles.infoText}>
                        ⚠️ 관리자 권한으로 비밀번호를 직접 변경합니다.
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            취소
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "변경중..." : "변경"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}