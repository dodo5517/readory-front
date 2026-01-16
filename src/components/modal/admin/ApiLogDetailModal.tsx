import React, {useState} from "react";
import styles from "../../../styles/AdminModal.module.css";
import logStyles from "../../../styles/AdminApiLogPage.module.css";
import {ApiLogDetailResponse} from "../../../types/adminLog";
import UserDetailModal from "./UserDetailModal";

interface Props {
    isOpen: boolean;
    log: ApiLogDetailResponse | null;
    loading: boolean;
    onClose: () => void;
}

// 메서드별 색상 클래스
const getMethodClass = (method: string): string => {
    switch (method) {
        case "GET": return logStyles.methodGet;
        case "POST": return logStyles.methodPost;
        case "PUT": return logStyles.methodPut;
        case "PATCH": return logStyles.methodPatch;
        case "DELETE": return logStyles.methodDelete;
        default: return "";
    }
};

export default function ApiLogDetailModal({ isOpen, log, loading, onClose }: Props) {
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

    // 실행시간 포맷팅
    const formatExecutionTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    // UserAgent 파싱
    const parseUserAgent = (ua: string | null) => {
        if (!ua) return "-";

        let browser = "Unknown";
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Edg")) browser = "Edge";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";

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
                    <h2 className={styles.title}>API 로그 상세</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>로딩중...</div>
                ) : !log ? (
                    <div className={styles.loading}>데이터를 불러올 수 없습니다.</div>
                ) : (
                    <div className={styles.body}>
                        {/* 상태 헤더 */}
                        <div className={logStyles.detailHeader}>
                            <div className={logStyles.detailHeaderLeft}>
                                <span className={logStyles.detailId}>#{log.id}</span>
                                <span className={`${logStyles.methodBadgeLg} ${getMethodClass(log.method)}`}>
                                    {log.method}
                                </span>
                                <span
                                    className={`${logStyles.statusBadgeLg} ${
                                        log.statusCode >= 400 ? logStyles.statusError : logStyles.statusOk
                                    }`}
                                >
                                    {log.statusCode}
                                </span>
                            </div>
                            <span
                                className={`${logStyles.resultBadgeLg} ${
                                    log.result === "SUCCESS" ? logStyles.success : logStyles.failure
                                }`}
                            >
                                {log.result}
                            </span>
                        </div>

                        {/* Path 표시 */}
                        <div className={logStyles.pathSection}>
                            <code className={logStyles.pathFullCode}>{log.path}</code>
                        </div>

                        {/* 정보 그리드 */}
                        <div className={styles.infoGrid}>
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
                                <span className={styles.label}>유저 역할</span>
                                <span className={styles.value}>
                                    {log.userRole ? (
                                        <span className={logStyles.roleBadge}>{log.userRole}</span>
                                    ) : "-"}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>실행 시간</span>
                                <span className={styles.value}>
                                    <span className={logStyles.timeBadge}>
                                        {formatExecutionTime(log.executionTimeMs)}
                                    </span>
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

                        {/* Query String */}
                        {log.queryString && (
                            <div className={logStyles.codeSection}>
                                <span className={logStyles.codeSectionLabel}>Query String</span>
                                <div className={logStyles.codeContent}>
                                    <code>{log.queryString}</code>
                                </div>
                            </div>
                        )}

                        {/* 에러 정보 (실패인 경우만) */}
                        {log.result === "FAIL" && (log.errorCode || log.errorMessage) && (
                            <div className={logStyles.errorSection}>
                                <span className={logStyles.errorLabel}>에러 정보</span>
                                {log.errorCode && (
                                    <div className={logStyles.errorCodeRow}>
                                        <span className={logStyles.errorCodeLabel}>코드:</span>
                                        <code className={logStyles.errorCode}>{log.errorCode}</code>
                                    </div>
                                )}
                                {log.errorMessage && (
                                    <div className={logStyles.errorContent}>{log.errorMessage}</div>
                                )}
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