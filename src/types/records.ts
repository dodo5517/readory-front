import {BookComment} from "./books";

export interface Record {
    id: number;
    title: string;
    author: string;
    sentence: string | null;
    comment: string | null;
    matched: boolean;
    bookId: number | null;
    coverUrl: string | null;
    recordedAt: string;
}

export interface SummaryRecord {
    id: number;
    date: string;     // "YYYY.MM.DD HH:mm"
    title: string;
    sentence: string;
    comment: string;
}

export interface UpdateRecord {
    rawTitle: string;
    rawAuthor: string;
    sentence: string | null;
    comment: string | null;
    recordedAt?: string | null;
}

export interface CreateRecordRequest {
    rawTitle?: string | null;
    rawAuthor?: string | null;
    sentence?: string | null;
    comment?: string | null;
    recordedAt?: string | null;
}


export type HighlightColor = "GREEN" | "PEACH";

export interface Highlight {
    id: number;
    start: number;   // sentence 기준 시작(포함)
    end: number;     // sentence 기준 끝(미포함)
    color: HighlightColor;
}

export interface BookRecord {
    id: number;
    recordedAt: string;
    sentence: string | null;
    comment: string | null;
    highlights: Highlight[];
}

export type BookRecordsPage<T, A> = {
    book: T;
    bookComment: BookComment | null;
    content: A[];
    nextCursor: string | null;
    hasMore: boolean;
}