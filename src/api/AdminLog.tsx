import { fetchWithAuth } from "../utils/fetchWithAuth";
import {PageResponse} from "../types/books";
import {
    ApiLogDetailResponse,
    ApiLogListResponse,
    GetApiLogsParams,
    GetLogsParams,
    LogDetailResponse,
    LogListResponse
} from "../types/adminLog";

// 전체 인증 로그 조회 (목록)
export async function getLogs(params: GetLogsParams = {}): Promise<PageResponse<LogListResponse>> {
    const query = new URLSearchParams();

    if (params.keyword) query.append("keyword", params.keyword);
    if (params.type) query.append("type", params.type);
    if (params.result) query.append("result", params.result);
    if (params.page !== undefined) query.append("page", String(params.page));
    if (params.size !== undefined) query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);

    const response = await fetchWithAuth(`/admin/auth/logs?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("로그 목록 조회 실패");
    }

    return await response.json();
}

// 특정 인증 로그 상세 조회
export async function getLogDetail(id: number): Promise<LogDetailResponse> {
    const response = await fetchWithAuth(`/admin/auth/logs/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("로그 상세 조회 실패");
    }

    return await response.json();
}

// 전체 API 로그 조회 (목록)
export async function getApiLogs(params: GetApiLogsParams = {}): Promise<PageResponse<ApiLogListResponse>> {
    const query = new URLSearchParams();

    if (params.keyword) query.append("keyword", params.keyword);
    if (params.result) query.append("result", params.result);
    if (params.statusCode !== undefined) query.append("statusCode", String(params.statusCode));
    if (params.method) query.append("method", params.method);
    if (params.page !== undefined) query.append("page", String(params.page));
    if (params.size !== undefined) query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);

    const response = await fetchWithAuth(`/admin/api/logs?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("API 로그 목록 조회 실패");
    }

    return await response.json();
}

// 특정 API 로그 상세 조회
export async function getApiLogDetail(id: number): Promise<ApiLogDetailResponse> {
    const response = await fetchWithAuth(`/admin/api/logs/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("API 로그 상세 조회 실패");
    }

    return await response.json();
}