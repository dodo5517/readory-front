import React, {useEffect, useState} from "react";
import styles from '../styles/ReadingList.module.css';
import { fetchMySummaryRecords } from "../api/ReadingRecord";
import {Link, useNavigate} from "react-router-dom";
import {SummaryRecord} from "../types/records";
import { ChatIcon } from '@phosphor-icons/react';

const MIN_RECORDS = 3;

export default function ReadingList() {
    const [list, setList] = useState<SummaryRecord[]>([]);
    const [, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);

    const navigate = useNavigate();

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

    const placeholderCount = Math.max(0, MIN_RECORDS - list.length);

    return (
        <section className={styles.container}>
            <div className={styles.left}>
                <p className={styles.pageTitle}>Recent Records</p>
                <Link to="/readingRecords">Check all recrods ←</Link>
            </div>

            <div className={styles.right}>
                {list.map((item, index) => (
                    <div key={index}
                         className={styles.list}
                         onClick={() => navigate(`/readingRecords`)}
                    >
                        <span className={styles.date}>{item.date}</span>
                        <div className={styles.content}>
                            <div className={styles.main}>
                                <h3 className={styles.title}>{item.title}</h3>
                                <div className={styles.sentence}>{item.sentence}</div>
                            </div>
                            <div className={styles.comments}>
                                <span className={styles.commentIcon}><ChatIcon /></span>
                                <span className={styles.commentText}>{item.comment}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {Array.from({ length: placeholderCount }).map((_, i) => (
                    <div key={`placeholder-${i}`} className={`${styles.list} ${styles.placeholder}`}>
                        <span className={styles.date}>&nbsp;</span>
                        <div className={styles.content}>
                            <div className={styles.main}>
                                <h3 className={styles.title}>&nbsp;</h3>
                                <div className={styles.sentence}>&nbsp;</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}