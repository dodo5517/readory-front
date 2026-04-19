const pad = (n: number) => n.toString().padStart(2, "0");

export function formatYMDhm(iso: string): string {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}.${MM}.${dd} ${hh}:${mm}`;
}

// 다양한 날짜 문자열을 datetime-local input용 "YYYY-MM-DDTHH:mm"으로 변환
export function toDatetimeLocal(dateStr: string): string {
    // 이미 datetime-local 형식인 경우
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
        return dateStr.slice(0, 16);
    }
    // "YYYY.MM.DD HH:mm" 형식 (formatYMDhm 결과)
    if (/^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}/.test(dateStr)) {
        return dateStr.slice(0, 10).replace(/\./g, "-") + "T" + dateStr.slice(11, 16);
    }
    // ISO 문자열 등 파싱 가능한 형식
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return dateStr;
}

// 현재 로컬 시각을 "YYYY-MM-DDTHH:mm"으로 반환
export function nowDatetimeLocal(): string {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
