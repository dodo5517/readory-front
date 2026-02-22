import React from "react";
import styles from "../../../styles/AdminModal.module.css";
import bookStyles from "../../../styles/AdminBookPage.module.css";
import {BookDetailResponse} from "../../../types/adminLog";
import { XIcon, TrashIcon , BooksIcon } from '@phosphor-icons/react';

interface Props {
    isOpen: boolean;
    book: BookDetailResponse | null;
    loading: boolean;
    onClose: () => void;
    onSoftDelete: () => void;
    onHardDelete: () => void;
    onRestore: () => void;
}

export default function BookDetailModal({
                                            isOpen,
                                            book,
                                            loading,
                                            onClose,
                                            onSoftDelete,
                                            onHardDelete,
                                            onRestore,
                                        }: Props) {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    // 날짜 포맷팅
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
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

    const isDeleted = book?.deletedAt !== null;

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>책 상세</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <XIcon />
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>로딩중...</div>
                ) : !book ? (
                    <div className={styles.loading}>데이터를 불러올 수 없습니다.</div>
                ) : (
                    <div className={styles.body}>
                        {/* 삭제된 책 표시 */}
                        {isDeleted && (
                            <div className={bookStyles.deletedBanner}>
                                <span className={bookStyles.deletedIcon}><TrashIcon /></span>
                                <span>삭제된 책입니다 ({formatDateTime(book.deletedAt)})</span>
                            </div>
                        )}

                        {/* 책 정보 헤더 */}
                        <div className={bookStyles.detailHeader}>
                            <div className={bookStyles.detailCoverArea}>
                                {book.coverUrl ? (
                                    <img
                                        className={bookStyles.detailCover}
                                        src={book.coverUrl}
                                        alt={book.title}
                                    />
                                ) : (
                                    <div className={bookStyles.detailNoCover}>
                                        <span><BooksIcon /></span>
                                    </div>
                                )}
                            </div>
                            <div className={bookStyles.detailInfo}>
                                <h3 className={bookStyles.detailTitle}>{book.title}</h3>
                                <p className={bookStyles.detailAuthor}>{book.author}</p>
                                <p className={bookStyles.detailPublisher}>{book.publisher}</p>
                            </div>
                        </div>

                        {/* 정보 그리드 */}
                        <div className={styles.infoGrid}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>ID</span>
                                <span className={styles.value}>{book.id}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>ISBN-10</span>
                                <span className={styles.value}>
                                    <code className={bookStyles.isbnCode}>{book.isbn10 ?? "-"}</code>
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>ISBN-13</span>
                                <span className={styles.value}>
                                    <code className={bookStyles.isbnCode}>{book.isbn13 ?? "-"}</code>
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>출판일</span>
                                <span className={styles.value}>{formatDate(book.publishedDate)}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>등록일</span>
                                <span className={styles.value}>{formatDateTime(book.createdAt)}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>수정일</span>
                                <span className={styles.value}>{formatDateTime(book.updatedAt)}</span>
                            </div>
                        </div>

                        {/* 표지 URL */}
                        {book.coverUrl && (
                            <div className={bookStyles.urlSection}>
                                <span className={bookStyles.urlLabel}>표지 URL</span>
                                <div className={bookStyles.urlContent}>
                                    <a
                                        href={book.coverUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={bookStyles.urlLink}
                                    >
                                        {book.coverUrl}
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* 액션 버튼 */}
                        <div className={bookStyles.actionSection}>
                            {isDeleted ? (
                                <>
                                    <button
                                        className={bookStyles.restoreBtn}
                                        onClick={onRestore}
                                    >
                                        복구하기
                                    </button>
                                    <button
                                        className={bookStyles.hardDeleteBtn}
                                        onClick={onHardDelete}
                                    >
                                        영구 삭제
                                    </button>
                                </>
                            ) : (
                                <button
                                    className={bookStyles.softDeleteBtn}
                                    onClick={onSoftDelete}
                                >
                                    삭제하기
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}