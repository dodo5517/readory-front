import Header from './Header';
import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../services/authService';
import { useUser } from '../contexts/UserContext';

const Layout = () => {
    const isAuthenticated = !!localStorage.getItem('accessToken');
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
    }, []);

    if (checking) return <div>Loading...</div>; // 또는 로딩 스피너



    if (!isAuthenticated) {
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
