import React, {useEffect, useRef, useState} from 'react';
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

    const btnRef = useRef<HTMLButtonElement | null>(null);
    const navRef = useRef<HTMLElement | null>(null);

    console.log(user);

    // 메뉴
    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    // 메뉴 클릭 시 자동 닫힘
    const handleNavClick: React.MouseEventHandler<HTMLElement> = (e) => {
        const target = e.target as HTMLElement;
        if (!target) return;
        if (target.closest('a, button, [role="menuitem"]')) {
            setMenuOpen(false);
        }
    };
    // 바깥 클릭 시 닫기
    useEffect(() => {
        const onOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!navRef.current || !btnRef.current) return;
            if (!navRef.current.contains(target) && !btnRef.current.contains(target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, []);

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
            <button
                ref={btnRef}
                className={styles.menuButton}
                onClick={toggleMenu}
            >
                ☰
            </button>

            {/*메뉴 네비게이션 영역*/}
            <nav className={`${styles.nav} ${menuOpen ? styles.show : ''}`}
                 id="global-nav"
                 role={"menu"}
                 ref={navRef}
                onClick={handleNavClick}
            >
                <Link to="/" role="menuitem">Home</Link>
                <Link to="/readingRecords" role="menuitem">Recent Records</Link>
                <a href="/bookshelf" role="menuitem">My Shelf</a>
                <a href="#" role="menuitem">Reading Calendar</a>
                <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </nav>
        </header>
    );
}