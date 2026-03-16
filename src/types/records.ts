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
    createdAt: string; // ISO 문자열
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
}

export interface CreateRecordRequest {
    rawTitle?: string | null;
    rawAuthor?: string | null;
    sentence?: string | null;
    comment?: string | null;
}


export interface BookRecord {
    id: number;
    createdAt: string;
    sentence: string | null;
    comment: string | null;
}

export type BookRecordsPage<T, A> = {
    book: T;
    bookComment: BookComment | null;
    content: A[];
    nextCursor: string | null;
    hasMore: boolean;
}