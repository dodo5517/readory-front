export type MatchStatus =
    | "PENDING"
    | "RESOLVED_AUTO"
    | "RESOLVED_MANUAL"
    | "NO_CANDIDATE"
    | "MULTIPLE_CANDIDATES";

// 목록용 응답 - sentence, comment 제거
export interface AdminRecordListResponse {
    id: number;
    userId: number;
    username: string;
    rawTitle: string;
    rawAuthor: string;
    matchStatus: MatchStatus;
    createdAt: string;
}

// 상세용 응답 - sentence, comment 제거
export interface AdminRecordDetailResponse {
    id: number;
    userId: number;
    username: string;
    userEmail: string;
    bookId: number | null;
    bookTitle: string | null;
    bookAuthor: string | null;
    bookCoverUrl: string | null;
    rawTitle: string;
    rawAuthor: string;
    matchStatus: MatchStatus;
    createdAt: string;
    recordedAt: string | null;
    updatedAt: string | null;
    matchedAt: string | null;
}

// 수정 요청 - sentence, comment 제거
export interface AdminRecordUpdateRequest {
    rawTitle?: string;
    rawAuthor?: string;
}

// userId 필수
export interface GetRecordsParams {
    userId: number;
    keyword?: string;
    matchStatus?: string;
    page?: number;
    size?: number;
    sort?: string;
}

// 통계
export interface AdminRecordStatsResponse {
    totalRecords: number;
    todayRecords: number;
    pendingCount: number;
    resolvedAutoCount: number;
    resolvedManualCount: number;
    noCandidateCount: number;
    multipleCandidatesCount: number;
    dailyCounts: { date: string; count: number }[];
    activeUsersLast7Days: number;
    activeUsersLast30Days: number;
}

// 유저 활동 현황
export interface AdminUserActivityResponse {
    userId: number;
    username: string;
    userEmail: string;
    totalRecords: number;
    lastRecordedAt: string;
}

// 책 통계
export interface TopBook {
    bookId: number;
    title: string;
    author: string;
    coverUrl: string | null;
    recordCount: number;
}

export interface AdminBookStatsResponse {
    topByRecordCount: TopBook[];
}