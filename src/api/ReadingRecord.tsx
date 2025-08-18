import { fetchWithAuth } from "../utils/fetchWithAuth";
import { Record, SummaryRecord } from "../types/records";
import { formatYMDhm } from "../utils/datetime";
import {BookCandidate, PageResponse, PageResult, SummaryBook} from "../types/books";

// 메인에 쓸 최근 3개의 메모 불러오기
export async function fetchMySummaryRecords(): Promise<SummaryRecord[]> {
    const response = await fetchWithAuth(`/records/me/summary`, { method: "GET" });
    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    const data: Record[] = await response.json();

    // 화면용으로 매핑
    return data
        .map((r) => ({
            id: r.id,
            date: formatYMDhm(r.recordedAt),
            title: r.title || "(제목 없음)",
            sentence: r.sentence ?? "",
            comment: r.comment ?? "",
        }));
}

// 해당 유저의 모든 기록 불러오기
export async function fetchMyRecords(): Promise<Record[]> {
    const response = await fetchWithAuth(`/records/me`, { method: "GET" });
    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    const pageData = await response.json(); // Page 객체
    console.log(pageData);

    // content만 꺼내서 recordedAt 변환
    return pageData.content.map((r: Record) => ({
        ...r,
        recordedAt: formatYMDhm(r.recordedAt),
    }));
}

// 메인에 쓸 최근 8개의 책(매핑된) 불러오기
export async function fetchMySummaryBooks(): Promise<SummaryBook[]> {
    const response = await fetchWithAuth(`/records/me/books?size=8`, { method: "GET" });
    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    const pageData = await response.json(); // Page 객체
    console.log(pageData);

    // content만 꺼내서 화면용으로 매핑
    return pageData.content
        .map((b:SummaryBook) => ({
            id: b.id,
            title: b.title || "(제목 없음)",
            author: b.author ?? "",
            coverUrl: b.coverUrl ?? "",
        }));
}

// 해당 유저가 기록한 모든 책(매핑된) 불러오기
export async function fetchMyBooks(opts: {
    page: number;          // 0-base
    size?: number;         // 서버에서 default 20임
    sort?: "recent" | "title";
    q?: string;
}): Promise<PageResult<SummaryBook>> {
    const { page, size = 8, sort = "recent", q } = opts;
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort,
    });
    if (q && q.trim()) params.set("q", q.trim());

    const response = await fetchWithAuth(`/records/me/books?${params.toString()}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    const pageData: PageResponse<any> = await response.json(); // Page 객체
    console.log(pageData);

    // 책 정보만 저장
    const books: SummaryBook[] = pageData.content.map((b: any) => ({
        id: b.id,
        title: b.title || "(제목 없음)",
        author: b.author ?? "",
        coverUrl: b.coverUrl ?? "",
    }));

    // PageResult로 매핑
    return {
        books,
        page: pageData.number ?? page,
        size: pageData.size ?? size,
        totalPages: pageData.totalPages ?? 0,
        totalElements: pageData.totalElements ?? books.length,
        hasPrev: !(pageData.first ?? page === 0),
        hasNext: !(pageData.last ?? page + 1 >= (pageData.totalPages ?? 0)),
    };
}

// 책 후보 요청
export async function fetchCandidates(rawTitle : string, rawAuthor: string): Promise<BookCandidate[]> {
    const params = new URLSearchParams({
        rawTitle,
        rawAuthor,
    }).toString();

    const response = await fetchWithAuth(`/books/candidates?${params}`, { method: "GET" });

    if (!response.ok) {
        throw new Error("책 후보 요청 실패");
    }

    const bookCandidates = await response.json() as BookCandidate[];
    console.log(bookCandidates);

    return bookCandidates;
}

// 기록-책 연결
export async function linkRecord(recordId: number, book: BookCandidate):Promise<void> {
    console.log("author:", book.author);
    const response = await fetchWithAuth(`/records/${recordId}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: book.title,
            author: book.author ?? [],
            isbn10: book.isbn10 ?? null,
            isbn13: book.isbn13 ?? null,
            publisher: book.publisher ?? null,
            publishedDate: book.publishedDate ?? null,
            source: book.source ?? null,
            externalId: book.externalId ?? null,
            coverUrl: book.thumbnailUrl ?? null,
        })
    });

    if (!response.ok) {
        throw new Error("기록과 연결 실패");
    }
}