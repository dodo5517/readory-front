import React, {useEffect, useRef, useState} from 'react';
import styles from "../styles/BookCarousel.module.css";
import {SummaryBook} from "../types/books";
import {fetchMySummaryBooks} from "../api/ReadingRecord";
import {Link, useNavigate} from "react-router-dom";
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

export default function BookCarousel() {
    const [list, setList] = useState<SummaryBook[]>([]);
    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scroll = (direction: 'left' | 'right') => {
        if (listRef.current) {
            const scrollAmount = 200;
            listRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const books = await fetchMySummaryBooks();
                setList(books);
                console.log("fetchMySummaryBooks");
            } catch (e: any){
                console.error(e);
                setError("불러오기 실패")
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <section className={styles.carousel}>
            <div className={styles.left}>
                <h2 className={styles.heading}>My Shelf</h2>
                <Link to="/bookShelf">Check all books ←</Link>
            </div>

            <div className={styles.wrapper}>
                <button className={styles.navBtn} onClick={() => scroll('left')}>
                    <CaretLeftIcon />
                </button>

                <div className={styles.bookList} ref={listRef}>
                    {list.map((book) => (
                        <div key={book.id}
                             className={styles.bookItem}
                             onClick={() => navigate(`/bookRecord/${book.id}`)}
                        >
                            <img src={book.coverUrl} alt={book.title} className={styles.bookImage}/>
                            <div className={styles.bookTitle}>{book.title}</div>
                            <div className={styles.bookAuthor}>{book.author}</div>
                        </div>
                    ))}
                </div>

                <button className={styles.navBtn} onClick={() => scroll('right')}>
                    <CaretRightIcon />
                </button>
            </div>
        </section>
);
}
