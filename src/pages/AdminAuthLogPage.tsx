import React, { useEffect, useState } from "react";
import styles from "../styles/AdminLogPage.module.css";
import * as adminLog from "../api/AdminLog";
import { useSearchParams } from "react-router-dom";
import LogDetailModal from "../components/modal/admin/LogDetailModal";
import {AuthEventType, LogDetailResponse, LogListResponse} from "../types/adminLog";
import {PageResponse} from "../types/books";

// 이벤트 타입 라벨
const EVENT_TYPE_LABELS: Record<AuthEventType, string> = {
    LOGIN: "로그인",
    LOGIN_FAIL: "로그인 실패",
    LOGOUT_CURRENT_DEVICE: "로그아웃",
    LOGOUT_ALL_DEVICES: "전체 로그아웃",
};

// 이벤트 타입 옵션
const EVENT_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "타입 전체" },
    { value: "LOGIN", label: "로그인" },
    { value: "LOGIN_FAIL", label: "로그인 실패" },
    { value: "LOGOUT_CURRENT_DEVICE", label: "로그아웃" },
    { value: "LOGOUT_ALL_DEVICES", label: "전체 로그아웃" },
];

export default function AdminLogsPage() {
    const [sp, setSearchParams] = useSearchParams();

    const [keyword, setKeyword] = useState("");
    const [type, setType] = useState("ALL");
    const [result, setResult] = useState("ALL");
    const [page, setPage] = useState(0);
    const [size] = useState<number>(20);
    const [sort, setSort] = useState<"desc" | "asc">((sp.get("sort") ?? "desc") as "desc" | "asc");

    const [data, setData] = useState<PageResponse<LogListResponse> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 상세 모달 관련
    const [, setSelectedLogId] = useState<number | null>(null);
    const [logDetail, setLogDetail] = useState<LogDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);

    // 로그 목록 조회
    const fetchList = async () => {
        try {
            setLoading(true);
            setError(null);
            const sortParam = `createdAt,${sort}`;
            const res = await adminLog.getLogs({
                keyword: keyword.trim() || undefined,
                type: type === "ALL" ? undefined : type,
                result: result === "ALL" ? undefined : result,
                page,
                size,
                sort: sortParam,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "로그 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    // 로그 상세 조회
    const openLogDetail = async (id: number) => {
        try {
            setSelectedLogId(id);
            setOpenDetail(true);
            setLogDetail(null);
            setDetailLoading(true);
            const detail = await adminLog.getLogDetail(id);
            setLogDetail(detail);
        } catch (e) {
            setError(e instanceof Error ? e.message : "로그 상세 조회 실패");
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setOpenDetail(false);
        setSelectedLogId(null);
        setLogDetail(null);
    };

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sort, type, result]);

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
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const totalPages = data?.totalPages ?? 0;
    const logs = data?.content ?? [];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>관리자 · 인증 로그</h1>

                <div className={styles.toolbar}>
                    <div className={styles.searchGroup}>
                        <input
                            className={styles.searchInput}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="IP/식별자 검색"
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
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            setPage(0);
                        }}
                    >
                        {EVENT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className={styles.select}
                        value={result}
                        onChange={(e) => {
                            setResult(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="ALL">결과 전체</option>
                        <option value="SUCCESS">SUCCESS</option>
                        <option value="FAIL">FAIL</option>
                    </select>
                </div>

                {error ? <div className={styles.error}>{error}</div> : null}

                {/* 테이블 뷰 (데스크톱) */}
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th className={styles.thId}>ID</th>
                            <th className={styles.thUser}>유저</th>
                            <th className={styles.thType}>타입</th>
                            <th className={styles.thResult}>결과</th>
                            <th className={styles.thIp}>IP</th>
                            <th className={styles.thDate}>일시</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className={styles.empty}>
                                    {/*로딩중...*/}
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.empty}>
                                    로그가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr
                                    key={log.id}
                                    className={styles.row}
                                    onClick={() => openLogDetail(log.id)}
                                >
                                    <td className={styles.tdId}>{log.id}</td>
                                    <td className={styles.tdUser}>
                                        {log.userId ?? <span className={styles.muted}>-</span>}
                                    </td>
                                    <td className={styles.tdType}>
                                            <span className={styles.typeBadge}>
                                                {EVENT_TYPE_LABELS[log.eventType] ?? log.eventType}
                                            </span>
                                    </td>
                                    <td className={styles.tdResult}>
                                            <span
                                                className={`${styles.resultBadge} ${
                                                    log.result === "SUCCESS"
                                                        ? styles.success
                                                        : styles.failure
                                                }`}
                                            >
                                                {log.result}
                                            </span>
                                    </td>
                                    <td className={styles.tdIp}>
                                        <code className={styles.ipCode}>{log.ipAddress ?? "-"}</code>
                                    </td>
                                    <td className={styles.tdDate}>{formatDate(log.createdAt)}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 카드 뷰 (모바일) */}
                <div className={styles.cardList}>
                    {loading ? (
                        <div className={styles.emptyCard}></div>
                    ) : logs.length === 0 ? (
                        <div className={styles.emptyCard}>로그가 없습니다.</div>
                    ) : (
                        logs.map((log) => (
                            <button
                                key={log.id}
                                className={styles.card}
                                onClick={() => openLogDetail(log.id)}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardId}>#{log.id}</span>
                                    <span
                                        className={`${styles.resultBadge} ${
                                            log.result === "SUCCESS" ? styles.success : styles.failure
                                        }`}
                                    >
                                        {log.result}
                                    </span>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.cardRow}>
                                        <span className={styles.cardLabel}>타입</span>
                                        <span className={styles.typeBadge}>
                                            {EVENT_TYPE_LABELS[log.eventType] ?? log.eventType}
                                        </span>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <span className={styles.cardLabel}>유저</span>
                                        <span>{log.userId ?? "-"}</span>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <span className={styles.cardLabel}>IP</span>
                                        <code className={styles.ipCode}>{log.ipAddress ?? "-"}</code>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <span className={styles.cardLabel}>일시</span>
                                        <span className={styles.muted}>{formatDate(log.createdAt)}</span>
                                    </div>
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

                <LogDetailModal
                    isOpen={openDetail}
                    log={logDetail}
                    loading={detailLoading}
                    onClose={closeDetail}
                />
            </div>
        </section>
    );
}