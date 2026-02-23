import React, {useEffect, useState} from 'react';
import {useNavigate, Link } from 'react-router-dom';

import styles from '../styles/Login.module.css';
import {loginUser} from "../api/Auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL!;

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('demo@example.com');
    const [password, setPassword] = useState('demo1234');
    const [isSubmitting, setIsSubmitting] = useState(false); // submit 연속 요청 방지

    // 로그인 핸들러
    const handleLogin = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        console.log('로그인 시도:', { email, password });

        try {
            // authService
            const data = await loginUser(email, password);
            // localStorage에 accessToken 저장
            localStorage.setItem('accessToken', data.accessToken);
            const expiresAt = (data.serverTime ?? Date.now()) + (data.expiresIn ?? 0) * 1000;
            localStorage.setItem('accessTokenExpiresAt', String(expiresAt));
            navigate('/main');
        } catch (err: any) {
            console.log("로그인 실패: ", err);
            alert("로그인 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 로그인 페이지 접속하자 마자 토큰 청소
    useEffect(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenExpiresAt');
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* 로고 + 서비스 설명 */}
                <div className={styles.hero}>
                    {/*<span className={styles.heroIcon}><BooksIcon /></span>*/}
                    <h1 className={styles.heroName}>Readory</h1>
                    <p className={styles.heroDesc}>흩어진 독서 메모를 한곳에서 관리하세요</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />

                    <button type="submit" className={styles.button}>로그인</button>
                </form>

                <div className={styles.footer}>
                    계정이 없으신가요? <Link to="/signUp" className={styles.a}>회원가입</Link>
                </div>

                <div className={styles.socialLogin}>
                    <div className={styles.divider}><span>또는</span></div>
                    <div className={styles.socialButtons}>
                        <button onClick={() => window.location.href = `${API_BASE_URL}/oauth2/authorization/google`}>
                            <img src="/assets/social/google_login.png" alt="Google Login"/>
                        </button>
                        <button onClick={() => window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`}>
                            <img src="/assets/social/kakao_login.png" alt="Kakao Login"/>
                        </button>
                        <button onClick={() => window.location.href = `${API_BASE_URL}/oauth2/authorization/naver`}>
                            <img src="/assets/social/naver_login.png" alt="Naver Login"/>
                        </button>
                    </div>
                </div>

                {/* 하단 링크 */}
                <div className={styles.bottomRow}>
                    <Link to="/guide" className={styles.helpLink}>Readory란?</Link>
                    <span className={styles.dot} />
                    <a
                        href="https://hill-snarl-f10.notion.site/Readory-2b7276b3090780a298f5c3c3f8d3a3d0?pvs=74"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.helpLink}
                    >사용법</a>
                    <span className={styles.dot} />
                    <Link to="/privacy" className={styles.helpLink}>개인정보</Link>
                    <span className={styles.dot} />
                    <Link to="/terms" className={styles.helpLink}>이용약관</Link>
                    <a
                        href="https://github.com/dodo5517/readory-server"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub Repository"
                        className={styles.githubIcon}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.335-1.755-1.335-1.755-1.08-.735.09-.72.09-.72 1.2.075 1.83 1.23 1.83 1.23 1.065 1.815 2.805 1.29 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.225 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.545 3.3-1.23 3.3-1.23.66 1.695.255 2.925.135 3.225.765.84 1.23 1.92 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}