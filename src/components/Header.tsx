import React, {useEffect, useRef, useState} from 'react';
import {createSearchParams, Link, useLocation, useNavigate} from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import {logoutUser, reissueAccessToken} from "../api/Auth";
import TokenHUD from "./TokenHUD";
import styles from '../styles/Header.module.css';
import { ListIcon } from '@phosphor-icons/react';

export default function Header(){
    const navigate = useNavigate();
    const location = useLocation(); // 현재 경로 가져오기
    const currentPath = location.pathname;

    // 메뉴 오픈 상태
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // submit 연속 요청 방지
    const { user } = useUser();

    const btnRef = useRef<HTMLButtonElement | null>(null);
    const navRef = useRef<HTMLElement | null>(null);

    const [refreshing, setRefreshing] = useState(false);

    // 이번 달 자동 설정
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const search = `?${createSearchParams({
        mode: "month",
        year,
        month,
    }).toString()}`;

    console.log(user);

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

        setIsSubmitting(true);
        try {
            await logoutUser();
            alert("로그아웃 되었습니다.");
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
        const onOutside = (e: PointerEvent) => {
            const target = e.target as Node;
            if (!navRef.current || !btnRef.current) return;
            // nav도 아니고 메뉴 버튼도 아니면 닫기
            if (!navRef.current.contains(target) && !btnRef.current.contains(target)) {
                setMenuOpen(false);
            }
        };

        const opts: AddEventListenerOptions = { capture: true };
        document.addEventListener('pointerdown', onOutside, opts);
        return () => document.removeEventListener('pointerdown', onOutside, opts);
    }, []);

    return (
        <header className={styles.header}>
            {/*좌측 로고*/}
            <div className={styles.left}>
                {/*데스크탑 화면일 때 보임*/}
                <Link to="/myPage" className={`${styles.username} ${styles.desktopOnly}`}>
                    {user?.username}
                </Link>
                <div className={styles.desktopOnly}>
                    <TokenHUD onExpire={onExpire} onExtend={handleExtend} refreshing={refreshing}/>
                </div>

                {/*모바일 화면일 때 보임*/}
                <Link to="/" className={`${styles.username} ${styles.mobileOnly}`}>
                    Home
                </Link>
            </div>

            {/*햄버거 메뉴 버튼*/}
            <button
                ref={btnRef}
                className={styles.menuButton}
                onClick={toggleMenu}
            >
                <ListIcon />
            </button>

            {/*메뉴 네비게이션 영역*/}
            <nav className={`${styles.nav} ${menuOpen ? styles.show : ''}`}
                 id="global-nav"
                 role={"menu"}
                 ref={navRef}
                onClick={handleNavClick}
            >
                {/*관리자 페이지 링크*/}
                {user?.role === "ADMIN" ?
                    <Link to="/admin" role="menuitem" data-text="Admin">Admin</Link>
                    : null
                }
                {/*데스크탑일 때는 보임*/}
                <Link to="/" role="menuitem" data-text="Home" className={`${styles.desktopOnly} ${currentPath === '/main' ? styles.active : ''}`}>Home</Link>
                <Link to="/readingRecords" role="menuitem" data-text="Recent Records" className={`${styles.navItem} ${currentPath === '/readingRecords' ? styles.active : ''}`}>Recent Records</Link>
                <a href="/bookshelf" role="menuitem" data-text="My Shelf" className={`${styles.navItem} ${currentPath === '/bookshelf' ? styles.active : ''}`}>My Shelf</a>
                <Link to={{ pathname: "/calendar", search }} role="menuitem" data-text="Reading Calendar" className={`${styles.navItem} ${currentPath === '/calendar' ? styles.active : ''}`}>Reading Calendar</Link>

                {/*모바일일 때는 보임*/}
                <Link to="/myPage" className={`${styles.mobileOnly} ${currentPath === '/myPage' ? styles.active : ''}`} data-text="My Page">My Page</Link>
                <button className={styles.logoutButton} onClick={handleLogout} data-text="Logout">Logout</button>
                {/* 구분선 */}
                <span className={`${styles.divider}`}></span>

                {/* 사용법 & 공지사항 */}
                <Link to="/notice" role="menuitem" className={`${styles.navFaq}`} data-text="FAQ">FAQ</Link>
            </nav>
        </header>
    );
}