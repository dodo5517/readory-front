import { fetchWithAuth } from "../utils/fetchWithAuth";
import { unwrap, unwrapVoid } from "../utils/apiResponse";
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

    return unwrap<PageResponse<AdminPageUserResponse>>(response);
}

// 특정 유저 조회
export async function getUser(id: number): Promise<AdminPageUserResponse> {
    const response = await fetchWithAuth(`/admin/users/${id}`, {
        method: "GET",
        credentials: "include",
    });

    return unwrap<AdminPageUserResponse>(response);
}

// 유저 이름 수정
export async function updateUsername(id: number, request: UpdateUsernameRequest): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/username`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include",
    });

    await unwrapVoid(response);
}

// 유저 비밀번호 수정 (관리자)
export async function updatePassword(id: number, request: UpdatePasswordAdminRequest): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include",
    });

    await unwrapVoid(response);
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

    return unwrap<string>(response);
}

// 프로필 이미지 삭제
export async function deleteProfileImage(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/profile-image`, {
        method: "DELETE",
        credentials: "include",
    });

    await unwrapVoid(response);
}

// API Key 재발급
export async function reissueApiKey(id: number): Promise<MaskedApiKeyResponse> {
    const response = await fetchWithAuth(`/admin/users/${id}/api-key/reissue`, {
        method: "POST",
        credentials: "include",
    });

    return unwrap<MaskedApiKeyResponse>(response);
}

// API Key 전체 조회 (마스킹 안 된)
export async function getRawApiKey(id: number): Promise<ApiKeyResponse> {
    const response = await fetchWithAuth(`/admin/users/${id}/api-key`, {
        method: "GET",
        credentials: "include",
    });

    return unwrap<ApiKeyResponse>(response);
}

// 유저 초기화
export async function resetUser(id: number): Promise<string> {
    const response = await fetchWithAuth(`/admin/users/${id}/reset`, {
        method: "POST",
        credentials: "include",
    });

    return unwrap<string>(response);
}

// 유저 삭제
export async function deleteUser(id: number): Promise<boolean> {
    const response = await fetchWithAuth(`/admin/users/${id}/delete`, {
        method: "DELETE",
        credentials: "include",
    });

    return unwrap<boolean>(response);
}

// 유저 상태 변경
export async function changeUserStatus(id: number, request: ChangeUserStatusRequest): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include",
    });

    await unwrapVoid(response);
}

// 유저 역할 변경
export async function changeUserRole(id: number, role: string): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: role,
        credentials: "include",
    });

    await unwrapVoid(response);
}

// 유저 전체 기기 로그아웃
export async function logoutAllDevices(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/users/${id}/logout`, {
        method: "POST",
        credentials: "include",
    });

    await unwrapVoid(response);
}
