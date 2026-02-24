import React, {useState} from "react";
import styles from "../../../styles/AdminModal.module.css";
import logStyles from "../../../styles/AdminLogPage.module.css";
import {AuthEventType, LogDetailResponse} from "../../../types/adminLog";
import UserDetailModal from "./UserDetailModal";
import { XIcon } from '@phosphor-icons/react';

interface Props {
    isOpen: boolean;
    log: LogDetailResponse | null;
    loading: boolean;
    onClose: () => void;
}

// 이벤트 타입 라벨
const EVENT_TYPE_LABELS: Record<AuthEventType, string> = {
    LOGIN: "로그인",
    LOGIN_FAIL: "로그인 실패",
    LOGOUT_CURRENT_DEVICE: "로그아웃",
    LOGOUT_ALL_DEVICES: "전체 로그아웃",
};

export default function LogDetailModal({ isOpen, log, loading, onClose }: Props) {
    const [openUserDetail, setOpenUserDetail] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    // 시간 포맷팅
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    // UserAgent 파싱
    const parseUserAgent = (ua: string | null) => {
        if (!ua) return "-";

        // 브라우저 감지
        let browser = "Unknown";
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Edg")) browser = "Edge";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";

        // OS 감지
        let os = "Unknown";
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Mac OS")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

        return `${browser} / ${os}`;
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>로그 상세</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <XIcon />
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}></div>
                ) : !log ? (
                    <div className={styles.loading}>데이터를 불러올 수 없습니다.</div>
                ) : (
                    <div className={styles.body}>
                        {/* 상태 헤더 */}
                        <div className={logStyles.detailHeader}>
                            <span className={logStyles.detailId}>#{log.id}</span>
                            <span
                                className={`${logStyles.resultBadgeLg} ${
                                    log.result === "SUCCESS" ? logStyles.success : logStyles.failure
                                }`}
                            >
                                {log.result}
                            </span>
                        </div>

                        {/* 정보 그리드 */}
                        <div className={styles.infoGrid}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>이벤트 타입</span>
                                <span className={styles.value}>
                                    <span className={logStyles.typeBadge}>
                                        {EVENT_TYPE_LABELS[log.eventType] ?? log.eventType}
                                    </span>
                                </span>
                            </div>
                            {log.userId ? (
                                <div
                                    className={styles.infoRowClickable}
                                    onClick={() => {
                                        setSelectedUserId(log?.userId);
                                        setOpenUserDetail(true);
                                    }}
                                >
                                    <span className={styles.label}>유저 ID</span>
                                    <span className={styles.valueClickable}>{log.userId}</span>
                                </div>
                            ) : (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>유저 ID</span>
                                    <span className={styles.value}>-</span>
                                </div>
                            )}
                            <div className={styles.infoRow}>
                                <span className={styles.label}>식별자</span>
                                <span className={styles.value}>
                                    <code className={logStyles.codeBlock}>{log.identifier ?? "-"}</code>
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>IP 주소</span>
                                <span className={styles.value}>
                                    <code className={logStyles.ipCode}>{log.ipAddress ?? "-"}</code>
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>브라우저/OS</span>
                                <span className={styles.value}>{parseUserAgent(log.userAgent)}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>일시</span>
                                <span className={styles.value}>{formatDate(log.createdAt)}</span>
                            </div>
                        </div>

                        {/* 실패 사유 (실패인 경우만) */}
                        {log.result === "FAIL" && log.failResponse && (
                            <div className={logStyles.failSection}>
                                <span className={logStyles.failLabel}>실패 사유</span>
                                <div className={logStyles.failContent}>{log.failResponse}</div>
                            </div>
                        )}

                        {/* UserAgent 전체 */}
                        {log.userAgent && (
                            <div className={logStyles.uaSection}>
                                <span className={logStyles.uaLabel}>User-Agent</span>
                                <div className={logStyles.uaContent}>{log.userAgent}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <UserDetailModal
                isOpen={openUserDetail}
                userId={selectedUserId}
                onClose={() => setOpenUserDetail(false)}
            />
        </div>
    );
}