import React, { useState, useEffect } from "react";
import styles from "../../../styles/AdminModal.module.css";
import recordStyles from "../../../styles/AdminRecordPage.module.css";
import * as adminRecord from "../../../api/AdminRecord";
import {AdminRecordDetailResponse, MatchStatus} from "../../../types/adminRecord";
import RecordEditModal from "./RecordEditModal";
import { XIcon, BooksIcon } from '@phosphor-icons/react';

interface Props {
    isOpen: boolean;
    recordId: number | null;
    onClose: () => void;
    onDeleted?: () => void;
    onUpdated?: () => void;
}

// 매칭 상태 라벨
const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
    PENDING: "대기중",
    RESOLVED_AUTO: "자동 매칭",
    RESOLVED_MANUAL: "수동 매칭",
    NO_CANDIDATE: "후보 없음",
    MULTIPLE_CANDIDATES: "다중 후보"
};

export default function RecordDetailModal({
                                              isOpen,
                                              recordId,
                                              onClose,
                                              onDeleted,
                                              onUpdated,
                                          }: Props) {
    const [record, setRecord] = useState<AdminRecordDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openEdit, setOpenEdit] = useState(false);

    // 기록 상세 조회
    const fetchDetail = async () => {
        if (!recordId) return;

        try {
            setLoading(true);
            setError(null);
            const detail = await adminRecord.getRecord(recordId);
            setRecord(detail);
        } catch (e) {
            setError(e instanceof Error ? e.message : "기록 상세 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && recordId) {
            setRecord(null);
            fetchDetail();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, recordId]);

    // 삭제
    const handleDelete = async () => {
        if (!recordId) return;
        if (!window.confirm("이 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) return;

        try {
            await adminRecord.deleteRecord(recordId);
            alert("삭제되었습니다.");
            onDeleted?.();
            onClose();
        } catch (e) {
            alert(e instanceof Error ? e.message : "삭제 실패");
        }
    };

    // 수정 완료 후
    const handleUpdated = (updated: AdminRecordDetailResponse) => {
        setRecord(updated);
        setOpenEdit(false);
        onUpdated?.();
    };

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    // 날짜/시간 포맷팅
    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // 매칭 상태 클래스
    const getStatusClass = (status: MatchStatus) => {
        switch (status) {
            case "RESOLVED_AUTO":
                return styles.statusMatched;
            case "RESOLVED_MANUAL":
                return styles.statusMatched;
            case "NO_CANDIDATE":
                return styles.statusUnmatched;
            case "PENDING":
                return styles.statusPending;
            case "MULTIPLE_CANDIDATES":
                return styles.statusFailed;
            default:
                return "";
        }
    };

    return (
        <>
            <div className={styles.backdrop} onClick={handleBackdropClick}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>기록 상세</h2>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <XIcon />
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>로딩중...</div>
                    ) : error ? (
                        <div className={styles.loading}>{error}</div>
                    ) : !record ? (
                        <div className={styles.loading}>데이터를 불러올 수 없습니다.</div>
                    ) : (
                        <div className={styles.body}>
                            {/* 상태 헤더 */}
                            <div className={recordStyles.detailHeader}>
                                <span className={recordStyles.detailId}>#{record.id}</span>
                                <span className={`${recordStyles.statusBadgeLg} ${getStatusClass(record.matchStatus)}`}>
                                    {MATCH_STATUS_LABELS[record.matchStatus]}
                                </span>
                            </div>

                            {/* 유저 정보 */}
                            <div className={recordStyles.userSection}>
                                <span className={recordStyles.sectionLabel}>작성자</span>
                                <div className={recordStyles.userInfo}>
                                    <span className={recordStyles.userName}>@{record.username}</span>
                                    <span className={recordStyles.userEmail}>{record.userEmail}</span>
                                    <span className={recordStyles.userId}>ID: {record.userId}</span>
                                </div>
                            </div>

                            {/* 원본 입력 정보 */}
                            <div className={styles.infoGrid}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>원본 제목</span>
                                    <span className={styles.value}>{record.rawTitle}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>원본 저자</span>
                                    <span className={styles.value}>{record.rawAuthor}</span>
                                </div>
                            </div>

                            {/* 매칭된 책 정보 */}
                            {record.bookId && (
                                <div className={recordStyles.matchedBookSection}>
                                    <span className={recordStyles.sectionLabel}>매칭된 책</span>
                                    <div className={recordStyles.matchedBook}>
                                        {record.bookCoverUrl ? (
                                            <img
                                                className={recordStyles.bookCover}
                                                src={record.bookCoverUrl}
                                                alt={record.bookTitle ?? ""}
                                            />
                                        ) : (
                                            <div className={recordStyles.noCover}><BooksIcon /></div>
                                        )}
                                        <div className={recordStyles.matchedBookInfo}>
                                            <span className={recordStyles.matchedBookTitle}>{record.bookTitle}</span>
                                            <span className={recordStyles.matchedBookAuthor}>{record.bookAuthor}</span>
                                            <span className={recordStyles.matchedBookId}>Book ID: {record.bookId}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 기록 내용 */}
                            {record.sentence && (
                                <div className={recordStyles.contentSection}>
                                    <span className={recordStyles.sectionLabel}>문장</span>
                                    <blockquote className={recordStyles.sentenceBlock}>
                                        "{record.sentence}"
                                    </blockquote>
                                </div>
                            )}

                            {record.comment && (
                                <div className={recordStyles.contentSection}>
                                    <span className={recordStyles.sectionLabel}>메모</span>
                                    <p className={recordStyles.commentBlock}>{record.comment}</p>
                                </div>
                            )}

                            {/* 시간 정보 */}
                            <div className={styles.infoGrid}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>기록일</span>
                                    <span className={styles.value}>{formatDateTime(record.recordedAt)}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>수정일</span>
                                    <span className={styles.value}>{formatDateTime(record.updatedAt)}</span>
                                </div>
                                {record.matchedAt && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>매칭일</span>
                                        <span className={styles.value}>{formatDateTime(record.matchedAt)}</span>
                                    </div>
                                )}
                            </div>

                            {/* 액션 버튼 */}
                            <div className={recordStyles.actionSection}>
                                <button className={recordStyles.editBtn} onClick={() => setOpenEdit(true)}>
                                    수정하기
                                </button>
                                <button className={recordStyles.deleteBtn} onClick={handleDelete}>
                                    삭제하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RecordEditModal
                isOpen={openEdit}
                recordId={recordId}
                initialData={record}
                onClose={() => setOpenEdit(false)}
                onUpdated={handleUpdated}
            />
        </>
    );
}