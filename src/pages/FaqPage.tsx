import React from "react";
import {Link, useNavigate} from "react-router-dom";
import styles from "../styles/FaqPage.module.css";

// FAQ 데이터
type FAQLink =
    | { kind: "external"; href: string; label?: string }
    | { kind: "internal"; to: string; label?: string };

type FAQItem = {
    id: number;
    question: string;
    answer: string;
    link?: FAQLink;
};

const FAQS: FAQItem[] = [
    {
        id: 1,
        question: "Readory가 뭔가요?",
        answer: "Readory 서비스에 대한 설명은 아래 링크에서 확인할 수 있어요.",
        link: { kind: "internal", to: "/guide", label: "Readory 소개 보기" },
    },
    {
        id: 2,
        question: "Readory 사용법은 어디서 보나요?",
        answer: "사용법은 아래 가이드 페이지에서 확인해 주세요.",
        link: { kind: "external", href: "https://hill-snarl-f10.notion.site/Readory-316276b3090780ba8a9df2403db0fa73?pvs=143", label: "사용법 가이드 열기" },
    },
    {
        id: 3,
        question: "문의는 어디로 하면 되나요?",
        answer: "아래 이메일로 문의해 주세요.",
        // email은 링크 대신 mailto로 처리
    },
];

const CONTACT_EMAIL = "me@kimdohyeon.dev";

function FAQLinkView({ link }: { link: FAQLink }) {
    if (link.kind === "external") {
        return (
            <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label ?? "바로가기 →"}
            </a>
        );
    }
    return <Link to={link.to}>{link.label ?? "이동하기 →"}</Link>;
}

export default function FaqPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <h1 className={styles.title}>FAQ</h1>
                    <p className={styles.subtitle}>자주 묻는 질문을 확인하세요</p>
                </header>

                <div className={styles.noticeList}>
                    {FAQS.map((faq) => (
                        <article key={faq.id} className={styles.noticeItem}>
                            <h2 className={styles.noticeTitle}>Q. {faq.question}</h2>
                            <p className={styles.noticeContent}>
                                A. {faq.answer}
                                {faq.link && (
                                    <>
                                        <br />
                                        <FAQLinkView link={faq.link} />
                                    </>
                                )}

                                {faq.id === 3 && (
                                    <>
                                        <br />
                                        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                                    </>
                                )}
                            </p>
                        </article>
                    ))}
                </div>

                <footer className={styles.footer}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← 돌아가기
                    </button>
                </footer>
            </div>
        </div>
    );
}