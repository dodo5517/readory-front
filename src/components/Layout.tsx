import Header from './Header';
import { Outlet, Navigate } from 'react-router-dom';

const Layout = () => {
    const isAuthenticated = !!localStorage.getItem("accessToken");

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