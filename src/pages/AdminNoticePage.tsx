import React, { useEffect, useState } from "react";
import { BellIcon } from "@phosphor-icons/react";
import * as noticeApi from "../api/Notice";
import styles from "../styles/AdminNoticePage.module.css";
import {NoticeResponse} from "../types/notice";

export default function AdminNoticePage() {
    const [history, setHistory] = useState<NoticeResponse[]>([]);
    const [message, setMessage] = useState("");
    const [enabled, setEnabled] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const list = await noticeApi.getAllNotices();
            setHistory(list);
            // 활성 공지가 있으면 편집 폼에 로드
            const active = list.find(n => n.enabled);
            if (active) {
                setEditingId(active.id);
                setMessage(active.message);
                setEnabled(active.enabled);
            }
        } catch {
            // 이력 없으면 빈 상태
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleSave = async () => {
        if (!editingId) return;
        setSaving(true);
        try {
            await noticeApi.updateNotice(editingId, { message, enabled });
            await fetchHistory();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            alert("저장 실패");
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async () => {
        setSaving(true);
        try {
            const created = await noticeApi.createNotice({ message, enabled });
            setEditingId(created.id);
            await fetchHistory();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            alert("생성 실패");
        } finally {
            setSaving(false);
        }
    };

    const loadIntoForm = (notice: NoticeResponse) => {
        setEditingId(notice.id);
        setMessage(notice.message);
        setEnabled(notice.enabled);
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString("ko-KR", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>공지 관리</h1>

                {/* 작성/편집 폼 */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        {editingId ? `편집 중 #${editingId}` : "새 공지"}
                    </h2>
                    <div className={styles.form}>
                        <textarea
                            className={styles.textarea}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="공지 문구를 입력하세요"
                            rows={3}
                        />
                        <div className={styles.actions}>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={e => setEnabled(e.target.checked)}
                                />
                                <span>표시</span>
                            </label>
                            <div className={styles.buttons}>
                                <button
                                    className={styles.newBtn}
                                    onClick={() => { setEditingId(null); setMessage(""); setEnabled(true); }}
                                    disabled={saving}
                                >
                                    초기화
                                </button>
                                <button
                                    className={styles.createBtn}
                                    onClick={handleCreate}
                                    disabled={saving || !message.trim()}
                                >
                                    새 공지로 저장
                                </button>
                                <button
                                    className={styles.saveBtn}
                                    onClick={handleSave}
                                    disabled={saving || !editingId}
                                >
                                    {saved ? "저장됨 ✓" : saving ? "저장 중..." : "저장"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 미리보기 */}
                {message.trim() && (
                    <div className={styles.previewWrap}>
                        <p className={styles.previewLabel}>로그인 화면 미리보기</p>
                        <div className={styles.previewLoginOuter}>
                            <div className={styles.previewBanner}>
                                <BellIcon size={13} weight="fill" className={styles.previewIcon} />
                                {message}
                            </div>
                            <div className={styles.previewLoginCard}>
                                <div className={styles.previewTitle}>Readory</div>
                                <div className={styles.previewDesc}>흩어진 독서 메모를 한곳에서 관리하세요</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 이력 */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>공지 이력</h2>
                    {loading ? (
                        <p className={styles.empty}>불러오는 중...</p>
                    ) : history.length === 0 ? (
                        <p className={styles.empty}>공지 이력이 없습니다.</p>
                    ) : (
                        <div className={styles.historyList}>
                            {history.map(n => (
                                <div
                                    key={n.id}
                                    className={`${styles.historyItem} ${n.enabled ? styles.active : ""} ${editingId === n.id ? styles.editing : ""}`}
                                >
                                    <div className={styles.historyMeta}>
                                        <span className={styles.historyId}>#{n.id}</span>
                                        {n.enabled && <span className={styles.badge}>표시 중</span>}
                                        <span className={styles.historyDate}>{formatDate(n.createdAt)}</span>
                                    </div>
                                    <p className={styles.historyMessage}>{n.message}</p>
                                    <button
                                        className={styles.loadBtn}
                                        onClick={() => loadIntoForm(n)}
                                    >
                                        편집
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}