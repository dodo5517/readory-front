import React, { useState } from 'react';
import styles from '../styles/EditPasswordPage.module.css';
import {useNavigate} from "react-router-dom";
import {updatePassword, updateUsername} from "../api/Auth";

export default function EditPasswordPage() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate =  async( event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        console.log('유저이름 수정 시도');

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('모든 항목을 입력해주세요.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsSubmitting(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            setNewPassword('');
            setConfirmPassword('');
            setIsSubmitting(false);
            return;
        }

        try {
            // authService
            await updatePassword(currentPassword, newPassword);
        } catch (err: any) {
            console.log("유저이름 수정 실패: ", err)
            alert(err.message);
            return;
        } finally {
            setIsSubmitting(false);
        }

        alert('비밀번호가 성공적으로 변경되었습니다.');
        navigate('/myPage');
    }
    const handleSave = () => {


    };

    return (
        <form onSubmit={handleUpdate} className={styles.container}>
            <h2 className={styles.title}>비밀번호 변경</h2>

            <label className={styles.label}>현재 비밀번호</label>
            <input
                className={styles.input}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label className={styles.label}>새 비밀번호</label>
            <input
                className={styles.input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />

            <label className={styles.label}>새 비밀번호 확인</label>
            <input
                className={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit" className={styles.saveBtn}>저장</button>
        </form>
    );
}
