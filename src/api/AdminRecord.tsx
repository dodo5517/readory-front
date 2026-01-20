// 전체 기록 목록 조회
import {
    AdminRecordDetailResponse,
    AdminRecordListResponse,
    AdminRecordUpdateRequest,
    GetRecordsParams
} from "../types/adminRecord";
import {PageResponse} from "../types/books";
import {fetchWithAuth} from "../utils/fetchWithAuth";

export async function getRecords(params: GetRecordsParams = {}): Promise<PageResponse<AdminRecordListResponse>> {
    const query = new URLSearchParams();

    if (params.keyword) query.append("keyword", params.keyword);
    if (params.matchStatus) query.append("matchStatus", params.matchStatus);
    if (params.userId !== undefined) query.append("userId", String(params.userId));
    if (params.page !== undefined) query.append("page", String(params.page));
    if (params.size !== undefined) query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);

    const response = await fetchWithAuth(`/admin/records?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("기록 목록 조회 실패");
    }

    return await response.json();
}

// 특정 기록 상세 조회
export async function getRecord(id: number): Promise<AdminRecordDetailResponse> {
    const response = await fetchWithAuth(`/admin/records/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("기록 상세 조회 실패");
    }

    return await response.json();
}

// 기록 수정
export async function updateRecord(id: number, data: AdminRecordUpdateRequest): Promise<AdminRecordDetailResponse> {
    const response = await fetchWithAuth(`/admin/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("기록 수정 실패");
    }

    return await response.json();
}

// 기록 삭제
export async function deleteRecord(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/records/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("기록 삭제 실패");
    }
}
