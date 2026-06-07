import { Navigate, useLocation } from "react-router-dom";
import {JSX} from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = !!localStorage.getItem("accessToken");
    const location = useLocation();

    if (!isAuthenticated) {
        const path = location.pathname + location.search;
        sessionStorage.setItem('loginRedirectTo', path);
        const to = (path === '/login' || path === '/')
            ? '/login'
            : `/login?redirect=${encodeURIComponent(path)}`;
        return <Navigate to={to} replace />;
    }

    return children;
};

export default PrivateRoute;