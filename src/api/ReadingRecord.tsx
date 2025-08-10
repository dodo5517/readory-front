import { fetchWithAuth } from "../utils/fetchWithAuth";
import { SummaryApiItem, ListItem } from "../types/records";
import { formatYMDhm } from "../utils/datetime";

export async function fetchMySummaryRecords(): Promise<ListItem[]> {
    const respopnse = await fetchWithAuth("/records/me/summary", { method: "GET" });
    if (!respopnse.ok) {
        throw new Error(`요청 실패: ${respopnse.status}`);
    }

    const data: SummaryApiItem[] = await respopnse.json();

    // 최신 기록 순으로 정렬 + 화면용으로 매핑
    return data
        .map((r) => ({
            id: r.id,
            date: formatYMDhm(r.recordedAt),
            title: r.title || "(제목 없음)",
            sentence: r.sentence ?? "",
            comment: r.comment ?? "",
        }));
}
