
export type MatchStatus = "PENDING" | "RESOLVED_AUTO" | "RESOLVED_MANUAL" | "NO_CANDIDATE" | "MULTIPLE_CANDIDATES";

// 목록용 응답
export interface AdminRecordListResponse {
    id: number;
    username: string;
    rawTitle: string;
    rawAuthor: string;
    sentence: string | null;
    matchStatus: MatchStatus;
    recordedAt: string;
}

// 상세용 응답
export interface AdminRecordDetailResponse {
    id: number;
    // 유저 정보
    userId: number;
    username: string;
    userEmail: string;
    // 책 정보 (매칭된 경우)
    bookId: number | null;
    bookTitle: string | null;
    bookAuthor: string | null;
    bookCoverUrl: string | null;
    // 원본 입력값
    rawTitle: string;
    rawAuthor: string;
    // 기록 내용
    sentence: string | null;
    comment: string | null;
    // 상태 및 시간
    matchStatus: MatchStatus;
    recordedAt: string;
    updatedAt: string | null;
    matchedAt: string | null;
}

// 수정 요청
export interface AdminRecordUpdateRequest {
    rawTitle?: string;
    rawAuthor?: string;
    sentence?: string;
    comment?: string;
}

export interface GetRecordsParams {
    keyword?: string;
    matchStatus?: string;
    userId?: number;
    page?: number;
    size?: number;
    sort?: string;
}