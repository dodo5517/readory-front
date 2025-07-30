import React, { useState } from 'react';
import {Link, Navigate} from "react-router-dom";
import styles from '../styles/Login.module.css'; // 동일 스타일 재사용

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        console.log('회원가입 정보:', { username, email, password });
        // 실제 회원가입 로직 연결
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join us and start your reading notes</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className={styles.input}
                        required
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        className={styles.input}
                        required
                    />

                    <button type="submit" className={styles.button}>Sign Up</button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link to="/login"><a>Log In</a></Link>
                </div>
            </div>
        </div>
    );
}
