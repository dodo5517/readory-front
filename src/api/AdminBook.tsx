import {PageResponse} from "../types/books";
import {BookDetailResponse, BookListResponse, GetBooksParams} from "../types/adminLog";
import {fetchWithAuth} from "../utils/fetchWithAuth";

export async function getBooks(params: GetBooksParams = {}): Promise<PageResponse<BookListResponse>> {
    const query = new URLSearchParams();

    if (params.keyword) query.append("keyword", params.keyword);
    if (params.includeDeleted !== undefined) query.append("includeDeleted", String(params.includeDeleted));
    if (params.page !== undefined) query.append("page", String(params.page));
    if (params.size !== undefined) query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);

    const response = await fetchWithAuth(`/admin/books?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("책 목록 조회 실패");
    }

    return await response.json();
}

// 특정 책 상세 조회
export async function getBook(id: number): Promise<BookDetailResponse> {
    const response = await fetchWithAuth(`/admin/books/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("책 상세 조회 실패");
    }

    return await response.json();
}

// 책 소프트 삭제
export async function softDeleteBook(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/books/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("책 삭제 실패");
    }
}

// 책 영구 삭제
export async function hardDeleteBook(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/books/${id}/permanent`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("책 영구 삭제 실패");
    }
}

// 삭제된 책 복구
export async function restoreBook(id: number): Promise<void> {
    const response = await fetchWithAuth(`/admin/books/${id}/restore`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("책 복구 실패");
    }
}