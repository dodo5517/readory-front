import React, {useState} from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import {logoutUser, reissueAccessToken} from "../api/Auth";
import TokenHUD from "./TokenHUD";
import styles from '../styles/Header.module.css';
import {
    HouseIcon,
    NotepadIcon,
    BooksIcon,
    CalendarBlankIcon,
    UserCircleIcon,
} from '@phosphor-icons/react';

export default function Header(){
    const navigate = useNavigate();
    const location = useLocation(); // 현재 경로 가져오기
    const currentPath = location.pathname;

    const [isSubmitting, setIsSubmitting] = useState(false); // submit 연속 요청 방지
    const { user } = useUser();

    const [refreshing, setRefreshing] = useState(false);

    const handleExtend = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await reissueAccessToken();
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // 해당 기기에서 로그아웃 핸들러
    const handleLogout = React.useCallback(async (e?: React.SyntheticEvent) => {
        e?.preventDefault?.();
        if (isSubmitting) return;
        if (!window.confirm("로그아웃 하시겠습니까?")) return;

        setIsSubmitting(true);
        try {
            await logoutUser();
            navigate('/login');
        } catch (err) {
            console.error("로그아웃 실패: ", err);
            alert("로그아웃을 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, navigate]);

    const onExpire = React.useCallback(() => {
        if (document.visibilityState !== "visible") return;
        const ok = window.confirm("세션이 만료되었습니다. 연장하시겠습니까?");
        if (ok) handleExtend();
        else handleLogout();
    }, [handleExtend, handleLogout]);

    // 주요 메뉴 (데스크탑 상단 네비 / 모바일 하단 탭바 공용)
    const navItems = [
        { to: '/', label: 'Home', icon: HouseIcon, match: (p: string) => p === '/' || p === '/main' },
        { to: '/readingRecords', label: 'Recent Records', shortLabel: 'Records', icon: NotepadIcon, match: (p: string) => p === '/readingRecords' },
        { to: '/bookshelf', label: 'My Shelf', icon: BooksIcon, match: (p: string) => p === '/bookshelf' },
        { to: '/bookCalendar', label: 'Reading Calendar', shortLabel: 'Calendar', icon: CalendarBlankIcon, match: (p: string) => p === '/bookCalendar' },
        { to: '/myPage', label: 'My Page', icon: UserCircleIcon, match: (p: string) => p === '/myPage' },
    ];

    return (
        <>
            {/*데스크탑 전용 상단 헤더 (모바일은 하단 탭바가 대신함)*/}
            <header className={styles.header}>
                <div className={styles.left}>
                    <Link to="/myPage" className={styles.username}>
                        {user?.username}
                    </Link>
                    <TokenHUD onExpire={onExpire} onExtend={handleExtend} refreshing={refreshing}/>
                </div>

                <nav className={styles.nav} aria-label="주요 메뉴">
                    {/*관리자 페이지 링크*/}
                    {user?.role === "ADMIN" && (
                        <Link to="/admin" data-text="Admin" className={styles.navItem}>Admin</Link>
                    )}
                    {/*My Page는 데스크탑에서 좌측 사용자명 링크가 대신하므로 제외*/}
                    {navItems.filter(({ to }) => to !== '/myPage').map(({ to, label, match }) => {
                        const active = match(currentPath);
                        return (
                            <Link
                                key={to}
                                to={to}
                                data-text={label}
                                className={`${styles.navItem} ${active ? styles.active : ''}`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <button className={styles.logoutButton} onClick={handleLogout} data-text="Logout">Logout</button>
                    {/* 구분선 */}
                    <span className={styles.divider}></span>
                    {/* 사용법 & 공지사항 */}
                    <Link to="/notice" className={`${styles.navItem} ${styles.navFaq}`} data-text="FAQ">FAQ</Link>
                </nav>
            </header>

            {/*모바일 하단 탭바*/}
            <nav className={styles.bottomNav} aria-label="주요 메뉴">
                {navItems.map(({ to, label, shortLabel, icon: Icon, match }) => {
                    const active = match(currentPath);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`${styles.bottomNavItem} ${active ? styles.active : ''}`}
                        >
                            <Icon size={24} weight={active ? 'fill' : 'regular'} />
                            <span>{shortLabel ?? label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
