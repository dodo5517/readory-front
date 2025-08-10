import { fetchWithAuth } from "../utils/fetchWithAuth";
import { Record, SummaryRecord } from "../types/records";
import { formatYMDhm } from "../utils/datetime";

export async function fetchMySummaryRecords(): Promise<SummaryRecord[]> {
    const respopnse = await fetchWithAuth("/records/me/summary", { method: "GET" });
    if (!respopnse.ok) {
        throw new Error(`요청 실패: ${respopnse.status}`);
    }

    const data: Record[] = await respopnse.json();

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

export async function fetchMyRecords(): Promise<Record[]> {
    const response = await fetchWithAuth("/records/me", { method: "GET" });
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
