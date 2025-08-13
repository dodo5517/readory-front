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