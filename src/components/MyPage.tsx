import React from 'react';
import {useUser} from "../contexts/UserContext";
import styles from '../styles/MyPage.module.css';

export default function MyPage() {
    const { user } = useUser();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('클립보드에 복사되었습니다. \n\ \n\API Key는 외부 서비스와의 인증에 사용되며, 노출되지 않도록 주의해주세요.');
    };
    const handleReissue = () => {
        alert('API Key를 새로 만들었습니다. \n\ \n\API Key는 외부 서비스와의 인증에 사용되며, 노출되지 않도록 주의해주세요.');
    };

    return (
        <section className={styles.container}>
            <div className={styles.avatar}></div>

            <ul className={styles.infoList}>
                <li>
                    <span className={styles.label}>이름</span>
                    <span className={styles.value}>{user?.username}</span>
                </li>
                <li>
                    <span className={styles.label}>이메일</span>
                    <span className={styles.value}>{user?.email}</span>
                </li>
                <li>
                    <span className={styles.label}>비밀번호</span>
                    <button className={styles.linkBtn}>변경</button>
                </li>
                <li>
                    <span className={styles.label}>API Key</span>
                    <div className={styles.copyRow}>
                        {/*실제 값으로 수정*/}
                        <span className={styles.value}>************abc</span>
                        <button className={styles.copyBtn} onClick={() => handleCopy("********abc")}>복사하기</button>
                    </div>
                </li>
                <li>
                    <span className={styles.label}></span>
                    <button className={styles.copyBtn} onClick={() => handleReissue()}>Api Key 새로 만들기</button>
                </li>
            </ul>

            <div className={styles.box}>
                <span className={styles.lockIcon}>🔒</span>
                <div>
                    <div className={styles.boxLabel}></div>
                    <div className={styles.boxText}>이 기기에서 로그아웃</div>
                </div>
            </div>
        </section>
    );
}
