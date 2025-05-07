import React, { useRef } from 'react';
import styles from "../styles/BookCarousel.module.css";

interface Book {
    id: number;
    title: string;
    author: string;
    imageUrl: string;
}

const books: Book[] = [
    {
        id: 1,
        title: "채식주의자 (리마스터판)",
        author: "한강",
        imageUrl: "/assets/test_img.jpg"
    },
    {
        id: 2,
        title: "희랍어 시간",
        author: "한강",
        imageUrl: "/assets/test_img.jpg"
    },
    {
        id: 3,
        title: "한강 스페셜 에디션",
        author: "한강",
        imageUrl: "/assets/test_img.jpg"
    },
    {
        id: 4,
        title: "디 에센셜 한강",
        author: "한강",
        imageUrl: "/assets/test_img.jpg"
    },
    {
        id: 5,
        title: "소년이 온다",
        author: "한강",
        imageUrl: "/assets/test_img.jpg"
    },
    {
        id: 6,
        title: "소년이 온다",
        author: "한강",
        imageUrl: "/assets/test_img.jpg"
    },
    {
        id: 7,
        title: "소년이 온다",
        author: "한강",
        imageUrl: "/assets/test_img.jpg"
    },
    {
        id: 8,
        title: "소년이 온다",
        author: "한강",
        imageUrl: "/assets/test_img.jpg"
    }
];

export default function BookCarousel() {
    const listRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (listRef.current) {
            const scrollAmount = 200;
            listRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    return (
        <section className={styles.carousel}>
            <h2 className={styles.heading}>My Shelf</h2>

            <div className={styles.wrapper}>
                <button className={styles.navBtn} onClick={() => scroll('left')}>
                    ‹
                </button>

                <div className={styles.bookList} ref={listRef}>
                    {books.map((book) => (
                        <div key={book.id} className={styles.bookItem}>
                            <img src={book.imageUrl} alt={book.title} className={styles.bookImage}/>
                            <div className={styles.bookTitle}>{book.title}</div>
                            <div className={styles.bookAuthor}>{book.author}</div>
                        </div>
                    ))}
                </div>

                <button className={styles.navBtn} onClick={() => scroll('right')}>
                    ›
                </button>
            </div>
        </section>
);
}
