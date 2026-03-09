import React, { useState } from "react";
import styles from "../styles/AdminPatternPage.module.css";
import { cleanSentences } from "../api/AdminRecord";

export default function AdminPatternPage() {
    const [cleaning, setCleaning] = useState(false);
    const [cleanResult, setCleanResult] = useState<{ total: number; updated: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const confirmClean = () => {
        return window.confirm(
            "저장된 모든 문장에 현재 EbookSourceCleaner 패턴을 적용합니다.\n" +
            "원본은 sentence_original에 백업됩니다. 진행할까요?"
        );
    };

    const runClean = async () => {
        if (!confirmClean()) return;
        setCleaning(true);
        setCleanResult(null);
        setError(null);
        try {
            setCleanResult(await cleanSentences());
        } catch (e) {
            setError(e instanceof Error ? e.message : "정리 실패");
        } finally {
            setCleaning(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>출처 패턴 · 일괄 정리</h1>
                <p className={styles.pageDesc}>
                    패턴 분석은 로컬에서 <code>claude "출처 패턴 분석"</code>으로 실행하세요.
                    패턴 수정 후 아래 버튼으로 기존 문장에 일괄 적용할 수 있습니다.
                </p>

                <div className={styles.cleanSection}>
                    <h2 className={styles.cleanTitle}>기존 문장 일괄 정리</h2>
                    <p className={styles.cleanDesc}>
                        저장된 모든 문장에 현재 <code>EbookSourceCleaner</code> 패턴을 적용합니다.
                        원본은 <code>sentence_original</code>에 백업되며, 패턴 수정 후 재실행하면 원본 기준으로 다시 정리합니다.
                    </p>
                    <div className={styles.cleanActions}>
                        <button
                            className={styles.cleanBtn}
                            onClick={runClean}
                            disabled={cleaning}
                        >
                            {cleaning ? "정리 중..." : "일괄 정리 실행"}
                        </button>
                        {cleanResult && (
                            <span className={styles.cleanResultText}>
                                완료 — 전체 {cleanResult.total}개 중 {cleanResult.updated}개 수정됨
                            </span>
                        )}
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                </div>
            </div>
        </section>
    );
}