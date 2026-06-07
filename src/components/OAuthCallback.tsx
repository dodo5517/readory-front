import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// 내부 경로만 허용 (오픈 리다이렉트 방지)
function safeInternalPath(path: string | null): string {
    if (!path || path === '/') return '/main';
    if (!path.startsWith('/')) return '/main';
    if (path.startsWith('//') || path.startsWith('/\\')) return '/main';
    return path;
}

export default function OAuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        console.log(params);
        const accessToken = params.get("accessToken");
        const serverTime = Number(params.get("serverTime"));
        const expiresIn = Number(params.get("expiresIn"));

        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            const expiresAt = (serverTime ?? Date.now()) + (expiresIn ?? 0) * 1000;
            localStorage.setItem('accessTokenExpiresAt', String(expiresAt));
        }

        const stored = sessionStorage.getItem('loginRedirectTo');
        const redirectTo = safeInternalPath(stored);
        sessionStorage.removeItem('loginRedirectTo');
        navigate(redirectTo, { replace: true });
    }, [location, navigate]);

    return <div>로그인 중입니다...</div>;
}