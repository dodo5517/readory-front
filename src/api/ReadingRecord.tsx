import { fetchWithAuth } from "../utils/fetchWithAuth";
import { unwrap, unwrapVoid } from "../utils/apiResponse";
import {BookRecord, BookRecordsPage, CreateRecordRequest, Record, SummaryRecord, UpdateRecord} from "../types/records";
import { formatYMDhm } from "../utils/datetime";
import {BookCandidate, BookComment, BookMeta, PageResponse, PageResult, SummaryBook} from "../types/books";


// 웹에서 독서 메모 추가
export async function createReadingRecord(req: CreateRecordRequest ) {
    const response = await fetchWithAuth("/records/web", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
    });

    await unwrapVoid(response);
    return null;
}


// 메인에 쓸 최근 3개의 메모 조회
export async function fetchMySummaryRecords(): Promise<SummaryRecord[]> {
    const response = await fetchWithAuth(`/records/me/summary`, { method: "GET" });

    const data = await unwrap<Record[]>(response);

    return data
        .map((r) => ({
            id: r.id,
            date: formatYMDhm(r.recordedAt),
            title: r.title || "(제목 없음)",
            sentence: r.sentence ?? "",
            comment: r.comment ?? "",
        }));
}

// 해당 유저의 모든 기록 조회
export async function fetchMyRecords(opts: {
    page: number;
    size?: number;
    scope?: "titleAndAuthor" | "sentenceAndComment";
    q?: string
}): Promise<PageResult<Record>> {
    const { page, size, scope, q } = opts;

    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        scope: String(scope),
    });
    if (q && q.trim()) params.set("q", q.trim());

    const response = await fetchWithAuth(`/records/me?${params.toString()}`, { method: "GET" });

    const pageData = await unwrap<PageResponse<any>>(response);
    console.log(pageData);

    const items: Record[] = (pageData.content ?? []).map((r: any) => ({
        id: r.id,
        title: r.title ?? "(제목 없음)",
        author: r.author ?? null,
        sentence: r.sentence ?? null,
        comment: r.comment ?? null,
        matched: Boolean(r.matched),
        bookId: r.bookId ?? null,
        coverUrl: r.coverUrl ?? null,
        recordedAt: formatYMDhm(r.recordedAt),
    }));

    return {
        items,
        page: pageData.page ?? page,
        size: pageData.size ?? size,
        totalPages: pageData.totalPages ?? 0,
        totalElements: pageData.totalElements ?? items.length,
        hasPrev: (pageData.page ?? page) > 0,
        hasNext: !(pageData.last ?? false),
    };
}

// 메인에 쓸 최근 8개의 책(매핑된) 조회
export async function fetchMySummaryBooks(): Promise<SummaryBook[]> {
    const response = await fetchWithAuth(`/records/me/books/main?size=8`, { method: "GET" });

    const pageData = await unwrap<PageResponse<SummaryBook>>(response);
    console.log(pageData);

    return pageData.content
        .map((b: SummaryBook) => ({
            id: b.id,
            title: b.title || "(제목 없음)",
            author: b.author ?? "",
            coverUrl: b.coverUrl ?? "",
            year: b.year ?? null,
            pinned: b.pinned ?? false,
        }));
}

// 해당 유저가 기록한 모든 책(매핑된) 조회
export async function fetchMyBooks(opts: {
    page: number;
    size?: number;
    sort?: "recent" | "title";
    q?: string;
}): Promise<PageResult<SummaryBook>> {
    const { page, size, sort = "recent", q } = opts;
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort,
    });
    if (q && q.trim()) params.set("q", q.trim());

    const response = await fetchWithAuth(`/records/me/books?${params.toString()}`, { method: "GET" });

    const pageData = await unwrap<PageResponse<any>>(response);
    console.log(pageData);

    const items: SummaryBook[] = pageData.content.map((b: any) => ({
        id: b.id,
        title: b.title || "(제목 없음)",
        author: b.author ?? "",
        coverUrl: b.coverUrl ?? "",
        year: b.year ?? null,
        pinned: b.pinned ?? false,
    }));

    return {
        items,
        page: pageData.page ?? page,
        size: pageData.size ?? size,
        totalPages: pageData.totalPages ?? 0,
        totalElements: pageData.totalElements ?? items.length,
        hasPrev: (pageData.page ?? page) > 0,
        hasNext: !(pageData.last ?? false),
    };
}

// 로컬에서 책 후보 요청
export async function fetchCandidatesLocal(rawTitle : string, rawAuthor: string): Promise<BookCandidate[]> {
    const params = new URLSearchParams({ rawTitle, rawAuthor }).toString();

    const response = await fetchWithAuth(`/books/candidates/local?${params}`, { method: "GET" });

    const bookCandidates = await unwrap<BookCandidate[]>(response);
    console.log(bookCandidates);

    return bookCandidates;
}

// 외부에서 책 후보 요청
export async function fetchCandidatesExternal(rawTitle : string, rawAuthor: string): Promise<BookCandidate[]> {
    const params = new URLSearchParams({ rawTitle, rawAuthor }).toString();

    const response = await fetchWithAuth(`/books/candidates/external?${params}`, { method: "GET" });

    const bookCandidates = await unwrap<BookCandidate[]>(response);
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

    await unwrapVoid(response);
}

// 책 매칭 취소
export async function fetchRemoveMatch(recordId : number): Promise<void> {
    const response = await fetchWithAuth(`/records/${recordId}/remove`, { method: "POST" });
    await unwrapVoid(response);
}

// 해당 유저의 책 한 권에 대한 모든 기록 조회
export async function fetchBookRecords(bookId: number, cursor: string|null, size: number|null):
    Promise<BookRecordsPage<BookMeta, BookRecord>> {

    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (size != null) params.set("size", String(size));
    const url = `/records/books/${bookId}${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetchWithAuth(url, {method: "GET"});

    const data = await unwrap<BookRecordsPage<BookMeta, BookRecord>>(response);
    console.log(data);

    const book: BookMeta = {
        id: data.book.id,
        title: data.book.title,
        author: data.book.author,
        publisher: data.book.publisher,
        publishedDate: data.book.publishedDate,
        coverUrl: data.book.coverUrl,
        periodStart: data.book.periodStart,
        periodEnd: data.book.periodEnd
    };

    const content: BookRecord[] = data.content.map((r: any) => ({
        id: r.id,
        recordedAt: r.recordedAt,
        sentence: r.sentence,
        comment: r.comment,
    }));

    const bookComment = data.bookComment ?? null;

    return {
        book,
        bookComment,
        content,
        nextCursor: data.nextCursor,
        hasMore: data.hasMore
    };
}

// 기록 수정
export async function fetchUpdateRecord(recordId: number, record : UpdateRecord ): Promise<void> {
    const response = await fetchWithAuth(`/records/update/${recordId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            rawTitle: record.rawTitle,
            rawAuthor: record.rawAuthor,
            sentence: record.sentence,
            comment: record.comment,
            recordedAt: record.recordedAt ?? null,
        })
    });

    await unwrapVoid(response);
}

// 기록 삭제
export async function fetchDeleteRecord(recordId: number): Promise<void> {
    const response = await fetchWithAuth(`/records/delete/${recordId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });

    await unwrapVoid(response);
}

// 해당 책의 모든 기록 삭제
export async function fetchDeleteBook(bookId: number): Promise<void> {
    const response = await fetchWithAuth(`/records/delete/books/${bookId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    await unwrapVoid(response);
}

// 책 즐겨찾기 등록
export async function fetchPinBook(bookId: number): Promise<void> {
    const response = await fetchWithAuth(`/books/${bookId}/pin`, { method: "POST" });
    await unwrapVoid(response);
}

// 책 즐겨찾기 해제
export async function fetchUnpinBook(bookId: number): Promise<void> {
    const response = await fetchWithAuth(`/books/${bookId}/pin`, { method: "DELETE" });
    await unwrapVoid(response);
}

// 책 감상 저장/수정 (upsert)
export async function upsertBookComment(bookId: number, content: string): Promise<BookComment> {
    const response = await fetchWithAuth(`/records/books/${bookId}/comment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    return unwrap<BookComment>(response);
}

// 책 감상 삭제
export async function deleteBookComment(bookId: number): Promise<void> {
    const response = await fetchWithAuth(`/records/books/${bookId}/comment`, { method: 'DELETE' });
    await unwrapVoid(response);
}
