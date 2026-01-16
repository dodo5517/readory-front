import React, { useEffect, useState } from "react";
import styles from "../styles/AdminApiLogPage.module.css";
import * as adminLog from "../api/AdminLog";
import { useSearchParams } from "react-router-dom";
import ApiLogDetailModal from "../components/modal/admin/ApiLogDetailModal";
import {ApiLogDetailResponse, ApiLogListResponse, HttpMethod} from "../types/adminLog";
import {PageResponse} from "../types/books";

// HTTP 메서드 옵션
const METHOD_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "메서드 전체" },
    { value: "GET", label: "GET" },
    { value: "POST", label: "POST" },
    { value: "PUT", label: "PUT" },
    { value: "PATCH", label: "PATCH" },
    { value: "DELETE", label: "DELETE" },
];

// 상태 코드 옵션
const STATUS_CODE_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "상태코드 전체" },
    { value: "200", label: "200 OK" },
    { value: "201", label: "201 Created" },
    { value: "204", label: "204 No Content" },
    { value: "400", label: "400 Bad Request" },
    { value: "401", label: "401 Unauthorized" },
    { value: "403", label: "403 Forbidden" },
    { value: "404", label: "404 Not Found" },
    { value: "500", label: "500 Server Error" },
];

// 메서드별 색상 클래스
const getMethodClass = (method: string): string => {
    switch (method) {
        case "GET": return styles.methodGet;
        case "POST": return styles.methodPost;
        case "PUT": return styles.methodPut;
        case "PATCH": return styles.methodPatch;
        case "DELETE": return styles.methodDelete;
        default: return "";
    }
};

export default function AdminApiLogPage() {
    const [sp, setSearchParams] = useSearchParams();

    const [keyword, setKeyword] = useState("");
    const [result, setResult] = useState("ALL");
    const [statusCode, setStatusCode] = useState("ALL");
    const [method, setMethod] = useState("ALL");
    const [page, setPage] = useState(0);
    const [size] = useState<number>(20);
    const [sort, setSort] = useState<"desc" | "asc">((sp.get("sort") ?? "desc") as "desc" | "asc");

    const [data, setData] = useState<PageResponse<ApiLogListResponse> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 상세 모달 관련
    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
    const [logDetail, setLogDetail] = useState<ApiLogDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);

    // 로그 목록 조회
    const fetchList = async () => {
        try {
            setLoading(true);
            setError(null);
            const sortParam = `createdAt,${sort}`;
            const res = await adminLog.getApiLogs({
                keyword: keyword.trim() || undefined,
                result: result === "ALL" ? undefined : result,
                statusCode: statusCode === "ALL" ? undefined : Number(statusCode),
                method: method === "ALL" ? undefined : method,
                page,
                size,
                sort: sortParam,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "API 로그 조회 실패");
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
            const detail = await adminLog.getApiLogDetail(id);
            setLogDetail(detail);
        } catch (e) {
            setError(e instanceof Error ? e.message : "API 로그 상세 조회 실패");
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
    }, [page, sort, result, statusCode, method]);

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

    // 실행시간 포맷팅
    const formatExecutionTime = (ms: number | null) => {
        if (ms === null) return "-";
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const totalPages = data?.totalPages ?? 0;
    const logs = data?.content ?? [];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>관리자 · API 로그</h1>

                <div className={styles.toolbar}>
                    <div className={styles.searchGroup}>
                        <input
                            className={styles.searchInput}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Path/IP 검색"
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
                        value={method}
                        onChange={(e) => {
                            setMethod(e.target.value);
                            setPage(0);
                        }}
                    >
                        {METHOD_OPTIONS.map((opt) => (
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

                    <select
                        className={styles.select}
                        value={statusCode}
                        onChange={(e) => {
                            setStatusCode(e.target.value);
                            setPage(0);
                        }}
                    >
                        {STATUS_CODE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {error ? <div className={styles.error}>{error}</div> : null}

                {/* 테이블 뷰 (데스크톱) */}
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th className={styles.thId}>ID</th>
                            <th className={styles.thMethod}>메서드</th>
                            <th className={styles.thPath}>Path</th>
                            <th className={styles.thStatus}>상태</th>
                            <th className={styles.thResult}>결과</th>
                            <th className={styles.thTime}>실행시간</th>
                            <th className={styles.thUser}>유저</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className={styles.empty}>
                                    로딩중...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.empty}>
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
                                    <td className={styles.tdMethod}>
                                            <span className={`${styles.methodBadge} ${getMethodClass(log.method)}`}>
                                                {log.method}
                                            </span>
                                    </td>
                                    <td className={styles.tdPath}>
                                        <code className={styles.pathCode}>{log.path}</code>
                                    </td>
                                    <td className={styles.tdStatus}>
                                            <span
                                                className={`${styles.statusBadge} ${
                                                    log.statusCode >= 400 ? styles.statusError : styles.statusOk
                                                }`}
                                            >
                                                {log.statusCode}
                                            </span>
                                    </td>
                                    <td className={styles.tdResult}>
                                            <span
                                                className={`${styles.resultBadge} ${
                                                    log.result === "SUCCESS" ? styles.success : styles.fail
                                                }`}
                                            >
                                                {log.result}
                                            </span>
                                    </td>
                                    <td className={styles.tdTime}>
                                            <span className={styles.timeBadge}>
                                                {formatExecutionTime(log.executionTimeMs)}
                                            </span>
                                    </td>
                                    <td className={styles.tdUser}>
                                        {log.userId ? (
                                            <span className={styles.userInfo}>
                                                    <span className={styles.userId}>{log.userId}</span>
                                                {log.userRole && (
                                                    <span className={styles.userRole}>{log.userRole}</span>
                                                )}
                                                </span>
                                        ) : (
                                            <span className={styles.muted}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 카드 뷰 (모바일) */}
                <div className={styles.cardList}>
                    {loading ? (
                        <div className={styles.emptyCard}>로딩중...</div>
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
                                    <div className={styles.cardHeaderLeft}>
                                        <span className={styles.cardId}>#{log.id}</span>
                                        <span className={`${styles.methodBadge} ${getMethodClass(log.method)}`}>
                                            {log.method}
                                        </span>
                                    </div>
                                    <span
                                        className={`${styles.resultBadge} ${
                                            log.result === "SUCCESS" ? styles.success : styles.fail
                                        }`}
                                    >
                                        {log.result}
                                    </span>
                                </div>
                                <div className={styles.cardPath}>
                                    <code>{log.path}</code>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.cardRow}>
                                        <span className={styles.cardLabel}>상태</span>
                                        <span
                                            className={`${styles.statusBadge} ${
                                                log.statusCode >= 400 ? styles.statusError : styles.statusOk
                                            }`}
                                        >
                                            {log.statusCode}
                                        </span>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <span className={styles.cardLabel}>실행</span>
                                        <span className={styles.timeBadge}>
                                            {formatExecutionTime(log.executionTimeMs)}
                                        </span>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <span className={styles.cardLabel}>유저</span>
                                        <span>
                                            {log.userId ? `${log.userId} (${log.userRole ?? "-"})` : "-"}
                                        </span>
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

                <ApiLogDetailModal
                    isOpen={openDetail}
                    log={logDetail}
                    loading={detailLoading}
                    onClose={closeDetail}
                />
            </div>
        </section>
    );
}