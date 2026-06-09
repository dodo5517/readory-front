import { fetchWithAuth } from "../utils/fetchWithAuth";
import { unwrap } from "../utils/apiResponse";
import {NoticeResponse} from "../types/notice";

// 공개 조회 - 인증 불필요
export async function getActiveNotice(): Promise<NoticeResponse | null> {
    try {
        const res = await fetchWithAuth("/notice");
        return (await unwrap<NoticeResponse | null>(res)) ?? null;
    } catch {
        return null;
    }
}

// 관리자: 현재 공지 조회
export async function getNoticeForAdmin(): Promise<NoticeResponse | null> {
    const res = await fetchWithAuth("/admin/notice", { method: "GET" });
    try {
        return (await unwrap<NoticeResponse | null>(res)) ?? null;
    } catch {
        return null;
    }
}

// 관리자: 전체 이력 조회
export async function getAllNotices(): Promise<NoticeResponse[]> {
    const res = await fetchWithAuth("/admin/notices", { method: "GET" });
    return unwrap<NoticeResponse[]>(res);
}

// 관리자: 기존 공지 수정
export async function updateNotice(id: number, data: {
    message?: string;
    enabled?: boolean;
}): Promise<NoticeResponse> {
    const res = await fetchWithAuth(`/admin/notice/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return unwrap<NoticeResponse>(res);
}

// 관리자: 새 공지 추가 (이전 건 자동 비활성화)
export async function createNotice(data: {
    message: string;
    enabled?: boolean;
}): Promise<NoticeResponse> {
    const res = await fetchWithAuth("/admin/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return unwrap<NoticeResponse>(res);
}
