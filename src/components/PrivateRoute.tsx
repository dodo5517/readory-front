import { Navigate, useLocation } from "react-router-dom";
import {JSX} from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = !!localStorage.getItem("accessToken");
    const location = useLocation();

    if (!isAuthenticated) {
        sessionStorage.setItem('loginRedirectTo', location.pathname);
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;