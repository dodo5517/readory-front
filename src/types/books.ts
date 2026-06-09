export type BookCandidate = {
    source: "KAKAO" | "NAVER" | "GOOGLE" | "LOCAL" | string;
    externalId?: string; // 상세 링크
    title: string;
    author?: string;
    isbn10?: string | null;
    isbn13?: string | null;
    publisher?: string | null;
    publishedDate?: string | null; // "YYYY-MM-DD"
    thumbnailUrl?: string | null;
    score?: number | null;
};

export type ConfirmedBook = {
    id: number;
    title: string;
    author: string;
    isbn10?: string;
    isbn13?: string;
    coverUrl: string;
    lastRecordAt: string;
}

export type SummaryBook = {
    id: number;
    title: string;
    author: string;
    coverUrl: string;
    year: number | null;
    pinned: boolean;
};

export type BookMeta = {
    id: number;
    title: string;
    author: string;
    publisher: string | null;
    publishedDate: string | null;
    coverUrl: string | null;
    periodStart: string;
    periodEnd: string;
}

export type PageResponse<T> = {
    content: T[];
    page: number;          // 0-base (구 number)
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

export type PageResult<T> = {
    items: T[];              // 화면용 데이터
    page: number;            // 0-base
    size: number;
    totalPages: number;
    totalElements: number;
    hasPrev: boolean;
    hasNext: boolean;
};
export type BookComment = {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
};