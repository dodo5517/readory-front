import React, {useEffect, useRef, useState} from 'react';
import {createSearchParams, Link, useNavigate} from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import {logoutUser, reissueAccessToken} from "../services/authService";
import styles from '../styles/Header.module.css';

export default function Header(){
    const navigate = useNavigate();

    // 메뉴 오픈 상태
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // submit 연속 요청 방지
    const { user } = useUser();

    const btnRef = useRef<HTMLButtonElement | null>(null);
    const navRef = useRef<HTMLElement | null>(null);

    // 토큰 남은 시간 상태
    const [remainSec, setRemainSec] = useState<number | null>(null);

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

    // 남은 초 포맷
    function formatRemain(sec: number) {
        if (sec <= 0) return "만료됨";
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        const pad = (n: number) => String(n).padStart(2, "0");
        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    }

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
    const handleLogout = async (e?: React.SyntheticEvent) => {
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
    };

    // 남은 시간 읽기
    const readRemain = () => {
        const expRaw = localStorage.getItem("accessTokenExpiresAt");
        if (!expRaw) {
            setRemainSec(null);
            return;
        }
        const exp = Number(expRaw);
        const now = Date.now();
        const diffSec = Math.max(0, Math.floor((exp - now) / 1000));
        setRemainSec(diffSec);
    };

    // 남은 시간 타이머
    useEffect(() => {
        // 초기 1회 + 1초 간격 업데이트
        readRemain();
        const id = setInterval(readRemain, 1000);
        return () => clearInterval(id);
    }, []);
    // 여러 탭 동기화(다른 탭에서 재발급/로그아웃 시)
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === "accessTokenExpiresAt") {
                // 변경되면 즉시 남은 시간 재계산
                const expRaw = localStorage.getItem("accessTokenExpiresAt");
                if (!expRaw) { setRemainSec(null); return; }
                const exp = Number(expRaw);
                setRemainSec(Math.max(0, Math.floor((exp - Date.now()) / 1000)));
            }
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    useEffect(() => {
        if (remainSec !== null && remainSec <= 0) {
            if (document.visibilityState !== "visible") return;

            const ok = window.confirm("세션이 만료되었습니다. 연장하시겠습니까?");
            if (ok) {
                handleExtend(); // = reissueToken 호출, localStorage 갱신
            } else {
                handleLogout();
            }
        }
    }, [remainSec]);

    const handleExtend = async () => {
        setRefreshing(true);
        try {
            await reissueAccessToken();
            readRemain();
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    const [refreshing, setRefreshing] = useState(false);

    return (
        <header className={styles.header}>
            {/*좌측 로고*/}
            <div className={styles.left}>
                {/*데스크탑 화면일 때 보임*/}
                <Link to="/myPage" className={`${styles.username} ${styles.desktopOnly}`}>
                    {user?.username}
                </Link>

                {/*모바일 화면일 때 보임*/}
                <Link to="/" className={`${styles.username} ${styles.mobileOnly}`}>
                    Home
                </Link>

                {remainSec !== null && (
                    <span className={styles.tokenWrap}>
                    <span className={styles.tokenBadge} aria-live="polite">
                      {formatRemain(remainSec)}
                    </span>
                    <button
                        type="button"
                        className={styles.extendBtn}
                        onClick={handleExtend}
                        disabled={refreshing}
                        aria-label="토큰 연장"
                        title="토큰 연장"
                    >
                      {refreshing ? "연장 중…" : "연장"}
                    </button>
                  </span>
                )}
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
                {/*데스크탑일 때는 보임*/}
                <Link to="/" role="menuitem" className={`${styles.desktopOnly}`}>Home</Link>
                <Link to="/readingRecords" role="menuitem">Recent Records</Link>
                <a href="/bookshelf" role="menuitem">My Shelf</a>
                <Link to={{ pathname: "/calendar", search }} role="menuitem">
                    Reading Calendar
                </Link>
                {/*모바일일 때는 보임*/}
                <Link to="/myPage" className={`${styles.mobileOnly}`}>My Page</Link>
                <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </nav>
        </header>
    );
}