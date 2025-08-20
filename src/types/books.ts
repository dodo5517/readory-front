export type BookCandidate = {
    source: "KAKAO" | "NAVER" | "GOOGLE" | string;
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
}

export type BookMeta = {
    id: number;
    title: string;
    author: string;
    publisher: string | null;
    publishedDate: string | null;
    coverUrl: string | null;
}

export type PageResponse<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;         // 페이지 크기
    number: number;       // 현재 페이지(0-base)
    first: boolean;
    last: boolean;
    numberOfElements: number;
};

export type PageResult<T> = {
    books: T[];              // 화면용 데이터
    page: number;            // 0-base
    size: number;
    totalPages: number;
    totalElements: number;
    hasPrev: boolean;
    hasNext: boolean;
};