import React, { useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import styles from '../styles/Login.module.css';
import {registerUser} from "../services/authService"; // 동일 스타일 재사용

export default function SignUp() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // submit 연속 요청 방지

    const handleRegister = async(e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        if (password !== confirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        console.log('회원가입 시도:', { email, username, password });

        try {
            await registerUser( email, username, password);
            // 따로 화면 필요할듯
            alert("회원가입 성공");
            navigate('/login');
        } catch (err: any) {
            console.error("회원가입 실패: ", err);
            alert("회원가입 실패:");
        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join us and start your reading notes</p>

                <form onSubmit={handleRegister} className={styles.form}>
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
                    Already have an account? <Link to="/login" className={styles.a}>Log In</Link>
                </div>
            </div>
        </div>
    );
}
