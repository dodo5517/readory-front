import React, {useEffect, useState} from 'react';
import styles from '../styles/ReadingRecordsPage.module.css';
import {fetchMyRecords} from "../api/ReadingRecord";
import {Record} from "../types/records";

export default function ReadingRecordsPage() {
    const [record, setRecord] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'title' | 'author' | 'date'>('title');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const query = `?sort=${sortKey}&order=${sortOrder}`;

    useEffect(() => {
        (async () => {
            try {
                const items = await fetchMyRecords();
                setRecord(items);
                console.log("fetchMyRecords");
            } catch (e: any) {
                console.error(e);
                setError("불러오기 실패");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <section className={styles.container}>
            <h1 className={styles.title}>My Reading Records</h1>

            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Search by title, sentence, or comment"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />

                <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as 'title' | 'author' | 'date')}
                    className={styles.select}
                >
                    <option value="title">제목</option>
                    <option value="author">작가</option>
                    <option value="date">날짜</option>
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className={styles.select}
                >
                    <option value="asc">오름차순</option>
                    <option value="desc">내림차순</option>
                </select>

            </div>

            <div className={styles.list}>
                {record.map((record) => (
                    <div key={record.id} className={styles.card}>
                        <div className={styles.date}>{record.recordedAt}</div>
                        <div className={styles.info}>
                            <h3 className={styles.bookTitle}>{record.title}</h3>
                            <div className={styles.sentence}>{record.sentence}</div>
                            <div className={styles.comment}>{record.comment}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}