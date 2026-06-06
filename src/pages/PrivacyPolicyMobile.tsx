import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/PrivacyPolicy.module.css';

export default function PrivacyPolicyMobile() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* 헤더 */}
                <div className={styles.header}>
                    <h1 className={styles.title}>개인정보처리방침 (모바일 앱)</h1>
                    <p className={styles.date}>시행일: 2026년 6월 6일</p>
                </div>

                {/* 소개 */}
                <div className={styles.introSection}>
                    <p className={styles.intro}>
                        본 방침은 Readory 모바일 앱(이하 "앱")에 적용됩니다.
                        앱은 「개인정보 보호법」을 준수하며, 이용자의 개인정보를 소중히 다룹니다.
                        회원가입 및 계정 관리는 Readory 웹 서비스에서 이루어지며,
                        해당 부분은 <Link to="/privacy">웹 서비스 개인정보처리방침</Link>을 참고하시기 바랍니다.
                    </p>
                </div>

                {/* 1. 수집하는 개인정보 항목 */}
                <section className={styles.section}>
                    <h2>1. 수집하는 개인정보 항목</h2>
                    <p>앱은 서비스 제공을 위해 아래의 정보를 수집·처리합니다.</p>

                    <h3>이용자가 입력하는 정보</h3>
                    <ul>
                        <li>API 키 (웹 서비스에서 발급받은 인증 토큰)</li>
                        <li>독서 기록 정보: 책 제목, 저자, 발췌 문장, 감상 메모</li>
                    </ul>

                    <h3>다른 앱에서 공유받는 정보</h3>
                    <ul>
                        <li>이용자가 다른 앱에서 공유 기능을 통해 보내온 텍스트</li>
                    </ul>

                    <h3>앱이 수집하지 않는 정보</h3>
                    <ul>
                        <li>위치 정보, 연락처, 사진, 카메라, 마이크 등 기기 권한이 필요한 정보는 수집하지 않습니다.</li>
                        <li>광고 식별자(AAID)를 수집하지 않으며, 광고를 제공하지 않습니다.</li>
                        <li>이용자의 사용 패턴을 추적하는 분석 도구를 사용하지 않습니다.</li>
                    </ul>
                </section>

                {/* 2. 앱이 사용하는 권한 */}
                <section className={styles.section}>
                    <h2>2. 앱이 사용하는 권한</h2>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>권한</th>
                            <th>용도</th>
                            <th>필수 여부</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>인터넷</td>
                            <td>독서 기록을 서버에 저장하기 위함</td>
                            <td>필수</td>
                        </tr>
                        <tr>
                            <td>알림</td>
                            <td>저장 완료/실패 결과를 알리기 위함</td>
                            <td>선택 (거부 가능)</td>
                        </tr>
                        <tr>
                            <td>공유 받기</td>
                            <td>다른 앱에서 공유한 텍스트를 받기 위함</td>
                            <td>필수 (앱의 핵심 기능)</td>
                        </tr>
                        </tbody>
                    </table>
                </section>

                {/* 3. 개인정보의 수집 및 이용 목적 */}
                <section className={styles.section}>
                    <h2>3. 개인정보의 수집 및 이용 목적</h2>
                    <ul>
                        <li>이용자가 입력한 독서 기록을 서버에 저장하고 관리하기 위함</li>
                        <li>API 키를 통한 이용자 식별 및 인증</li>
                        <li>저장 결과를 이용자에게 알리기 위함</li>
                    </ul>
                </section>

                {/* 4. 개인정보의 보관 및 파기 */}
                <section className={styles.section}>
                    <h2>4. 개인정보의 보관 및 파기</h2>

                    <h3>앱 내 저장 정보</h3>
                    <p>
                        API 키는 이용자의 기기 내 보안 저장소(Android Keystore)에만 보관되며,
                        외부로 전송되지 않습니다. 이용자가 앱을 삭제하면 함께 삭제됩니다.
                    </p>

                    <h3>서버 저장 정보</h3>
                    <p>
                        독서 기록은 회원 탈퇴 시 지체 없이 전부 파기됩니다.
                        API 키는 이용자가 웹 서비스에서 재발급하거나 폐기할 수 있습니다.
                    </p>

                    <p>
                        단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관할 수 있습니다.
                    </p>
                </section>

                {/* 5. 개인정보의 제3자 제공 */}
                <section className={styles.section}>
                    <h2>5. 개인정보의 제3자 제공</h2>
                    <p>
                        앱은 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                        다만, 법령에 의해 요구되는 경우는 예외로 합니다.
                    </p>
                </section>

                {/* 6. 개인정보의 처리 위탁 */}
                <section className={styles.section}>
                    <h2>6. 개인정보의 처리 위탁</h2>
                    <p>서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁합니다.</p>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>수탁업체</th>
                            <th>위탁 업무 내용</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Supabase Inc.</td>
                            <td>데이터베이스 저장 및 관리</td>
                        </tr>
                        <tr>
                            <td>Anthropic, PBC</td>
                            <td>발췌 문장의 텍스트 정제 분석 (AI 도구 Claude 활용)</td>
                        </tr>
                        </tbody>
                    </table>
                    <p>
                        Anthropic 위탁은 발췌 문장의 출처 표시·불필요한 문자열 등을 정제하기 위한 목적에 한하며,
                        모델 학습이나 기타 용도로는 사용되지 않습니다.
                    </p>
                </section>

                {/* 7. 이용자의 권리 및 데이터 삭제 */}
                <section className={styles.section}>
                    <h2>7. 이용자의 권리 및 데이터 삭제</h2>
                    <p>이용자는 언제든지 아래의 권리를 행사할 수 있습니다.</p>
                    <ul>
                        <li>개인정보 열람, 수정, 삭제 요청</li>
                        <li>회원 탈퇴 및 모든 독서 기록 삭제</li>
                        <li>API 키 재발급 또는 폐기</li>
                    </ul>
                    <p>
                        회원 탈퇴 및 데이터 삭제는 <strong>Readory 웹의 마이페이지</strong>
                        (<a href="https://readory.kimdohyeon.dev/myPage">https://readory.kimdohyeon.dev/myPage</a>)에서
                        직접 처리할 수 있으며, 앱 설정 화면에서도 동일한 경로로 이동할 수 있습니다.
                    </p>
                    <p>
                        그 외 문의는 아래 연락처로 직접 요청해 주시기 바랍니다.
                    </p>
                </section>

                {/* 8. 개인정보 보호책임자 */}
                <section className={styles.section}>
                    <h2>8. 개인정보 보호책임자</h2>
                    <ul className={styles.contactList}>
                        <li><strong>담당자:</strong> 개인 개발자 (김도현)</li>
                        <li><strong>이메일:</strong> <a href="mailto:me@kimdohyeon.dev">me@kimdohyeon.dev</a></li>
                    </ul>
                </section>

                {/* 9. 개인정보처리방침의 변경 */}
                <section className={styles.section}>
                    <h2>9. 개인정보처리방침의 변경</h2>
                    <p>
                        본 방침은 법령 또는 서비스 정책 변경에 따라 수정될 수 있으며,
                        변경 시 앱 내 공지 또는 웹 서비스를 통해 안내합니다.
                    </p>
                </section>

                {/* 푸터 */}
                <div className={styles.footer}>
                    <Link to="/login" className={styles.backLink}>← 돌아가기</Link>
                </div>
            </div>
        </div>
    );
}