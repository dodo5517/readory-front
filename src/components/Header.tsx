import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import styles from '../styles/Header.module.css';

export default function Header(){
    // 메뉴 오픈 상태
    const [menuOpen, setMenuOpen] = useState(false);
    const { user } = useUser();

    console.log(user);

    // 메뉴
    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    return (
        <header className={styles.header}>
            {/*좌측 로고*/}
            <div className={styles.left}>
                {/*<img src="../../public/assets/logo.png" className={styles.logo} />*/}
                <span className={styles.username}>{user?.username}</span>
            </div>

            {/*햄버거 메뉴 버튼*/}
            <button className={styles.menuButton} onClick={toggleMenu}>
                ☰
            </button>

            {/*메뉴 네비게이션 영역*/}
            <nav className={`${styles.nav} ${menuOpen ? styles.show : ''}`}>
                <Link to="/">Home</Link>
                <Link to="/ReadingRecords">Recent Records</Link>
                <a href="#">My Shelf</a>
                <a href="#">Reading Calendar</a>
            </nav>
        </header>
    );
}