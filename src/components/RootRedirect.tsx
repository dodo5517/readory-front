import { Navigate } from "react-router-dom";

const RootRedirect = () => {
    const isAuthenticated = !!localStorage.getItem("accessToken");
    if (!isAuthenticated) {
        sessionStorage.setItem('loginRedirectTo', '/');
    }
    return <Navigate to={isAuthenticated ? "/main" : "/login"} replace />;
};

export default RootRedirect;