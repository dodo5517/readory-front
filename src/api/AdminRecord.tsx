import {
    AdminRecordDetailResponse,
    AdminRecordListResponse,
    AdminRecordStatsResponse,
    AdminRecordUpdateRequest,
    AdminUserActivityResponse,
    GetRecordsParams,
} from "../types/adminRecord";
import { PageResponse } from "../types/books";
import { fetchWithAuth } from "../utils/fetchWithAuth";

// 특정 유저의 기록 목록 조회 (userId 필수)
export async function getRecords(
    params: GetRecordsParams
): Promise<PageResponse<AdminRecordListResponse>> {
    const query = new URLSearchParams();

    query.append("userId", String(params.userId));
    if (params.keyword) query.append("keyword", params.keyword);
    if (params.matchStatus) query.append("matchStatus", params.matchStatus);
    if (params.page !== undefined) query.append("page", String(params.page));
    if (params.size !== undefined) query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);

    const response = await fetchWithAuth(`/admin/records?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) throw new Error("기록 목록 조회 실패");
    return response.json();
}

// 특정 기록 상세 조회
export async function getRecord(id: number): Promise<AdminRecordDetailResponse> {
    const response = await fetchWithAuth(`/admin/records/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) throw new Error("기록 상세 조회 실패");
    return response.json();
}

// 기록 수정
export async function updateRecord(
    id: number,
    data: AdminRecordUpdateRequest
): Promise<AdminRecordDetailResponse> {
    const response = await fetchWithAuth(`/admin/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!response.ok) throw new Error("기록 수정 실패");
    return response.json();
}

// 기록 삭제
export async function deleteRecord(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/records/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) throw new Error("기록 삭제 실패");
}

// 통계 조회
export async function getStats(): Promise<AdminRecordStatsResponse> {
    const response = await fetchWithAuth("/admin/records/stats", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) throw new Error("통계 조회 실패");
    return response.json();
}

// 유저 활동 현황
export async function getUserActivity(
    page = 0,
    size = 20
): Promise<PageResponse<AdminUserActivityResponse>> {
    const query = new URLSearchParams({
        page: String(page),
        size: String(size),
    });

    const response = await fetchWithAuth(`/admin/records/user-activity?${query}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) throw new Error("유저 활동 현황 조회 실패");
    return response.json();
}