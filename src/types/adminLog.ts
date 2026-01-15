export type AuthEventType =
    | "LOGIN"
    | "LOGIN_FAIL"
    | "LOGOUT_CURRENT_DEVICE"
    | "LOGOUT_ALL_DEVICES";

export type AuthResult = "SUCCESS" | "FAIL";

// 목록용 응답 (간략 정보)
export interface LogListResponse {
    id: number;
    userId: number | null;
    eventType: AuthEventType;
    result: AuthResult;
    ipAddress: string | null;
    createdAt: string;
}

// 상세용 응답 (전체 정보)
export interface LogDetailResponse {
    id: number;
    userId: number | null;
    eventType: AuthEventType;
    result: AuthResult;
    failResponse: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    identifier: string | null;
    createdAt: string;
}

export interface GetLogsParams {
    keyword?: string;
    type?: string;
    result?: string;
    page?: number;
    size?: number;
    sort?: string;
}