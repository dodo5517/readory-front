import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/GuidePage.module.css";
import { BooksIcon, LightningIcon, BookOpenIcon } from '@phosphor-icons/react';

// 핵심 기능 데이터
const FEATURES = [
    {
        id: 1,
        icon: <BooksIcon size={32} />,
        title: "여러 전자책 앱 메모를 한 곳에서",
        description: "교보, 밀리, 알라딘... 여기저기 흩어져 있는 메모를 한곳에서 관리하세요.",
        details: [
            "다양한 전자책 앱에서 남긴 하이라이트와 메모 통합",
            "앱별로 분리되어 있던 독서 기록을 한눈에 확인",
            "원하는 책, 원하는 문장을 빠르게 검색",
        ],
    },
    {
        id: 2,
        icon: <LightningIcon size={32} />,
        title: "읽는 흐름을 끊지 않고 바로 기록",
        description: "전자책 읽다가 앱을 벗어나지 않고 iOS 단축어로 바로 기록할 수 있어요.",
        details: [
            "메모하려고 다른 앱으로 나갔다가 흐름이 끊기는 상황 방지",
            "전자책에서 바로 Readory로 저장",
            "읽기에만 집중할 수 있는 환경 제공",
        ],
    },
    {
        id: 3,
        icon: <BookOpenIcon size={32} />,
        title: "종이책도 디지털 기록",
        description: "종이책 문장을 실제 책에 연결된 기록으로 남길 수 있어요.",
        details: [
            "책 정보를 유사도 높은 책으로 자동 매칭",
            "제목과 작가로 책 검색 후 연결",
            "종이책과 전자책 기록을 하나로 통합 관리",
        ],
    },
];
export default function GuidePage() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* 서비스 소개 섹션 */}
                <header className={styles.heroSection}>
                    <div className={styles.logoArea}>
                        <span className={styles.logoIcon}><BooksIcon size={32} /></span>
                        <h1 className={styles.logoText}>Readory</h1>
                    </div>
                    <p className={styles.tagline}>Reading + Memory</p>
                    <p className={styles.heroDescription}>
                        iOS 단축어로 독서 기록을 더 쉽게.<br />
                        흩어진 메모를 한곳에서 관리하세요.
                    </p>
                </header>

                {/* 핵심 기능 섹션 */}
                <section className={styles.featuresSection}>
                    <div className={styles.featureList}>
                        {FEATURES.map((feature) => (
                            <article key={feature.id} className={styles.featureItem}>
                                <div className={styles.featureIcon}>{feature.icon}</div>
                                <div className={styles.featureContent}>
                                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                                    <p className={styles.featureDescription}>{feature.description}</p>
                                    <ul className={styles.featureDetails}>
                                        {feature.details.map((detail, idx) => (
                                            <li key={idx}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* 안내 메시지 */}
                {/*<section className={styles.noteSection}>*/}
                {/*    <div className={styles.noteBox}>*/}
                {/*        <span className={styles.noteIcon}>💡</span>*/}
                {/*        <p className={styles.noteText}>*/}
                {/*            문제가 있으시면 언제든 문의해주세요!<br />*/}
                {/*            readory@kimdohyeon.dev*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*</section>*/}

                <footer className={styles.footer}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← 돌아가기
                    </button>
                </footer>
            </div>
        </div>
    );
}