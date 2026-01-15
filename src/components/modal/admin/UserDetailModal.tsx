import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "../../../styles/AdminModal.module.css";
import * as adminUserService from "../../../api/AdminUser";
import {AdminPageUserResponse} from "../../../types/adminUser";
import UpdateUsernameModal from "./UpdateUsernameModal";
import UpdatePasswordModal from "./UpdatePasswordModal";


interface Props {
    isOpen: boolean;
    userId: number | null;
    onClose: () => void;
    onRefreshList?: () => Promise<void> | void;
}

export default function UserDetailModal({ isOpen, userId, onClose, onRefreshList = () => {} }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<AdminPageUserResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [openUsername, setOpenUsername] = useState(false);
    const [openPassword, setOpenPassword] = useState(false);

    const fetchUser = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const u = await adminUserService.getUser(userId);
            setUser(u);
        } catch (e) {
            setError(e instanceof Error ? e.message : "유저 조회 실패");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isOpen) {
            setUser(null);
            fetchUser();
        }
    }, [isOpen, fetchUser]);

    if (!isOpen) return null;

    const refreshAll = async () => {
        await fetchUser();
        await onRefreshList();
    };
    // ====== 액션들을 모달 안으로 ======
    const handleLogoutAll = async () => {
        if (!userId) return;
        if (!window.confirm("해당 유저의 모든 기기에서 로그아웃 하시겠습니까?")) return;
        await adminUserService.logoutAllDevices(userId);
        alert("로그아웃 완료");
    };

    const handleReissueApiKey = async () => {
        if (!userId) return;
        if (!window.confirm("API Key를 재발급 하시겠습니까?")) return;
        const res = await adminUserService.reissueApiKey(userId);
        alert(`${res.message}\n${res.maskedApiKey}`);
        await refreshAll();
    };

    const handleGetRawApiKey = async () => {
        if (!userId) return;
        const res = await adminUserService.getRawApiKey(userId);
        alert(`${res.message}\n${res.apiKey}`);
    };

    const handleDeleteUser = async () => {
        if (!userId) return;
        const ok = window.confirm("정말 유저를 삭제할까요? 이 작업은 되돌릴 수 없습니다.");
        if (!ok) return;
        await adminUserService.deleteUser(userId);
        onClose();
        await onRefreshList();
    };

    const handleChangeStatus = async (status: string) => {
        if (!userId) return;
        await adminUserService.changeUserStatus(userId, { status });
        await refreshAll();
    };

    const handleChangeRole = async (role: string) => {
        if (!userId) return;
        await adminUserService.changeUserRole(userId, role);
        await refreshAll();
    };

    const handleUploadProfileImage = async (file: File) => {
        if (!userId) return;
        await adminUserService.uploadProfileImage(userId, file);
        await refreshAll();
    };

    const handleDeleteProfileImage = async () => {
        if (!userId) return;
        if (!window.confirm("프로필 이미지를 삭제하시겠습니까?")) return;
        await adminUserService.deleteProfileImage(userId);
        await refreshAll();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUploadProfileImage(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>유저 상세</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {error && <div className={styles.errorMsg}>{error}</div>}

                {loading || !user ? (
                    <div className={styles.loading}>로딩중...</div>
                ) : (
                    <div className={styles.body}>
                        {/* 프로필 영역 */}
                        <div className={styles.profileSection}>
                            <div className={styles.avatarWrap}>
                                <img
                                    className={styles.avatar}
                                    src={user.profileImageUrl ?? "https://via.placeholder.com/80x80?text=U"}
                                    alt="profile"
                                />
                                <div className={styles.avatarActions}>
                                    <button
                                        className={styles.smallBtn}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        변경
                                    </button>
                                    {user.profileImageUrl && (
                                        <button
                                            className={`${styles.smallBtn} ${styles.dangerText}`}
                                            onClick={handleDeleteProfileImage}
                                        >
                                            삭제
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 정보 그리드 */}
                        <div className={styles.infoGrid}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>ID</span>
                                <span className={styles.value}>{user.id}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>이메일</span>
                                <span className={styles.value}>{user.email}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>이름</span>
                                <span className={styles.value}>
                                    {user.username}
                                    <button className={styles.inlineBtn} onClick={() => setOpenUsername(true)}>
                                        수정
                                    </button>
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>비밀번호</span>
                                <span className={styles.value}>
                                    ********
                                    <button className={styles.inlineBtn} onClick={() => setOpenPassword(true)}>
                                        변경
                                    </button>
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Provider</span>
                                <span className={styles.value}>{user.provider ?? "-"}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>역할</span>
                                <span className={styles.value}>
                                    <select
                                        className={styles.inlineSelect}
                                        value={user.role}
                                        onChange={(e) => handleChangeRole(e.target.value)}
                                    >
                                      <option value="USER">USER</option>
                                      <option value="ADMIN">ADMIN</option>
                                    </select>
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>상태</span>
                                <span className={styles.value}>
                                    <select
                                        className={styles.inlineSelect}
                                        value={user.status ?? "ACTIVE"}
                                        onChange={(e) => handleChangeStatus(e.target.value)}
                                    >
                                      <option value="ACTIVE">ACTIVE</option>
                                      <option value="BLOCKED">BLOCKED</option>
                                      <option value="SUSPENDED">SUSPENDED</option>
                                    </select>
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>API Key</span>
                                <span className={styles.value}>
                                    <code className={styles.apiKeyCode}>{user.maskedApiKey ?? "-"}</code>
                                </span>
                            </div>
                        </div>

                        {/* API Key 액션 */}
                        <div className={styles.actionGroup}>
                            <span className={styles.actionLabel}>API Key 관리</span>
                            <div className={styles.actionBtns}>
                                <button className={styles.actionBtn} onClick={handleGetRawApiKey}>
                                    전체 보기
                                </button>
                                <button className={styles.actionBtn} onClick={handleReissueApiKey}>
                                    재발급
                                </button>
                            </div>
                        </div>

                        {/* 세션 관리 */}
                        <div className={styles.actionGroup}>
                            <span className={styles.actionLabel}>세션 관리</span>
                            <div className={styles.actionBtns}>
                                <button className={styles.actionBtn} onClick={handleLogoutAll}>
                                    전체 기기 로그아웃
                                </button>
                            </div>
                        </div>

                        {/* 위험 영역 */}
                        <div className={styles.dangerZone}>
                            <span className={styles.dangerLabel}>위험 영역</span>
                            <button className={styles.dangerBtn} onClick={handleDeleteUser}>
                                유저 삭제
                            </button>
                        </div>


                        {/* 하위 모달 */}
                        <UpdateUsernameModal
                            isOpen={openUsername}
                            userId={userId}
                            initialUsername={user.username}
                            onClose={() => setOpenUsername(false)}
                            onSuccess={refreshAll}
                        />
                        <UpdatePasswordModal
                            isOpen={openPassword}
                            userId={userId}
                            userLabel={`${user.username} (${user.email})`}
                            onClose={() => setOpenPassword(false)}
                            onSuccess={refreshAll}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}