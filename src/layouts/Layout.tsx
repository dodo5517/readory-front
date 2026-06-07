import Header from '../components/Header';
import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../api/Auth';
import { useUser } from '../contexts/UserContext';

// 로그인 화면으로 보내기 전, 돌아올 경로를 저장
const saveRedirectPath = () => {
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/') {
        sessionStorage.setItem('loginRedirectTo', path);
    }
};

const Layout = () => {
    const [checking, setChecking] = useState(true);
    const { setUser } = useUser();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            setChecking(false); // 인증 안 됨
            return;
        }

        fetchCurrentUser()
            .then(user => {
                setUser(user);
                setChecking(false); // 인증 완료
            })
            .catch(() => {
                localStorage.removeItem('accessToken');
                setChecking(false); // 토큰 만료 등
            });
    }, [setUser]);

    if (checking) return <div></div>; // 또는 로딩 스피너

    // checking이 끝난 뒤 토큰 상태를 다시 확인 (catch에서 지워졌을 수 있음)
    const authed = !!localStorage.getItem('accessToken');
    if (!authed) {
        saveRedirectPath();
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default Layout;