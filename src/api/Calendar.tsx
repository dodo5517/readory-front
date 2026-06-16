import {CalendarRangeResponse, CalendarSummary, DayCount} from "../types/calendar";
import {fetchWithAuth} from "../utils/fetchWithAuth";
import { unwrap } from "../utils/apiResponse";
import {PageResponse, PageResult} from "../types/books";
import {Record} from "../types/records";
import {formatYMDhm} from "../utils/datetime";

// 한 달간 기록한 날짜 조회
export async function fetchCalendarRange(year: number, month: number)
    : Promise<CalendarRangeResponse> {

    const params = new URLSearchParams({
        year: String(year),
        month: String(month),
    }).toString();

    const response = await fetchWithAuth(`/records/calendar?${params}`, { method: "GET" });

    const data = await unwrap<CalendarRangeResponse>(response);

    const days: DayCount[] = data.days.map((d: any) =>({
        date: d.date,
        count: d.count,
        coverUrl: d.coverUrl ?? null,
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

// 한 달 기록 불러오기
export async function fetchMyMonth(opts: {
    year: number;
    month: number;
    page: number;
    sort?: "asc" | "desc";
    size?: number;
    q?: string
}): Promise<PageResult<Record>> {
    const { year, month, page, sort, size, q } = opts;

    const params = new URLSearchParams({
        year: String(year),
        month: String(month),
        page: String(page),
        sort: String(sort),
        size: String(size),
    });
    if (q && q.trim()) params.set("q", q.trim());

    const response = await fetchWithAuth(`/records/month?${params.toString()}`, { method: "GET" });

    const pageData = await unwrap<PageResponse<any>>(response);
    // console.log(pageData);

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

// 하루 기록 불러오기
export async function fetchMyDay(opts: {
    date: string;
    page: number;
    sort?: "asc" | "desc";
    size?: number;
    q?: string
}): Promise<PageResult<Record>> {
    const { date, page, sort, size, q } = opts;

    const params = new URLSearchParams({
        date: String(date),
        page: String(page),
        sort: String(sort),
        size: String(size),
    });
    if (q && q.trim()) params.set("q", q.trim());

    const response = await fetchWithAuth(`/records/day?${params.toString()}`, { method: "GET" });

    const pageData = await unwrap<PageResponse<any>>(response);
    // console.log(pageData);

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
