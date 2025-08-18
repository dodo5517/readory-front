import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import {logoutUser} from "../services/authService";
import styles from '../styles/Header.module.css';

export default function Header(){
    const navigate = useNavigate();

    // 메뉴 오픈 상태
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // submit 연속 요청 방지
    const { user } = useUser();

    console.log(user);

    // 메뉴
    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    // 해당 기기에서 로그아웃 핸들러
    const handleLogout = async(e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        console.log("해당 기기에서 로그아웃 시도");

        try {
            await logoutUser();
            alert("로그아웃 되었습니다.");
            navigate('/login');
        } catch (err: any) {
            console.error("로그아웃 실패: ", err);
            alert("로그아웃을 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <header className={styles.header}>
            {/*좌측 로고*/}
            <div className={styles.left}>
                <Link to="/myPage" className={styles.username}>{user?.username}</Link>
            </div>

            {/*햄버거 메뉴 버튼*/}
            <button className={styles.menuButton} onClick={toggleMenu}>
                ☰
            </button>

            {/*메뉴 네비게이션 영역*/}
            <nav className={`${styles.nav} ${menuOpen ? styles.show : ''}`}>
                <Link to="/">Home</Link>
                <Link to="/readingRecords">Recent Records</Link>
                <a href="/bookshelf">My Shelf</a>
                <a href="#">Reading Calendar</a>
                <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </nav>
        </header>
    );
}