import React, { useState } from 'react';
import {useNavigate, Link } from 'react-router-dom';

import styles from '../styles/Login.module.css';
import {loginUser} from "../services/authService";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 로그인 핸들러
    const handleLogin = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log('로그인 시도:', { email, password });

        try {
            // authService
            const data = await loginUser(email, password);
            // localStorage에 accessToken 저장
            localStorage.setItem('accessToken', data.accessToken);
            navigate('/main');
        } catch (e) {
            alert('로그인 실패');
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
                    Don’t have an account? <Link to="/signUp"><a>Sign Up</a></Link>
                </div>
            </div>
        </div>
    );
}
