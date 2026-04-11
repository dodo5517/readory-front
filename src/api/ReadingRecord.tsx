import { fetchWithAuth } from "../utils/fetchWithAuth";
import {BookRecord, BookRecordsPage, CreateRecordRequest, Record, SummaryRecord, UpdateRecord} from "../types/records";
import { formatYMDhm } from "../utils/datetime";
import {BookCandidate, BookMeta, PageResponse, PageResult, SummaryBook} from "../types/books";


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

    if (!response.ok) {
        throw new Error("독서 기록 생성 실패");
    }

    return null;
}


// 메인에 쓸 최근 3개의 메모 조회
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
            date: formatYMDhm(r.createdAt),
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
    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    const pageData: PageResponse<any> = await response.json(); // Page 객체
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
        createdAt: formatYMDhm(r.createdAt), // "YYYY-MM-DD HH:mm" 같은 포맷
    }));

    return {
        items,
        page: pageData.number ?? page,
        size: pageData.size ?? size,
        totalPages: pageData.totalPages ?? 0,
        totalElements: pageData.totalElements ?? items.length,
        hasPrev: !(pageData.first ?? page === 0),
        hasNext: !(pageData.last ?? page + 1 >= (pageData.totalPages ?? 0)),
    };
}

// 메인에 쓸 최근 8개의 책(매핑된) 조회
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

// 해당 유저가 기록한 모든 책(매핑된) 조회
export async function fetchMyBooks(opts: {
    page: number;          // 0-base
    size?: number;         // 서버에서 default 20임
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
    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    const pageData: PageResponse<any> = await response.json(); // Page 객체
    console.log(pageData);

    // 책 정보만 저장
    const items: SummaryBook[] = pageData.content.map((b: any) => ({
        id: b.id,
        title: b.title || "(제목 없음)",
        author: b.author ?? "",
        coverUrl: b.coverUrl ?? "",
        year: b.year ?? null,
        pinned: b.pinned ?? false,
    }));

    // PageResult로 매핑
    return {
        items,
        page: pageData.number ?? page,
        size: pageData.size ?? size,
        totalPages: pageData.totalPages ?? 0,
        totalElements: pageData.totalElements ?? items.length,
        hasPrev: !(pageData.first ?? page === 0),
        hasNext: !(pageData.last ?? page + 1 >= (pageData.totalPages ?? 0)),
    };
}

// 로컬에서 책 후보 요청(없으면 외부에서 찾아옴.)
export async function fetchCandidatesLocal(rawTitle : string, rawAuthor: string): Promise<BookCandidate[]> {
    const params = new URLSearchParams({
        rawTitle,
        rawAuthor,
    }).toString();

    const response = await fetchWithAuth(`/books/candidates/local?${params}`, { method: "GET" });

    if (!response.ok) {
        throw new Error("책 후보 요청 실패");
    }

    const bookCandidates = await response.json() as BookCandidate[];
    console.log(bookCandidates);

    return bookCandidates;
}

// 외부에서 책 후보 요청
export async function fetchCandidatesExternal(rawTitle : string, rawAuthor: string): Promise<BookCandidate[]> {
    const params = new URLSearchParams({
        rawTitle,
        rawAuthor,
    }).toString();

    const response = await fetchWithAuth(`/books/candidates/external?${params}`, { method: "GET" });

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

// 책 매칭 취소
export async function fetchRemoveMatch(recordId : number): Promise<void> {
    const response = await fetchWithAuth(`/records/${recordId}/remove`, { method: "POST" });

    if (!response) {
        throw new Error("책 매칭 취소 실패");
    }
}

// 해당 유저의 책 한 권에 대한 모든 기록 조회
export async function fetchBookRecords(bookId: number, cursor: string|null, size: number|null):
    Promise<BookRecordsPage<BookMeta, BookRecord>> {

    // Url 매개변수 설정
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (size != null) params.set("size", String(size));
    const url = `/records/books/${bookId}${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetchWithAuth(url, {method: "GET"});
    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    const data: BookRecordsPage<BookMeta, BookRecord> = await response.json();
    console.log(data);

    // 책 정보 저장
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

    // 기록 저장
    const content: BookRecord[] = data.content.map((r: any) => ({
        id: r.id,
        createdAt: r.createdAt,     // "YYYY.MM.DD HH:mm"
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
        })
    });

    if (!response.ok) {
        throw new Error("기록 수정 실패");
    }
}

// 기록 삭제
export async function fetchDeleteRecord(recordId: number): Promise<void> {
    const response = await fetchWithAuth(`/records/delete/${recordId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        throw new Error("기록 삭제 실패");
    }
}

// 해당 책의 모든 기록 삭제
export async function fetchDeleteBook(bookId: number): Promise<void> {
    const response = await fetchWithAuth(`/records/delete/books/${bookId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
        throw new Error("기록 삭제 실패");
    }
}
// 책 즐겨찾기 등록
export async function fetchPinBook(bookId: number): Promise<void> {
    const response = await fetchWithAuth(`/books/${bookId}/pin`, { method: "POST" });
    if (!response.ok) throw new Error("즐겨찾기 등록 실패");
}

// 책 즐겨찾기 해제
export async function fetchUnpinBook(bookId: number): Promise<void> {
    const response = await fetchWithAuth(`/books/${bookId}/pin`, { method: "DELETE" });
    if (!response.ok) throw new Error("즐겨찾기 해제 실패");
}

// 책 감상 조회
// export async function fetchBookComment(bookId: number): Promise<{ id: number; content: string; createdAt: string; updatedAt: string } | null> {
//     const response = await fetchWithAuth(`/records/books/${bookId}/comment`, { method: 'GET' });
//     if (response.status === 204) return null;
//     if (!response.ok) throw new Error('감상 조회 실패');
//     return response.json();
// }

// 책 감상 저장/수정 (upsert)
export async function upsertBookComment(bookId: number, content: string): Promise<{ id: number; content: string; createdAt: string; updatedAt: string }> {
    const response = await fetchWithAuth(`/records/books/${bookId}/comment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('감상 저장 실패');
    return response.json();
}

// 책 감상 삭제
export async function deleteBookComment(bookId: number): Promise<void> {
    const response = await fetchWithAuth(`/records/books/${bookId}/comment`, { method: 'DELETE' });
    if (!response.ok) throw new Error('감상 삭제 실패');
}