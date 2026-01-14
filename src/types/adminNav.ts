export type AdminNavItem = {
    key: string;
    label: string;
    to?: string;              // leaf면 라우트
    children?: AdminNavItem[]; // group이면 트리
};
