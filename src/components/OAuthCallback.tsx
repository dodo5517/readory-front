import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get("accessToken");

        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        }

        navigate("/main", { replace: true }); // 저장 후 메인으로 리디렉션
    }, [location, navigate]);

    return <div>로그인 중입니다...</div>;
}
