import React, {useState} from 'react';
import {useUser} from "../contexts/UserContext";
import {getFullApiKey, logoutAllDevices, reissueApiKey} from "../services/authService";
import styles from '../styles/MyPage.module.css';
import {Link, useNavigate} from "react-router-dom";

export default function MyPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { user, setUser } = useUser();

    // api_key 전체 복사 핸들러
    const handleCopy = async () => {
        const res = await getFullApiKey();
        await navigator.clipboard.writeText(res.apiKey);
        alert('API Key가 클립보드에 복사되었습니다. \n\ \n\API Key는 외부 서비스와의 인증에 사용되며, 노출되지 않도록 주의해주세요.');
    };

    // api_key 재발급 핸들러
    const handleReissue = async () => {
        try {
            setLoading(true);
            const result = await reissueApiKey();
            setUser({
                ...user!,
                maskedApiKey: result.maskedApiKey
            });
            console.log("마스킹된 키:", result.maskedApiKey);
            alert('API Key를 새로 만들었습니다. \n\ \n\API Key는 외부 서비스와의 인증에 사용되며, 노출되지 않도록 주의해주세요.');
        } catch (error) {
            alert('새로 만드는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };
    
    // 모든 기기에서 로그아웃 핸들러
    const handleLogoutAllDevices = async(e: React.FormEvent) => {
        e.preventDefault();

        console.log("모든 기기에서 로그아웃 시도");

        try {
            await logoutAllDevices();
            alert("모든 기기에서 로그아웃 되었습니다.");
            navigate('/login');
        } catch (err: any) {
            console.error("logoutAllDevices 실패: ", err);
            alert("로그아웃을 실패했습니다.");
        }
    };

    return (
        <section className={styles.container}>
            <div className={styles.avatar}></div>

            <ul className={styles.infoList}>
                <li>
                    <span className={styles.label}>이름</span>
                    <span className={styles.value}>{user?.username} <Link to="/myPage/edit-name" className={styles.updatebtn}>→</Link> </span>
                </li>
                <li>
                    <span className={styles.label}>이메일</span>
                    <span className={styles.value}>{user?.email}</span>
                </li>
                <li>
                    <span className={styles.label}>비밀번호</span>
                    <Link to="/myPage/edit-password" className={styles.updatebtn}>→</Link>
                </li>
                <li>
                    <span className={styles.label}>API Key</span>
                    <div className={styles.copyRow}>
                        {/*실제 값으로 수정*/}
                        <span className={styles.value}>{user?.maskedApiKey}</span>
                        <button className={styles.copyBtn} onClick={() => handleCopy()}>복사하기</button>
                    </div>
                </li>
                <li>
                    <span className={styles.label}></span>
                    <button className={styles.copyBtn} onClick={() => handleReissue()}>{loading ? '재발급 중...' : 'Api Key 새로 만들기'}</button>
                </li>
            </ul>

            <div className={styles.box} onClick={handleLogoutAllDevices}>
                <span className={styles.lockIcon}>🔒</span>
                <div>
                    <div className={styles.boxLabel}></div>
                    <div className={styles.boxText}>모든 기기에서 로그아웃</div>
                </div>
            </div>
        </section>
    );
}
