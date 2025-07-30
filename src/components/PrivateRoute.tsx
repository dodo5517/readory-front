import { Navigate } from "react-router-dom";
import {JSX} from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = !!localStorage.getItem("accessToken"); // 또는 context 사용
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;