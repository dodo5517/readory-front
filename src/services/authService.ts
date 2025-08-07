import {fetchWithAuth} from "../utils/fetchWithAuth";

// 일반 회원가입(POST)
export async function registerUser(email: string, username: string, password: string) {
    console.log('RegisterUser');

    const response = await fetchWithAuth(`/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    });
    
    if (!response.ok) {
        throw new Error("회원가입 실패");
    }

    return await response.json();
}

// 로그인(POST)
export async function loginUser(email: string, password: string) {
    console.log("loginUser")

    const response = await fetchWithAuth(`/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("로그인 실패");
    }

    return await response.json(); // accessToken 반환 포함한 상태임
}

// 현재 로그인한 유저 정보 조희
export async function fetchCurrentUser(){
    console.log("fetchCurrentUser")

    const accessToken = localStorage.getItem("accessToken");
    const response = await fetchWithAuth(`/users/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("유저 정보 조회 실패");
    }

    return await response.json();
}

// 유저이름 수정(PATCH)
export async function updateUsername(newUsername : string) {
    const response = await fetchWithAuth(`/users/me/username`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: newUsername }),
    });

    if (!response.ok) {
        throw new Error("유저이름 수정 실패");
    }

    return null;
}


// 유저 비밀번호 수정(PATCH)
export async function updatePassword(currentPassword : string, newPassword : string) {
    const response = await fetchWithAuth(`/users/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "비밀번호 수정 실패");
    }

    return null;
}

// accessToken 재발급(POST)
export async function reissueAccessToken(): Promise<boolean> {
    const response = await fetchWithAuth(`/auth/reissue`, {
        method: 'POST',
        credentials: 'include', // refreshToken 쿠키 전송
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return true;
    } else {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return false;
    }
}

// api_key 재발급(POST)
export async function reissueApiKey(): Promise<{ maskedApiKey: string }> {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetchWithAuth('/users/api-key/reissue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('API Key 재발급 실패');
    }

    return await response.json(); // { maskedApiKey: "************abcd" }
}

// api_key 전체(마스킹 안 된) 조회(GET)
export async function getFullApiKey(): Promise<{ apiKey: string }> {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetchWithAuth('/users/api-key', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('API Key 조회 실패');
    }

    return await response.json(); // { apiKey: "abcd1234..." }
}

// 프로필 이미지 업로드
export async function uploadProfileImage(userId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetchWithAuth(`/users/${userId}/profile-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("프로필 이미지 업로드 실패");
    }

    return await res.text(); // 백엔드에서 imageUrl string을 반환함
}


// 현재 기기에서 로그아웃(POST)
export async function logoutUser() {
    // 백엔드에 로그아웃 요청 보내고 쿠키 제거
    await fetchWithAuth(`/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    // accessToken 삭제
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
}

// 모든 기기에서 로그아웃(POST)
export async function logoutAllDevices() {
    // 백엔드에 로그아웃 요청 보내고 쿠키 제거
    await fetchWithAuth(`/auth/logout/all`, {
        method: 'POST',
        credentials: 'include',
    });

    // accessToken 삭제
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
}