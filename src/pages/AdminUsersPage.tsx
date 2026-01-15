import React, { useEffect, useState } from "react";
import styles from "../styles/AdminUsersPage.module.css";
import * as adminUser from "../api/AdminUser";
import {PageResponse} from "../types/books";
import {AdminPageUserResponse} from "../types/adminUser";
import {useSearchParams} from "react-router-dom";
import UserDetailModal from "../components/modal/admin/UserDetailModal";

export default function AdminUsersPage() {
    const [sp, setSearchParams] = useSearchParams();

    const [keyword, setKeyword] = useState("");
    const [provider, setProvider] = useState("ALL");
    const [role, setRole] = useState("ALL");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState<number>();
    const [sort, setSort]   = useState<"asc"|"desc">((sp.get("sort") ?? "desc") as "asc"|"desc");

    const [data, setData] = useState<PageResponse<AdminPageUserResponse> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [openDetail, setOpenDetail] = useState(false);

    // 유저 목록 조회
    const fetchList = async () => {
        try {
            setLoading(true);
            setError(null);
            const sortParam = `createdAt,${sort}`;
            const res = await adminUser.getUsers({
                keyword: keyword.trim() || undefined,
                provider: provider === "ALL" ? undefined : provider,
                role: role === "ALL" ? undefined : role,
                page,
                size,
                sort: sortParam,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "목록 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sort, provider, role]);

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

    const totalPages = data?.totalPages ?? 0;
    const users = data?.content ?? [];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>관리자 · 유저 관리</h1>

                <div className={styles.toolbar}>
                    <div className={styles.searchGroup}>
                        <input
                            className={styles.searchInput}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="이메일/이름/ID 검색"
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
                    <select className={styles.select} value={provider} onChange={(e) => { setProvider(e.target.value); setPage(0); }}>
                        <option value="">Provider 전체</option>
                        <option value="local">LOCAL</option>
                        <option value="google">GOOGLE</option>
                        <option value="naver">NAVER</option>
                        <option value="kakao">KAKAO</option>
                    </select>

                    <select className={styles.select} value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }}>
                        <option value="">Role 전체</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>

                {error ? <div className={styles.error}>{error}</div> : null}

                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.empty}>로딩중...</div>
                    ) : users.length === 0 ? (
                        <div className={styles.empty}>유저가 없습니다.</div>
                    ) : (
                        users.map((u) => (
                            <button
                                key={u.id}
                                className={styles.card}
                                onClick={() => {
                                    setSelectedId(u.id);
                                    setOpenDetail(true);
                                }}
                            >
                                <div className={styles.avatarArea}>
                                    <img
                                        className={styles.avatar}
                                        src={u.profileImageUrl ?? "https://via.placeholder.com/56x56?text=U"}
                                        alt="profile"
                                    />
                                </div>

                                <div className={styles.meta}>
                                    <div className={styles.topRow}>
                                        <strong className={styles.username}>{u.username}</strong>
                                        <span className={styles.badge}>{u.role}</span>
                                    </div>
                                    <div className={styles.email}>{u.email}</div>
                                    <div className={styles.subRow}>
                                        <span className={styles.muted}>ID: {u.id}</span>
                                        <span className={styles.dot}>·</span>
                                        <span className={styles.muted}>Provider: {u.provider ?? "-"}</span>
                                        <span className={styles.dot}>·</span>
                                        <span className={styles.muted}>Status: {u.status ?? "-"}</span>
                                    </div>
                                </div>

                                <div className={styles.apiKeyCol}>
                                    <div className={styles.apiKeyLabel}>API Key</div>
                                    <div className={styles.apiKeyValue}>{u.maskedApiKey ?? "-"}</div>
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

                <UserDetailModal
                    isOpen={openDetail}
                    userId={selectedId}
                    onClose={() => setOpenDetail(false)}
                    onRefreshList={fetchList}
                />
            </div>
        </section>
    );
}
