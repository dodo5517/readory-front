import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Terms.module.css';

export default function Terms() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>

                {/* 헤더 */}
                <div className={styles.header}>
                    <h1 className={styles.title}>서비스 이용약관</h1>
                    <p className={styles.date}>시행일: 2025년 1월 21일</p>
                </div>

                {/* 제1조 목적 */}
                <section className={styles.section}>
                    <h2>제1조 (목적)</h2>
                    <p>
                        본 약관은 김도현(이하 "운영자")이 제공하는 Readory(이하 "서비스")의
                        이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                </section>

                {/* 제2조 정의 */}
                <section className={styles.section}>
                    <h2>제2조 (정의)</h2>
                    <ul>
                        <li>"서비스"란 독서 기록 및 관리 기능을 제공하는 웹 애플리케이션을 의미합니다.</li>
                        <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 회원을 의미합니다.</li>
                        <li>"계정"이란 소셜 로그인을 통해 생성된 회원 식별 수단을 의미합니다.</li>
                    </ul>
                </section>

                {/* 제3조 약관의 효력 및 변경 */}
                <section className={styles.section}>
                    <h2>제3조 (약관의 효력 및 변경)</h2>
                    <p>
                        본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.
                        운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있으며,
                        변경 시 사전에 공지합니다.
                    </p>
                </section>

                {/* 제4조 이용 자격 및 연령 제한 */}
                <section className={styles.section}>
                    <h2>제4조 (이용 자격 및 연령 제한)</h2>
                    <ul>
                        <li>본 서비스는 만 14세 이상의 이용자만 가입하고 이용할 수 있습니다.</li>
                        <li>
                            만 14세 미만의 아동은 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라
                            법정대리인의 동의 없이 서비스에 가입하거나 이용할 수 없습니다.
                        </li>
                        <li>
                            이를 위반하여 발생하는 문제에 대한 책임은 이용자 본인 및 법정대리인에게 있으며,
                            운영자는 해당 계정을 삭제할 수 있습니다.
                        </li>
                    </ul>
                </section>

                {/* 제5조 회원가입 및 계정관리 */}
                <section className={styles.section}>
                    <h2>제5조 (회원가입 및 계정 관리)</h2>
                    <ul>
                        <li>이용자는 소셜 로그인(Google, Kakao, Naver)을 통해 가입할 수 있습니다.</li>
                        <li>이용자는 자신의 계정을 안전하게 관리할 책임이 있습니다.</li>
                        <li>계정 도용 또는 부정 사용이 발견될 경우 즉시 운영자에게 알려야 합니다.</li>
                    </ul>
                </section>

                {/* 제6조 이용자의 의무 */}
                <section className={styles.section}>
                    <h2>제6조 (이용자의 의무)</h2>
                    <ul>
                        <li>관련 법령을 위반하는 행위를 해서는 안 됩니다.</li>
                        <li>타인의 권리를 침해하거나 불법 콘텐츠를 게시해서는 안 됩니다.</li>
                        <li>서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
                    </ul>
                </section>

                {/* 제7조 서비스 제공 및 변경 */}
                <section className={styles.section}>
                    <h2>제7조 (서비스의 제공 및 변경)</h2>
                    <p>
                        본 서비스는 현재 무료로 제공됩니다. 운영자는 안정적인 서비스 제공을 위해 노력하며,
                        향후 유료 기능이 추가되거나 요금 정책이 변경될 경우 사전에 공지합니다.
                        또한 시스템 점검, 기술적 필요 등에 따라 서비스의 일부 또는 전부를
                        변경하거나 일시 중단할 수 있습니다.
                    </p>
                </section>

                {/* 제8조 서비스 이용 제한 */}
                <section className={styles.section}>
                    <h2>제8조 (서비스 이용 제한)</h2>
                    <p>
                        이용자가 본 약관을 위반하는 경우, 운영자는 사전 통지 없이
                        서비스 이용을 제한하거나 계정을 삭제할 수 있습니다.
                    </p>
                </section>

                {/* 제9조 콘텐츠 및 저작권 */}
                <section className={styles.section}>
                    <h2>제9조 (콘텐츠 및 저작권)</h2>
                    <ul>
                        <li>이용자가 작성한 독서 기록 및 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.</li>
                        <li>
                            이용자는 서비스 운영, 기능 개선 및 통계 분석을 위해 필요한 범위 내에서
                            콘텐츠 사용을 운영자에게 허락합니다. 단, 이용자의 콘텐츠는 AI 모델 학습 등
                            서비스 운영과 무관한 목적으로는 사용되지 않습니다.
                        </li>
                        <li>타인의 저작권을 침해하는 콘텐츠 게시에 대한 책임은 이용자에게 있습니다.</li>
                    </ul>
                </section>

                {/* 제10조 개인정보 보호 */}
                <section className={styles.section}>
                    <h2>제10조 (개인정보 보호)</h2>
                    <p>
                        운영자는 이용자의 개인정보를 소중히 여기며, 관련 법령에 따라 보호합니다.
                        개인정보의 수집·이용·보관·파기 등에 관한 세부 사항은{' '}
                        <Link to="/privacy">개인정보 처리방침</Link>을 통해 확인하실 수 있습니다.
                        서비스 이용 시 개인정보 처리방침에 동의한 것으로 간주합니다.
                    </p>
                </section>

                {/* 제11조 책임의 제한 */}
                <section className={styles.section}>
                    <h2>제11조 (책임의 제한)</h2>
                    <p>
                        운영자는 천재지변, 불가항력적 사유, 이용자의 귀책사유로 발생한 손해에 대해 책임을 지지 않습니다.
                        또한 무료로 제공되는 서비스와 관련하여 법령이 허용하는 범위 내에서 책임을 제한할 수 있습니다.
                    </p>
                </section>

                {/* 제12조 분쟁 해결 */}
                <section className={styles.section}>
                    <h2>제12조 (분쟁 해결 및 준거법)</h2>
                    <p>
                        본 약관은 대한민국 법률에 따릅니다.
                        서비스 이용과 관련하여 분쟁이 발생할 경우,
                        관할 법원은 민사소송법에 따른 법원을 따릅니다.
                    </p>
                </section>

                {/* 제13조 문의 */}
                <section className={styles.section}>
                    <h2>제13조 (문의)</h2>
                    <p>
                        서비스 관련 문의사항은 아래 이메일로 연락해 주시기 바랍니다.
                    </p>
                    <ul>
                        <li><strong>운영자:</strong> 김도현</li>
                        <li><strong>이메일:</strong> <a href="mailto:me@kimdohyeon.dev">me@kimdohyeon.dev</a></li>
                    </ul>
                </section>

                {/* 푸터 */}
                <div className={styles.footer}>
                    <Link to="/login" className={styles.backLink}>← 로그인으로 돌아가기</Link>
                </div>

            </div>
        </div>
    );
}