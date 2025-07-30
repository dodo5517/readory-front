import { Navigate } from "react-router-dom";

const RootRedirect = () => {
    const isAuthenticated = !!localStorage.getItem("accessToken");
    return <Navigate to={isAuthenticated ? "/main" : "/login"} replace />;
};

export default RootRedirect;