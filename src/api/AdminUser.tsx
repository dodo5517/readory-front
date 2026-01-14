import { fetchWithAuth } from "../utils/fetchWithAuth";
import {PageResponse} from "../types/books";
import {
    ApiKeyResponse, ChangeUserStatusRequest,
    GetUsersParams,
    MaskedApiKeyResponse,
    UpdatePasswordAdminRequest,
    UpdateUsernameRequest,
    AdminPageUserResponse
} from "../types/adminUser";


// 전체 유저 목록 조회
export async function getUsers(params: GetUsersParams = {}): Promise<PageResponse<AdminPageUserResponse>> {
    const query = new URLSearchParams();

    if (params.keyword) query.append("keyword", params.keyword);
    if (params.provider) query.append("provider", params.provider);
    if (params.role) query.append("role", params.role);
    if (params.page !== undefined) query.append("page", String(params.page));
    if (params.size !== undefined) query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);

    const response = await fetchWithAuth(`/admin/users?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("유저 목록 조회 실패");
    }

    return await response.json();
}

// 특정 유저 조회
export async function getUser(id: number): Promise<AdminPageUserResponse> {
    const response = await fetchWithAuth(`/admin/users/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("유저 조회 실패");
    }

    return await response.json();
}

// 유저 이름 수정
export async function updateUsername(id: number, request: UpdateUsernameRequest): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/username`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("유저 이름 수정 실패");
    }
}

// 유저 비밀번호 수정 (관리자)
export async function updatePassword(id: number, request: UpdatePasswordAdminRequest): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("비밀번호 수정 실패");
    }
}

// 프로필 이미지 업로드
export async function uploadProfileImage(id: number, image: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetchWithAuth(`/admin/users/${id}/profile-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("프로필 이미지 업로드 실패");
    }

    return await response.text();
}

// 프로필 이미지 삭제
export async function deleteProfileImage(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/profile-image`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("프로필 이미지 삭제 실패");
    }
}

// API Key 재발급
export async function reissueApiKey(id: number): Promise<MaskedApiKeyResponse> {
    const response = await fetchWithAuth(`/admin/users/${id}/api-key/reissue`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("API Key 재발급 실패");
    }

    return await response.json();
}

// API Key 전체 조회 (마스킹 안 된)
export async function getRawApiKey(id: number): Promise<ApiKeyResponse> {
    const response = await fetchWithAuth(`/admin/users/${id}/api-key`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("API Key 조회 실패");
    }

    return await response.json();
}

// 유저 삭제
export async function deleteUser(id: number): Promise<boolean> {
    const response = await fetchWithAuth(`/admin/users/${id}/delete`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("유저 삭제 실패");
    }

    return await response.json();
}

// 유저 상태 변경
export async function changeUserStatus(id: number, request: ChangeUserStatusRequest): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("유저 상태 변경 실패");
    }
}

// 유저 역할 변경
export async function changeUserRole(id: number, role: string): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: role,
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("유저 역할 변경 실패");
    }
}

// 유저 전체 기기 로그아웃
export async function logoutAllDevices(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/logout`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("로그아웃 실패");
    }
}