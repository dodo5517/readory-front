import React, { useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import styles from '../styles/Login.module.css';
import {registerUser} from "../api/Auth";

export default function SignUp() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async(e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        if (password !== confirm) {
            alert('비밀번호가 일치하지 않습니다.');
            setIsSubmitting(false);
            return;
        }

        console.log('회원가입 시도:', { email, username, password });

        try {
            await registerUser(email, username, password);
            alert("회원가입 성공");
            navigate('/login');
        } catch (err: any) {
            console.error("회원가입 실패: ", err);
            alert("회원가입을 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* 헤더 */}
                <div className={styles.hero}>
                    <h1 className={styles.heroName}>회원가입</h1>
                    <p className={styles.heroDesc}>Readory와 함께 독서 기록을 시작하세요</p>
                </div>

                <form onSubmit={handleRegister} className={styles.form}>
                    <input
                        type="text"
                        placeholder="이름"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className={styles.input}
                        required
                    />
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
                    <input
                        type="password"
                        placeholder="비밀번호 확인"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        className={styles.input}
                        required
                    />

                    <button type="submit" className={styles.button} disabled={isSubmitting}>
                        {isSubmitting ? '처리 중…' : '회원가입'}
                    </button>
                </form>

                <div className={styles.footer}>
                    이미 계정이 있으신가요? <Link to="/login" className={styles.a}>로그인</Link>
                </div>
            </div>
        </div>
    );
}