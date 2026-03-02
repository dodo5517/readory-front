import React from 'react';
import {Link} from "react-router-dom";
import styles from '../styles/Login.module.css';
import {PawPrintIcon} from "@phosphor-icons/react";

export default function SignUp() {

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* 헤더 */}
                <div className={styles.heroSignup}>
                    <h1 className={styles.heroName}>회원가입</h1>
                    <p className={styles.heroDesc}>Readory와 함께 독서 기록을 시작하세요</p>
                </div>

                <div className={styles.signupDisabledBox}>
                    <p className={styles.signupDisabledText}>
                        데모는 소셜 로그인만 운영하고 있어요.
                    </p>
                    <p className={styles.signupDisabledSub}>
                        구경하고 싶으시다면 로그인 페이지의
                        <span className={styles.lastLine}>
                            데모 계정을 이용해보세요
                            <PawPrintIcon className={styles.icon}/>
                        </span>
                    </p>
                </div>

                <form onSubmit={handleRegister} className={`${styles.form} ${styles.formDisabled}`}>
                    <input type="text" placeholder="이름" className={styles.input} disabled />
                    <input type="email" placeholder="이메일" className={styles.input} disabled />
                    <input type="password" placeholder="비밀번호" className={styles.input} disabled />
                    <input type="password" placeholder="비밀번호 확인" className={styles.input} disabled />
                </form>
                <button type="button" className={`${styles.button} ${styles.backButton}`} onClick={() => window.history.back()}>돌아가기</button>

                <div className={styles.footer}>
                    이미 계정이 있으신가요? <Link to="/login" className={styles.a}>로그인</Link>
                </div>
            </div>
        </div>
    );
}