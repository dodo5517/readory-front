import { Navigate } from "react-router-dom";

const RootRedirect = () => {
    const isAuthenticated = !!localStorage.getItem("accessToken");
    // 루트(/) 접속은 메인으로. 비로그인이면 로그인 화면으로 보내되,
    // 별도 redirect를 지정하지 않아 로그인 후 /main으로 간다.
    return <Navigate to={isAuthenticated ? "/main" : "/login"} replace />;
};

export default RootRedirect;