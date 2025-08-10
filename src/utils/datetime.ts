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
