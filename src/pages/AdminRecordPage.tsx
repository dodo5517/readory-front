import React, { useEffect, useState } from "react";
import styles from "../styles/AdminRecordPage.module.css";
import * as adminRecord from "../api/AdminRecord";
import { useSearchParams } from "react-router-dom";
import RecordDetailModal from "../components/modal/admin/RecordDetailModal";
import {AdminRecordListResponse, MatchStatus} from "../types/adminRecord";
import {PageResponse} from "../types/books";

// 매칭 상태 라벨
const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
    PENDING: "대기중",
    RESOLVED_AUTO: "자동 매칭",
    RESOLVED_MANUAL: "수동 매칭",
    NO_CANDIDATE: "후보 없음",
    MULTIPLE_CANDIDATES: "다중 후보"
};

// 매칭 상태 옵션
const MATCH_STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "상태 전체" },
    { value: "RESOLVED_AUTO", label: "자동 매칭" },
    { value: "RESOLVED_MANUAL", label: "수동 매칭" },
    { value: "PENDING", label: "대기중" },
    { value: "NO_CANDIDATE", label: "후보 없음" },
    { value: "MULTIPLE_CANDIDATES", label: "다중 후보" },
];
export default function AdminRecordsPage() {
    const [sp, setSearchParams] = useSearchParams();

    const [keyword, setKeyword] = useState("");
    const [matchStatus, setMatchStatus] = useState("ALL");
    const [userIdFilter, setUserIdFilter] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState<number>(20);
    const [sort, setSort] = useState<"desc" | "asc">((sp.get("sort") ?? "desc") as "desc" | "asc");

    const [data, setData] = useState<PageResponse<AdminRecordListResponse> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 상세 모달 관련
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
    const [openDetail, setOpenDetail] = useState(false);

    // 기록 목록 조회
    const fetchList = async () => {
        try {
            setLoading(true);
            setError(null);
            const sortParam = `recordedAt,${sort}`;
            const res = await adminRecord.getRecords({
                keyword: keyword.trim() || undefined,
                matchStatus: matchStatus === "ALL" ? undefined : matchStatus,
                userId: userIdFilter ? Number(userIdFilter) : undefined,
                page,
                size,
                sort: sortParam,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "기록 목록 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    // 기록 상세 열기
    const openRecordDetail = (id: number) => {
        setSelectedRecordId(id);
        setOpenDetail(true);
    };

    const closeDetail = () => {
        setOpenDetail(false);
        setSelectedRecordId(null);
    };

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sort, matchStatus]);

    // URL 파라미터 업데이트
    useEffect(() => {
        const params: Record<string, string> = {};
        if (sort !== "desc") params.sort = sort;
        setSearchParams(params, { replace: true });
    }, [sort, setSearchParams]);

    const handleSearch = () => {
        setPage(0);
        fetchList();
    };

    // 시간 포맷팅
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
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

    const totalPages = data?.totalPages ?? 0;
    const records = data?.content ?? [];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>관리자 · 독서 기록 관리</h1>

                <div className={styles.toolbar}>
                    <div className={styles.searchGroup}>
                        <input
                            className={styles.searchInput}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="제목/저자/문장 검색"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                        <button className={styles.searchBtn} onClick={handleSearch}>
                            검색
                        </button>
                    </div>

                    <div className={styles.segment}>
                        <button
                            className={`${styles.segBtn} ${sort === "desc" ? styles.isActive : ""}`}
                            onClick={() => {
                                setSort("desc");
                                setPage(0);
                            }}
                        >
                            최신
                        </button>
                        <button
                            className={`${styles.segBtn} ${sort === "asc" ? styles.isActive : ""}`}
                            onClick={() => {
                                setSort("asc");
                                setPage(0);
                            }}
                        >
                            오래된
                        </button>
                    </div>
                </div>

                <div className={styles.filters}>
                    <select
                        className={styles.select}
                        value={matchStatus}
                        onChange={(e) => {
                            setMatchStatus(e.target.value);
                            setPage(0);
                        }}
                    >
                        {MATCH_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <input
                        className={styles.userIdInput}
                        type="number"
                        value={userIdFilter}
                        onChange={(e) => setUserIdFilter(e.target.value)}
                        placeholder="유저 ID"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                    />
                </div>

                {error ? <div className={styles.error}>{error}</div> : null}

                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.empty}></div>
                    ) : records.length === 0 ? (
                        <div className={styles.empty}>기록이 없습니다.</div>
                    ) : (
                        records.map((record) => (
                            <button
                                key={record.id}
                                className={styles.card}
                                onClick={() => openRecordDetail(record.id)}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardId}>#{record.id}</span>
                                    <span className={`${styles.statusBadge} ${getStatusClass(record.matchStatus)}`}>
                                        {MATCH_STATUS_LABELS[record.matchStatus]}
                                    </span>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.bookInfo}>
                                        <span className={styles.bookTitle}>{record.rawTitle}</span>
                                        <span className={styles.bookAuthor}>{record.rawAuthor}</span>
                                    </div>

                                    {record.sentence && (
                                        <p className={styles.sentence}>"{record.sentence}"</p>
                                    )}
                                </div>

                                <div className={styles.cardFooter}>
                                    <span className={styles.username}>@{record.username}</span>
                                    <span className={styles.date}>{formatDate(record.recordedAt)}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        disabled={page <= 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        이전
                    </button>

                    <span className={styles.pageInfo}>
                        {data ? `${data.number + 1} / ${totalPages}` : "-"}
                    </span>

                    <button
                        className={styles.pageBtn}
                        disabled={data ? data.last : true}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        다음
                    </button>
                </div>

                <RecordDetailModal
                    isOpen={openDetail}
                    recordId={selectedRecordId}
                    onClose={closeDetail}
                    onDeleted={fetchList}
                    onUpdated={fetchList}
                />
            </div>
        </section>
    );
}