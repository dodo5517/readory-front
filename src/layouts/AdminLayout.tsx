import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import styles from "../styles/AdminLayout.module.css";
import type { AdminNavItem } from "../types/adminNav";

const NAV: AdminNavItem[] = [
    {
        key: "users",
        label: "유저 관리",
        children: [
            { key: "users-list", label: "유저 리스트", to: "/admin/users" },
            { key: "users-refreshToken", label: "유저 토큰", to: "/admin/refreshTokens" },
        ],
    },
    {
        key: "logs",
        label: "로그",
        children: [
            { key: "logs-user", label: "로그", to: "/admin/logs" },
        ],
    },
    {
        key: "books",
        label: "책 관리",
        children: [
            { key: "books-list", label: "책 목록", to: "/admin/books" },
            { key: "books-match", label: "매칭/정리", to: "/admin/books/match" },
        ],
    },
    {
        key: "records",
        label: "기록 관리",
        children: [
            { key: "records-list", label: "기록 목록", to: "/admin/records" },
            { key: "records-reports", label: "신고/검수", to: "/admin/records/reports" },
        ],
    },
];

type Props = {
    title?: string;
    rightSlot?: React.ReactNode; // 헤더 우측(관리자 표시/로그아웃 버튼 등)
};

export default function AdminLayout({ title = "Admin", rightSlot }: Props) {
    const location = useLocation();

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.brand}>
                        <span className={styles.brandMark}>●</span>
                        <span className={styles.brandText}>{title}</span>
                    </div>

                    <div className={styles.headerRight}>
                        <span className={styles.path}>{location.pathname}</span>
                        {rightSlot ? <div className={styles.rightSlot}>{rightSlot}</div> : null}
                    </div>
                </div>
            </header>

            <div className={styles.body}>
                <aside className={styles.sidebar}>
                    <div className={styles.navTitle}>관리 메뉴</div>

                    <nav className={styles.nav}>
                        {NAV.map((group) => (
                            <div key={group.key} className={styles.navGroup}>
                                <div className={styles.groupLabel}>{group.label}</div>

                                <div className={styles.groupItems}>
                                    {group.children?.map((item) => (
                                        <NavLink
                                            key={item.key}
                                            to={item.to ?? "#"}
                                            className={({ isActive }) =>
                                                `${styles.navItem} ${isActive ? styles.isActive : ""}`
                                            }
                                        >
                                            {item.label}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                <main className={styles.content}>
                    {/* 각 페이지는 기존 카드/툴바 스타일 그대로 */}
                    <Outlet />
                </main>
            </div>
        </section>
    );
}
