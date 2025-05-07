import React from "react";
import styles from '../styles/ReadingList.module.css';

interface ListProps {
    id: number;
    title: string|null;
    author: string|null;
    date: string|null;
    sentence: string|null;
    comment: string|null;
}

const list: ListProps[] = [
    {
        id: 1,
        title: "title1",
        author: "author1",
        date: "2025-05-01",
        sentence: "sentence1",
        comment: "comments1"
    },
    {
        id: 2,
        title: "title2",
        author: "author2",
        date: "2025-05-02",
        sentence: "sentence2",
        comment: "comments2"
    },
    {
        id: 3,
        title: "title3",
        author: "author3",
        date: "2025-05-03",
        sentence: "sentence3",
        comment: "comments3"
    },
];

export default function ReadingList() {
    return (
        <section className={styles.container}>
            <div className={styles.left}>
                <p className={styles.pageTitle}>Recent Records</p>
                <a href="#">Check all recrods ←</a>
            </div>

            <div className={styles.right}>
                {list.map((list, index) => (
                    <div key={index} className={styles.list}>
                        <span className={styles.date}>{list.date}</span>
                        <div className={styles.content}>
                            <div>
                                <h3 className={styles.title}>{list.title}</h3>
                                <div className={styles.sentence}>{list.sentence}</div>
                            </div>
                            <div className={styles.comments}>
                                💬 {list.comment}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}