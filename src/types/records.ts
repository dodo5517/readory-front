export interface Record {
    id: number;
    title: string;
    author: string;
    sentence: string | null;
    comment: string | null;
    matched: boolean;
    bookId: number | null;
    recordedAt: string; // ISO 문자열
}

export interface SummaryRecord {
    id: number;
    date: string;     // "YYYY.MM.DD HH:mm"
    title: string;
    sentence: string;
    comment: string;
}
