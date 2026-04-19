import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminStatsPage.module.css";
import * as adminRecord from "../api/AdminRecord";
import {
    AdminRecordStatsResponse,
    AdminUserActivityResponse,
    AdminBookStatsResponse,
} from "../types/adminRecord";
import { PageResponse } from "../types/books";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BooksIcon } from "@phosphor-icons/react";

export default function AdminStatsPage() {
    const navigate = useNavigate();

    const [stats, setStats] = useState<AdminRecordStatsResponse | null>(null);
    const [bookStats, setBookStats] = useState<AdminBookStatsResponse | null>(null);
    const [activity, setActivity] = useState<PageResponse<AdminUserActivityResponse> | null>(null);
    const [activityPage, setActivityPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const [s, b, a] = await Promise.all([
                adminRecord.getStats(),
                adminRecord.getBookStats(),
                adminRecord.getUserActivity(activityPage),
            ]);
            setStats(s);
            setBookStats(b);
            setActivity(a);
        } catch (e) {
            setError(e instanceof Error ? e.message : "통계 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activityPage]);

    const formatDateTime = (dateStr: string) =>
        new Date(dateStr).toLocaleString("ko-KR", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });

    const goToUserRecords = (userId: number) => navigate(`/admin/records?userId=${userId}`);

    const buildChartData = (
        recordedAtCounts: { date: string; count: number }[],
        createdAtCounts?: { date: string; count: number }[]
    ) => {
        const recordedMap = new Map((recordedAtCounts ?? []).map((d) => [d.date, d.count]));
        const createdMap = new Map((createdAtCounts ?? []).map((d) => [d.date, d.count]));
        const result = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            result.push({
                date: label,
                독서기준: recordedMap.get(key) ?? 0,
                입력기준: createdMap.get(key) ?? 0,
            });
        }
        return result;
    };

    const topBooks = bookStats?.topByRecordCount ?? [];
    const maxCount = topBooks.length > 0 ? Math.max(...topBooks.map((b) => b.recordCount)) : 1;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>관리자 · 통계 대시보드</h1>

                {error && <div className={styles.error}>{error}</div>}
                {loading && <div className={styles.loading}>로딩 중...</div>}

                {stats && (
                    <>
                        {/* 요약 카드 */}
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryCard}>
                                <span className={styles.summaryLabel}>전체 기록</span>
                                <span className={styles.summaryValue}>{(stats.totalRecords ?? 0).toLocaleString()}</span>
                            </div>
                            <div className={styles.summaryCard}>
                                <span className={styles.summaryLabel}>오늘 기록</span>
                                <div className={styles.dualValues}>
                                    <div className={styles.dualEntry}>
                                        <span className={`${styles.dualBadge} ${styles.badgeRecorded}`}>독서 기준</span>
                                        <span className={styles.dualValue}>{(stats.todayRecords ?? 0).toLocaleString()}</span>
                                    </div>
                                    {stats.todayRecordsByCreatedAt !== undefined && (
                                        <div className={styles.dualEntry}>
                                            <span className={`${styles.dualBadge} ${styles.badgeCreated}`}>입력 기준</span>
                                            <span className={styles.dualValue}>{(stats.todayRecordsByCreatedAt ?? 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <span className={styles.summaryLabel}>활성 유저 (7일)</span>
                                <div className={styles.dualValues}>
                                    <div className={styles.dualEntry}>
                                        <span className={`${styles.dualBadge} ${styles.badgeRecorded}`}>독서 기준</span>
                                        <span className={styles.dualValue}>{(stats.activeUsersLast7Days ?? 0).toLocaleString()}</span>
                                    </div>
                                    {stats.activeAppInputUsersLast7Days !== undefined && (
                                        <div className={styles.dualEntry}>
                                            <span className={`${styles.dualBadge} ${styles.badgeCreated}`}>입력 기준</span>
                                            <span className={styles.dualValue}>{(stats.activeAppInputUsersLast7Days ?? 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <span className={styles.summaryLabel}>활성 유저 (30일)</span>
                                <div className={styles.dualValues}>
                                    <div className={styles.dualEntry}>
                                        <span className={`${styles.dualBadge} ${styles.badgeRecorded}`}>독서 기준</span>
                                        <span className={styles.dualValue}>{(stats.activeUsersLast30Days ?? 0).toLocaleString()}</span>
                                    </div>
                                    {stats.activeAppInputUsersLast30Days !== undefined && (
                                        <div className={styles.dualEntry}>
                                            <span className={`${styles.dualBadge} ${styles.badgeCreated}`}>입력 기준</span>
                                            <span className={styles.dualValue}>{(stats.activeAppInputUsersLast30Days ?? 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 최근 30일 꺾은선 그래프 */}
                        <div className={styles.section2}>
                            <h2 className={styles.sectionTitle}>최근 30일 일별 기록 수</h2>
                            <div className={styles.chartWrap}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart
                                        data={buildChartData(stats.dailyCounts ?? [], stats.dailyAppInputCounts)}
                                        margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--main-hr, #eee)" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: "var(--text-muted, #888)" }}
                                            interval={4}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: "var(--text-muted, #888)" }}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "1px solid var(--main-hr, #eee)",
                                                fontSize: "0.85rem",
                                            }}
                                            formatter={(value: number | undefined) => [value ?? 0, ""]}
                                        />
                                        <Legend
                                            wrapperStyle={{ fontSize: "0.82rem", paddingTop: "8px" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="독서기준"
                                            name="독서 기준 (recordedAt)"
                                            stroke="#1976d2"
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                        {stats.dailyAppInputCounts !== undefined && (
                                            <Line
                                                type="monotone"
                                                dataKey="입력기준"
                                                name="입력 기준 (createdAt)"
                                                stroke="#e67e22"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4 }}
                                                strokeDasharray="5 3"
                                            />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 매칭 상태별 집계 */}
                        <div className={styles.section2}>
                            <h2 className={styles.sectionTitle}>매칭 상태별 기록 수</h2>
                            <div className={styles.statusGrid}>
                                <div className={`${styles.statusCard} ${styles.matched}`}>
                                    <span className={styles.statusLabel}>자동 매칭</span>
                                    <span className={styles.statusValue}>{(stats.resolvedAutoCount ?? 0).toLocaleString()}</span>
                                </div>
                                <div className={`${styles.statusCard} ${styles.matched}`}>
                                    <span className={styles.statusLabel}>수동 매칭</span>
                                    <span className={styles.statusValue}>{(stats.resolvedManualCount ?? 0).toLocaleString()}</span>
                                </div>
                                <div className={`${styles.statusCard} ${styles.pending}`}>
                                    <span className={styles.statusLabel}>대기중</span>
                                    <span className={styles.statusValue}>{(stats.pendingCount ?? 0).toLocaleString()}</span>
                                </div>
                                <div className={`${styles.statusCard} ${styles.unmatched}`}>
                                    <span className={styles.statusLabel}>후보 없음</span>
                                    <span className={styles.statusValue}>{(stats.noCandidateCount ?? 0).toLocaleString()}</span>
                                </div>
                                <div className={`${styles.statusCard} ${styles.failed}`}>
                                    <span className={styles.statusLabel}>다중 후보</span>
                                    <span className={styles.statusValue}>{(stats.multipleCandidatesCount ?? 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* 인기 책 Top 10 */}
                {bookStats && (
                    <div className={styles.section2}>
                        <h2 className={styles.sectionTitle}>인기 책 Top 10 · 기록 수 기준</h2>
                        <div className={styles.bookList}>
                            {topBooks.length === 0 ? (
                                <div className={styles.empty}>데이터가 없습니다.</div>
                            ) : (
                                topBooks.map((book, idx) => (
                                    <div key={book.bookId} className={styles.bookRow}>
                                        <span className={styles.bookRank}>{idx + 1}</span>

                                        {book.coverUrl ? (
                                            <img
                                                className={styles.bookCover}
                                                src={book.coverUrl}
                                                alt={book.title}
                                            />
                                        ) : (
                                            <div className={styles.bookCoverEmpty}>
                                                <BooksIcon size={18} />
                                            </div>
                                        )}

                                        <div className={styles.bookMeta}>
                                            <span className={styles.bookTitle}>{book.title}</span>
                                            <span className={styles.bookAuthor}>{book.author}</span>
                                        </div>

                                        <div className={styles.bookBarWrap}>
                                            <div
                                                className={styles.bookBar}
                                                style={{ width: `${Math.round((book.recordCount / maxCount) * 100)}%` }}
                                            />
                                        </div>

                                        <span className={styles.bookCount}>
                                            {book.recordCount.toLocaleString()}건
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* 유저 활동 현황 */}
                <div className={styles.section2}>
                    <h2 className={styles.sectionTitle}>유저 활동 현황</h2>
                    <p className={styles.sectionDesc}>
                        마지막 활동일 기준 정렬. 민원 대응 시 기록 조회 버튼을 클릭하세요.
                    </p>

                    {activity && (
                        <>
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                    <tr>
                                        <th>유저 ID</th>
                                        <th>유저명</th>
                                        <th>이메일</th>
                                        <th>총 기록</th>
                                        <th>마지막 활동</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {activity.content.map((u) => (
                                        <tr key={u.userId}>
                                            <td className={styles.idCell}>{u.userId}</td>
                                            <td>@{u.username}</td>
                                            <td className={styles.emailCell}>{u.userEmail}</td>
                                            <td className={styles.countCell}>{u.totalRecords.toLocaleString()}</td>
                                            <td className={styles.dateCell}>{formatDateTime(u.lastRecordedAt)}</td>
                                            <td>
                                                <button
                                                    className={styles.lookupBtn}
                                                    onClick={() => goToUserRecords(u.userId)}
                                                >
                                                    기록 조회
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    disabled={activityPage <= 0}
                                    onClick={() => setActivityPage((p) => p - 1)}
                                >
                                    이전
                                </button>
                                <span className={styles.pageInfo}>
                                    {activity.number + 1} / {activity.totalPages}
                                </span>
                                <button
                                    className={styles.pageBtn}
                                    disabled={activity.last}
                                    onClick={() => setActivityPage((p) => p + 1)}
                                >
                                    다음
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}