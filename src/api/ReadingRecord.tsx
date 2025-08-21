import { fetchWithAuth } from "../utils/fetchWithAuth";
import {BookRecord, BookRecordsPage, Record, SummaryRecord} from "../types/records";
import { formatYMDhm } from "../utils/datetime";
import {BookCandidate, BookMeta, PageResponse, PageResult, SummaryBook} from "../types/books";
import {CalendarRangeResponse, CalendarSummary, DayCount} from "../types/calendar";

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
export async function fetchMyRecords(opts: {
    page: number;
    size?: number;
    q?: string
}): Promise<PageResult<Record>> {
    const { page, size, q } = opts;

    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
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
        recordedAt: formatYMDhm(r.recordedAt), // "YYYY-MM-DD HH:mm" 같은 포맷
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

// 책 매칭 취소
export async function fetchRemoveMatch(recordId : number): Promise<void> {
    const response = await fetchWithAuth(`/records/${recordId}/remove`, { method: "POST" });

    if (!response) {
        throw new Error("책 매칭 취소 실패");
    }
}

// 해당 유저의 책 한 권에 대한 모든 기록 불러오기
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
        recordedAt: r.recordedAt,     // "YYYY.MM.DD HH:mm"
        sentence: r.sentence,
        comment: r.comment,
    }));

    return {
        book,
        content,
        nextCursor: data.nextCursor,
        hasMore: data.hasMore
    };
}

export async function fetchCalendarRange(year: number, month: number)
    : Promise<CalendarRangeResponse> {

    const normalizedMonth =
        month >= 1 && month <= 12 ? month : month >= 0 && month <= 11 ? month + 1 : (() => {
            throw new Error(`잘못된 month 값: ${month}`);
        })();

    // Url 매개변수 설정
    const params = new URLSearchParams({
        year: String(year),
        month: String(normalizedMonth),
    }).toString();

    const response = await fetchWithAuth(`/records/calendar?${params}`, { method: "GET" });
    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    const data = await response.json();

    const days: DayCount[] = data.days.map((d: any) =>({
        date: d.date,
        count: d.count,
    }));

    const summary : CalendarSummary = {
        totalDaysWithRecord: data.summary.totalDaysWithRecord,
        totalRecords: data.summary.totalRecords,
        firstRecordedAt: data.summary.firstRecordedAt,
        lastRecordedAt: data.summary.lastRecordedAt
    }

    return {
        rangeStart: data.rangeStart,
        rangeEndExclusive: data.rangeEndExclusive,
        days: days,
        summary: summary
    };
}