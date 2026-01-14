import React, { useState } from 'react';
import styles from '../styles/EditNamePage.module.css';
import {useNavigate} from "react-router-dom";
import {useUser} from "../contexts/UserContext";
import {updateUsername} from "../api/Auth";

export default function EditNamePage() {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [newUsername, setNewUsername] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // submit 연속 요청 방지


    const handleClear = () => setNewUsername('');
    
    // 업데이트 핸들러
    const handleUpdate = async( event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        console.log('유저이름 수정 시도');

        if (!newUsername.trim()) {
            alert('이름을 입력해주세요.');
            setIsSubmitting(false);
            return;
        }
        if (user?.username === newUsername) {
            alert('기존 이름과 동일한 이름입니다.');
            setNewUsername('');
            setIsSubmitting(false);
            return;
        }

        try {
            // authService
            await updateUsername(newUsername);

        } catch (err: any) {
            console.log("유저이름 수정 실패: ", err);
            alert("이름 변경 실패");
            return;
        } finally {
            setIsSubmitting(false);
        }

        setUser({
            ...user!,
            username: newUsername
        });

        alert(`이름이 성공적으로 변경되었습니다.: ${newUsername}`);
        navigate('/myPage');
    };

    return (
        <form onSubmit={handleUpdate} className={styles.container}>
            <h2 className={styles.title}>이름 변경</h2>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder={user?.username}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                />
                {user?.username && <button className={styles.clearBtn} onClick={handleClear}>×</button>}
            </div>
            <button type="submit" className={styles.saveBtn}>저장</button>
        </form>
    );
}
