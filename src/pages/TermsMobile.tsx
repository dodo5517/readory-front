import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Terms.module.css';

export default function TermsMobile() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>

                {/* 헤더 */}
                <div className={styles.header}>
                    <h1 className={styles.title}>서비스 이용약관 (모바일 앱)</h1>
                    <p className={styles.date}>시행일: 2026년 6월 6일</p>
                </div>

                {/* 제1조 목적 */}
                <section className={styles.section}>
                    <h2>제1조 (목적)</h2>
                    <p>
                        본 약관은 김도현(이하 "운영자")이 제공하는 Readory 모바일 앱(이하 "앱")의
                        이용과 관련하여 앱과 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                        회원가입 및 계정 관리는 Readory 웹 서비스의 약관을 따릅니다.
                    </p>
                </section>

                {/* 제2조 정의 */}
                <section className={styles.section}>
                    <h2>제2조 (정의)</h2>
                    <ul>
                        <li>"앱"이란 안드로이드 기반으로 제공되는 Readory 모바일 애플리케이션을 의미합니다.</li>
                        <li>"웹 서비스"란 readory.kimdohyeon.dev에서 제공되는 Readory 웹 애플리케이션을 의미합니다.</li>
                        <li>"이용자"란 본 약관에 동의하고 앱을 이용하는 자를 의미합니다.</li>
                        <li>"API 키"란 이용자가 웹 서비스에서 발급받아 앱에 입력하는 인증 토큰을 의미합니다.</li>
                    </ul>
                </section>

                {/* 제3조 약관의 효력 및 변경 */}
                <section className={styles.section}>
                    <h2>제3조 (약관의 효력 및 변경)</h2>
                    <p>
                        본 약관은 앱 내 또는 웹 서비스 화면에 게시함으로써 효력이 발생합니다.
                        운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있으며,
                        변경 시 사전에 공지합니다.
                    </p>
                </section>

                {/* 제4조 이용 자격 및 연령 제한 */}
                <section className={styles.section}>
                    <h2>제4조 (이용 자격 및 연령 제한)</h2>
                    <ul>
                        <li>본 앱은 만 14세 이상의 이용자만 이용할 수 있습니다.</li>
                        <li>
                            만 14세 미만의 아동은 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라
                            법정대리인의 동의 없이 앱을 이용할 수 없습니다.
                        </li>
                    </ul>
                </section>

                {/* 제5조 인증 및 API 키 */}
                <section className={styles.section}>
                    <h2>제5조 (인증 및 API 키)</h2>
                    <ul>
                        <li>앱은 별도의 회원가입 절차가 없으며, 웹 서비스에서 발급받은 API 키로 이용자를 인증합니다.</li>
                        <li>API 키는 이용자 본인 식별 수단이므로 타인에게 노출되지 않도록 관리할 책임은 이용자에게 있습니다.</li>
                        <li>API 키가 노출되었을 경우 이용자는 웹 서비스에서 즉시 재발급하여야 합니다.</li>
                        <li>API 키는 앱의 보안 저장소(Android Keystore)에만 보관되며, 외부로 전송되지 않습니다.</li>
                    </ul>
                </section>

                {/* 제6조 이용자의 의무 */}
                <section className={styles.section}>
                    <h2>제6조 (이용자의 의무)</h2>
                    <ul>
                        <li>관련 법령을 위반하는 행위를 해서는 안 됩니다.</li>
                        <li>타인의 권리를 침해하거나 불법 콘텐츠를 저장해서는 안 됩니다.</li>
                        <li>앱의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
                    </ul>
                </section>

                {/* 제7조 서비스 제공 및 변경 */}
                <section className={styles.section}>
                    <h2>제7조 (서비스의 제공 및 변경)</h2>
                    <p>
                        앱은 현재 무료로 제공됩니다. 운영자는 안정적인 서비스 제공을 위해 노력하며,
                        시스템 점검, 기술적 필요, 안드로이드 OS 정책 변경 등에 따라
                        앱의 일부 또는 전부를 변경하거나 일시 중단할 수 있습니다.
                    </p>
                </section>

                {/* 제8조 콘텐츠 및 저작권 */}
                <section className={styles.section}>
                    <h2>제8조 (콘텐츠 및 저작권)</h2>
                    <ul>
                        <li>이용자가 앱을 통해 저장한 독서 기록 및 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.</li>
                        <li>
                            이용자는 서비스 운영 및 기능 개선을 위해 필요한 범위 내에서 콘텐츠 사용을 운영자에게 허락합니다.
                            통계 분석에는 책 제목·저자 정보만 사용되며, 발췌 문장 및 감상 메모는 통계 분석 대상에서 제외됩니다.
                        </li>
                        <li>
                            서비스 품질 향상을 위해 발췌 문장의 텍스트 정제 분석에
                            Anthropic, PBC의 AI 도구(Claude)가 활용될 수 있습니다.
                            이는 출처 표시 제거·불필요한 문자열 정리 등 텍스트 처리 오류 개선 목적에 한합니다.
                            이용자의 콘텐츠는 AI 모델 학습 등 서비스 운영과 무관한 목적으로는 사용되지 않습니다.
                        </li>
                        <li>
                            이용자는 저작권법이 허용하는 범위(사적 이용 등) 내에서만 타인의 저작물을 발췌·저장하여야 하며,
                            저작권자의 허락 없이 상업적 목적으로 타인의 저작물을 이용해서는 안 됩니다.
                        </li>
                        <li>
                            타인의 저작권을 침해하는 콘텐츠 저장에 대한 책임은 이용자에게 있으며,
                            이로 인해 운영자에게 손해가 발생한 경우 이용자가 이를 배상할 책임을 집니다.
                        </li>
                    </ul>
                </section>

                {/* 제9조 데이터 삭제 및 탈퇴 */}
                <section className={styles.section}>
                    <h2>제9조 (데이터 삭제 및 탈퇴)</h2>
                    <p>
                        이용자는 언제든지 회원 탈퇴 및 데이터 삭제를 요청할 수 있습니다.
                    </p>
                    <ul>
                        <li>
                            <strong>웹 서비스에서:</strong> Readory 웹의 마이페이지
                            (<a href="https://readory.kimdohyeon.dev/myPage">https://readory.kimdohyeon.dev/myPage</a>)에서
                            계정 탈퇴 시 모든 독서 기록과 API 키가 즉시 삭제됩니다.
                        </li>
                        <li>
                            <strong>앱에서:</strong> 앱 설정 화면의 "계정 삭제" 항목을 통해 위 페이지로 이동할 수 있습니다.
                        </li>
                        <li>
                            <strong>앱만 삭제:</strong> 앱을 기기에서 제거하면 앱 내 보관 중인 API 키는 함께 삭제됩니다.
                            단, 서버의 독서 기록은 남아 있으므로, 데이터까지 완전히 삭제하려면 웹에서 탈퇴해야 합니다.
                        </li>
                    </ul>
                </section>

                {/* 제10조 개인정보 보호 */}
                <section className={styles.section}>
                    <h2>제10조 (개인정보 보호)</h2>
                    <p>
                        앱의 개인정보 처리에 관한 사항은 <Link to="/privacy-mobile">앱 개인정보처리방침</Link>에서 확인할 수 있습니다.
                        앱 이용 시 본 약관 및 처리방침에 동의한 것으로 간주합니다.
                    </p>
                </section>

                {/* 제11조 책임의 제한 */}
                <section className={styles.section}>
                    <h2>제11조 (책임의 제한)</h2>
                    <p>
                        운영자는 천재지변, 불가항력적 사유, 이용자의 귀책사유로 발생한 손해에 대해 책임을 지지 않습니다.
                        또한 무료로 제공되는 앱과 관련하여 법령이 허용하는 범위 내에서 책임을 제한할 수 있습니다.
                    </p>
                </section>

                {/* 제12조 분쟁 해결 */}
                <section className={styles.section}>
                    <h2>제12조 (분쟁 해결 및 준거법)</h2>
                    <p>
                        본 약관은 대한민국 법률에 따릅니다.
                        앱 이용과 관련하여 분쟁이 발생할 경우, 관할 법원은 민사소송법에 따른 법원을 따릅니다.
                    </p>
                </section>

                {/* 제13조 문의 */}
                <section className={styles.section}>
                    <h2>제13조 (문의)</h2>
                    <p>
                        앱 관련 문의사항은 아래 이메일로 연락해 주시기 바랍니다.
                    </p>
                    <ul>
                        <li><strong>운영자:</strong> 김도현</li>
                        <li><strong>이메일:</strong> <a href="mailto:me@kimdohyeon.dev">me@kimdohyeon.dev</a></li>
                    </ul>
                </section>

                {/* 푸터 */}
                <div className={styles.footer}>
                    <Link to="/login" className={styles.backLink}>← 돌아가기</Link>
                </div>

            </div>
        </div>
    );
}