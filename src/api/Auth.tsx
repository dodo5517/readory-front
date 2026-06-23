import {fetchWithAuth} from "../utils/fetchWithAuth";
import { unwrap, unwrapVoid } from "../utils/apiResponse";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL!;

// 일반 회원가입(POST)
// export async function registerUser(email: string, username: string, password: string) {
//     // console.log('RegisterUser');
//
//     const response = await fetch(`${API_BASE_URL}/users`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, username, password }),
//         credentials: 'include',
//     });
//
//     await unwrapVoid(response);
// }

// 로그인(POST)
export async function loginUser(email: string, password: string) {
    // console.log("loginUser")

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
    });

    return unwrap<{ accessToken: string; serverTime?: number; expiresIn?: number }>(response);
}

// 현재 로그인한 유저 정보 조회
export async function fetchCurrentUser(){
    // console.log("fetchCurrentUser")
    const response = await fetchWithAuth(`/users/me`);
    return unwrap<any>(response);
}

// 유저이름 수정(PATCH)
export async function updateUsername(newUsername : string) {
    const response = await fetchWithAuth(`/users/me/username`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: newUsername }),
    });

    await unwrapVoid(response);
    return null;
}

// 유저 비밀번호 수정(PATCH)
export async function updatePassword(currentPassword : string, newPassword : string) {
    const response = await fetchWithAuth(`/users/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    await unwrapVoid(response);
    return null;
}

// accessToken 재발급(POST)
export async function reissueAccessToken() {
    const response = await fetchWithAuth(`/auth/reissue`, {
        method: 'POST',
        credentials: 'include',
    });

    if (response.ok) {
        const data = await unwrap<{ accessToken: string; expiresIn?: number }>(response);
        localStorage.setItem('accessToken', data.accessToken);
        const expiresAt = Date.now() + (data.expiresIn ?? 1800) * 1000;
        localStorage.setItem('accessTokenExpiresAt', String(expiresAt));
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

    const response = await fetchWithAuth(`/users/api-key/reissue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    });

    return unwrap<{ maskedApiKey: string }>(response);
}

// api_key 전체(마스킹 안 된) 조회(GET)
export async function getFullApiKey(): Promise<{ apiKey: string }> {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetchWithAuth(`/users/api-key`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
    });

    return unwrap<{ apiKey: string }>(response);
}

// 프로필 이미지 업로드
export async function uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetchWithAuth(`/users/me/profile-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    return unwrap<string>(res);
}

// 프로필 이미지 삭제
export async function deleteProfileImage(): Promise<void> {
    const res = await fetchWithAuth(`/users/me/profile-image`, {
        method: "DELETE",
        credentials: "include"
    });

    await unwrapVoid(res);
}

// 현재 기기에서 로그아웃(POST)
export async function logoutUser() {
    try {
        await fetchWithAuth(`/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => {});
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenExpiresAt');
        window.location.replace('/login');
    }
}

// 모든 기기에서 로그아웃(POST)
export async function logoutAllDevices() {
    try {
        await fetchWithAuth(`/auth/logout/all`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => {});
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenExpiresAt');
        window.location.replace('/login');
    }
}

// 탈퇴
export async function deleteUser():Promise<void> {
    const res = await fetchWithAuth(`/users/delete`, {
        method: "DELETE",
        credentials: "include"
    });

    await unwrapVoid(res);
}
