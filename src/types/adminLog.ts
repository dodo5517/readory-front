export type AuthEventType =
    | "LOGIN"
    | "LOGIN_FAIL"
    | "LOGOUT_CURRENT_DEVICE"
    | "LOGOUT_ALL_DEVICES";

export type Result = "SUCCESS" | "FAIL";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// 인증 로그 목록용 응답 (간략 정보)
export interface LogListResponse {
    id: number;
    userId: number | null;
    eventType: AuthEventType;
    result: Result;
    ipAddress: string | null;
    createdAt: string;
}

// 인증 로그 상세용 응답 (전체 정보)
export interface LogDetailResponse {
    id: number;
    userId: number | null;
    eventType: AuthEventType;
    result: Result;
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

// API 로그 목록용 응답 (간략 정보)
export interface ApiLogListResponse {
    id: number;
    createdAt: string;
    method: string;
    path: string;
    statusCode: number;
    result: Result;
    executionTimeMs: number | null;
    userId: number | null;
    userRole: string | null;
}

// API 로그 상세용 응답 (전체 정보)
export interface ApiLogDetailResponse {
    id: number;
    userId: number | null;
    userRole: string | null;
    method: string;
    path: string;
    queryString: string | null;
    statusCode: number;
    result: Result;
    ipAddress: string | null;
    userAgent: string | null;
    executionTimeMs: number;
    errorCode: string | null;
    errorMessage: string | null;
    createdAt: string;
}

export interface GetApiLogsParams {
    keyword?: string;
    result?: string;
    statusCode?: number;
    method?: string;
    page?: number;
    size?: number;
    sort?: string;
}


// 책 목록용 응답
export interface BookListResponse {
    id: number;
    title: string;
    author: string;
    publisher: string;
    coverUrl: string | null;
    createdAt: string;
}

// 책 상세용 응답
export interface BookDetailResponse {
    id: number;
    title: string;
    author: string;
    publisher: string;
    isbn10: string | null;
    isbn13: string | null;
    publishedDate: string | null;
    coverUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
}
export interface GetBooksParams {
    keyword?: string;
    includeDeleted?: boolean;
    page?: number;
    size?: number;
    sort?: string;
}
