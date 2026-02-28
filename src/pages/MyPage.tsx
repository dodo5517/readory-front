import React, {useEffect, useRef, useState} from 'react';
import {useUser} from "../contexts/UserContext";
import {
    deleteProfileImage, deleteUser,
    getFullApiKey,
    logoutAllDevices,
    reissueApiKey,
    uploadProfileImage
} from "../api/Auth";
import styles from '../styles/MyPage.module.css';
import {Link, useNavigate} from "react-router-dom";
import { PlusIcon, XIcon, LockIcon, TrashIcon } from '@phosphor-icons/react';

export default function MyPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { user, setUser } = useUser();
    const [apiKey, setApiKey] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // api_key 전체 복사 핸들러
    const handleCopy = async () => {
        if (!apiKey) {
            alert("잠시 후 다시 시도해주세요.");
            return;
        }
        await navigator.clipboard.writeText(apiKey);
        alert('API Key가 클립보드에 복사되었습니다. \n \nAPI Key는 외부 서비스와의 인증에 사용되며, 노출되지 않도록 주의해주세요.');
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
            alert('API Key를 새로 만들었습니다. \n \nAPI Key는 외부 서비스와의 인증에 사용되며, 노출되지 않도록 주의해주세요.');
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

    // 파일 업로드 창 열기
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // 프로필 이미지 업로드
    const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            const imageUrl = await uploadProfileImage(user.id, file);
            setUser({
                ...user!,
                profileImageUrl: imageUrl
            });

            alert("프로필 이미지가 변경되었습니다!");
        } catch (err) {
            console.error("업로드 에러:", err);
            alert("이미지 업로드에 실패했습니다.");
        }
    }

    // 프로필 이미지 삭제 핸들러
    const handleDeleteProfileImage = async () => {
        if (!user) return;

        const confirmed = window.confirm("정말 프로필 이미지를 삭제하시겠습니까?");
        if (!confirmed) return;

        try {
            await deleteProfileImage(user.id);
            setUser({
                ...user!,
                profileImageUrl: null
            });
            alert("프로필 이미지가 삭제되었습니다.");
        } catch (err) {
            console.error("이미지 삭제 실패:", err);
            alert("이미지 삭제에 실패했습니다.");
        }
    }

    // 탈퇴 핸들러
    const handleDeleteUser = async () => {
        if(!user) return;

        const confirmed1 = window.confirm("정말 탈퇴하시겠어요?");
        if (!confirmed1) return;

        const confirmed2 = window.confirm("탈퇴 시 모든 기록이 영구 삭제되며 복구할 수 없습니다. 계속 진행할까요?");
        if (!confirmed2) return;
        
        try {
            await deleteUser();
            alert("탈퇴처리되었습니다..");
            navigate('/login');
        } catch (err) {
            console.error("탈퇴 실패:", err);
            alert("탈퇴에 실패했습니다.");
        }

    }

    // 모달 열리자마자 api key 로드 및 저장
    useEffect(() => {
        getFullApiKey().then(res => setApiKey(res.apiKey));
    }, []);

    return (
        <section className={styles.container}>
            <div className={styles.avatarWrapper}>
                <img
                    src={user?.profileImageUrl || "/assets/readory_icon.png"}
                    alt="프로필 이미지"
                    className={styles.avatar}
                />
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleProfileUpload}
                    style={{display: "none"}}
                />
                <button className={styles.avatarAddBtn} onClick={handleUploadClick}>
                    <PlusIcon />
                </button>
                {user?.profileImageUrl && (
                    <button className={styles.avatarDeleteBtn} onClick={handleDeleteProfileImage}>
                        <XIcon />
                    </button>
                )}
            </div>
            <ul className={styles.infoList}>
                <li>
                    <span className={styles.label}>이름</span>
                    <span className={styles.value}>{user?.username} <Link to="/myPage/edit-name"
                                                                          className={styles.updatebtn}>→</Link> </span>
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
                        <span className={styles.value}>{user?.maskedApiKey}</span>
                        <button className={styles.copyBtn} onClick={() => handleCopy()}>복사하기</button>
                    </div>
                </li>
                <li>
                    <span className={styles.label}></span>
                    <button className={styles.copyBtn}
                            onClick={() => handleReissue()}>{loading ? '재발급 중...' : 'Api Key 새로 만들기'}</button>
                </li>
            </ul>

            <div className={styles.box} onClick={handleLogoutAllDevices}>
                <span className={styles.lockIcon}><LockIcon /></span>
                <div>
                    <div className={styles.boxText}>모든 기기에서 로그아웃</div>
                </div>
            </div>

            <div className={styles.dangerSection} role="region" aria-label="위험 구역">
                <div className={styles.dangerInfo}>
                    <div className={styles.dangerTitle}>계정 영구 삭제</div>
                    <div className={styles.dangerDesc}>
                        계정과 모든 기록이 영구 삭제됩니다. 복구할 수 없습니다.
                    </div>
                </div>
                <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={handleDeleteUser}   // 기존 핸들러에 연결 (오타 그대로 쓰고 있으면 유지)
                    aria-label="계정 영구 삭제"
                >
                    <TrashIcon /> 탈퇴하기
                </button>
            </div>
        </section>
    );
}
