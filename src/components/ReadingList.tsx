import React, {useEffect, useState} from "react";
import styles from '../styles/ReadingList.module.css';
import { fetchMySummaryRecords } from "../api/ReadingRecord";
import {Link} from "react-router-dom";
import {SummaryRecord} from "../types/records";

export default function ReadingList() {
    const [list, setList] = useState<SummaryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const items = await fetchMySummaryRecords();
                setList(items);
                console.log("fetchMySummaryRecords");
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
            <div className={styles.left}>
                <p className={styles.pageTitle}>Recent Records</p>
                <Link to="/ReadingRecords">Check all recrods ←</Link>
            </div>

            <div className={styles.right}>
                {list.map((list, index) => (
                    <div key={index} className={styles.list}>
                        <span className={styles.date}>{list.date}</span>
                        <div className={styles.content}>
                            <div className={styles.main}>
                                <h3 className={styles.title}>{list.title}</h3>
                                <div className={styles.sentence}>{list.sentence}</div>
                            </div>
                            <div className={styles.comments}>
                                <span className={styles.commentIcon}>💬</span>
                                <span className={styles.commentText}>{list.comment}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}