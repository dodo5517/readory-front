import React, { useState } from 'react';
import styles from '../styles/Header.module.css';

export default function Header(){
    // 메뉴 오픈 상태
    const [menuOpen, setMenuOpen] = useState(false);

    // 메뉴
    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    return (
        <header className={styles.header}>
            {/*좌측 로고*/}
            <div className={styles.left}>
                <img src="../assets/logo.png"  className={styles.logo} />
                <span className={styles.brand}>Mindify</span>
            </div>

            {/*햄버거 메뉴 버튼*/}
            <button className={styles.menuButton} onClick={toggleMenu}>
                ☰
            </button>

            {/*메뉴 네비게이션 영역*/}
            <nav className={`${styles.nav} ${menuOpen ? styles.show : ''}`}>
                <a href="#">About Me</a>
                <a href="#">Services</a>
                <a href="#">How It Works</a>
                <a href="#">Testimonials</a>
            </nav>
        </header>
    );
}