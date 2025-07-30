import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 로그인 핸들러
    const handleLogin = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log('로그인 시도:', { email, password });

        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok){
            const data = await response.json();
            // localStorage에 accessToken 저장
            localStorage.setItem('accessToken', data.accessToken);
            navigate('/main');
        } else {
            alert('로그인을 실패했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome!</h1>
                <p className={styles.subtitle}>Please log in to continue</p>

                <form onSubmit={handleLogin} className={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />

                    <button type="submit" className={styles.button}>Log In</button>
                </form>

                <div className={styles.footer}>
                    Don’t have an account? <a href="#">Sign Up</a>
                </div>
            </div>
        </div>
    );
}
