const API_BASE_URL = 'http://localhost:8080';

export async function fetchWithAuth(input: string, init: RequestInit = {}): Promise<Response> {
    const accessToken = localStorage.getItem('accessToken');

    const isFormData = init.body instanceof FormData;

    // 요청 헤더 설정
    // Content-Type을 formData일 경우 생략
    const headers: HeadersInit = {
        ...(init.headers || {}),
        'Authorization': `Bearer ${accessToken}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    const requestInit: RequestInit = {
        ...init,
        headers,
        credentials: 'include', // 쿠키 포함
    };

    // 첫 요청
    let response = await fetch(`${API_BASE_URL}${input}`, requestInit);

    // accessToken 만료 → 401 응답 시 재발급 시도
    if (response.status === 401) {
        console.warn("AccessToken 만료 → 재발급 시도");

        const reissueResponse = await fetch(`${API_BASE_URL}/auth/reissue`, {
            method: 'POST',
            credentials: 'include',
        });

        if (reissueResponse.ok) {
            const data = await reissueResponse.json();
            const newAccessToken = data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);

            // Authorization 헤더 갱신 후 재요청
            const retryHeaders = {
                ...headers,
                'Authorization': `Bearer ${newAccessToken}`,
            };

            return fetch(`${API_BASE_URL}${input}`, {
                ...init,
                headers: retryHeaders,
                credentials: 'include',
            });
        } else {
            // 재발급 실패 → 로그아웃 처리
            console.error("RefreshToken 만료 또는 유효하지 않음");
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            throw new Error("토큰 재발급 실패");
        }
    }

    return response;
}
