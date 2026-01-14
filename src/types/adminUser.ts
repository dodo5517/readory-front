export type UserRole = "ADMIN" | "USER" | string;
export type UserProvider = "local" | "google" | "naver" | "kakao" | string;
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED" | "SUSPENDED" |string;

export interface AdminPageUserResponse {
    id: number;
    username: string;
    email: string;
    profileImageUrl: string | null;
    role: UserRole;
    maskedApiKey: string | null;
    provider?: UserProvider;
    status?: UserStatus;
    createdAt?: string;
}

export interface GetUsersParams {
    keyword?: string;
    provider?: string;
    role?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface UpdateUsernameRequest {
    newUsername: string;
}

export interface UpdatePasswordAdminRequest {
    newPassword: string;
}

export interface ChangeUserStatusRequest {
    status: UserStatus;
}

export interface MaskedApiKeyResponse {
    message: string;
    maskedApiKey: string;
}

export interface ApiKeyResponse {
    message: string;
    apiKey: string;
}