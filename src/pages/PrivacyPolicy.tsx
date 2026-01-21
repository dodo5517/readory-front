import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/PrivacyPolicy.module.css';

export default function PrivacyPolicy() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* 헤더 */}
                <div className={styles.header}>
                    <h1 className={styles.title}>개인정보처리방침</h1>
                    <p className={styles.date}>시행일: 2025년 1월 21일</p>
                </div>

                {/* 소개 */}
                <div className={styles.introSection}>
                    <p className={styles.intro}>
                        Readory(이하 "서비스")는 이용자의 개인정보를 소중히 여기며,
                        「개인정보 보호법」을 준수합니다. 본 개인정보처리방침은 서비스 이용 시
                        수집되는 개인정보의 항목, 수집 목적, 보관 기간 등을 안내합니다.
                    </p>
                </div>

                {/* 1. 수집하는 개인정보 항목 */}
                <section className={styles.section}>
                    <h2>1. 수집하는 개인정보 항목</h2>
                    <p>서비스는 회원가입 및 서비스 제공을 위해 아래의 개인정보를 수집합니다.</p>

                    <h3>소셜 로그인 시 수집 항목 (Google, Kakao, Naver)</h3>
                    <ul>
                        <li>이메일 주소</li>
                        <li>이름(닉네임)</li>
                        <li>프로필 사진</li>
                    </ul>

                    <h3>서비스 이용 과정에서 수집되는 항목</h3>
                    <ul>
                        <li>독서 기록 정보: 책 제목, 저자, 발췌 문장, 감상 메모</li>
                        <li>사용자가 직접 설정한 프로필 이미지</li>
                    </ul>
                </section>

                {/* 2. 개인정보의 수집 및 이용 목적 */}
                <section className={styles.section}>
                    <h2>2. 개인정보의 수집 및 이용 목적</h2>
                    <ul>
                        <li>회원 가입 및 본인 확인</li>
                        <li>서비스 제공 및 맞춤형 독서 기록 관리</li>
                        <li>서비스 관련 공지사항 전달 및 문의 응대</li>
                    </ul>
                </section>

                {/* 3. 개인정보의 보관 및 파기 */}
                <section className={styles.section}>
                    <h2>3. 개인정보의 보관 및 파기</h2>

                    <h3>회원 정보</h3>
                    <p>
                        이메일, 이름, 프로필 사진 등 계정 정보는 회원 탈퇴 시 지체 없이 파기합니다.
                    </p>

                    <h3>독서 기록</h3>
                    <p>
                        이용자가 작성한 독서 기록(책 제목, 저자, 발췌 문장, 감상 메모)은
                        서비스 품질 향상 및 통계 분석 목적으로 탈퇴 후에도 익명화하여 보관될 수 있습니다.
                        완전한 삭제를 원하시는 경우 탈퇴 전 개인정보 보호책임자에게 요청해 주시기 바랍니다.
                    </p>

                    <p>
                        단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관할 수 있습니다.
                    </p>
                </section>

                {/* 4. 개인정보의 제3자 제공 */}
                <section className={styles.section}>
                    <h2>4. 개인정보의 제3자 제공</h2>
                    <p>
                        서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                        다만, 법령에 의해 요구되는 경우는 예외로 합니다.
                    </p>
                </section>

                {/* 5. 개인정보의 처리 위탁 */}
                <section className={styles.section}>
                    <h2>5. 개인정보의 처리 위탁</h2>
                    <p>서비스는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.</p>
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
                        </tbody>
                    </table>
                </section>

                {/* 6. 이용자의 권리 */}
                <section className={styles.section}>
                    <h2>6. 이용자의 권리</h2>
                    <p>이용자는 언제든지 아래의 권리를 행사할 수 있습니다.</p>
                    <ul>
                        <li>개인정보 열람, 수정, 삭제 요청</li>
                        <li>회원 탈퇴 요청</li>
                        <li>개인정보 처리 정지 요청</li>
                    </ul>
                    <p>
                        위 요청은 서비스 내 설정 또는 아래 연락처를 통해 가능합니다.
                    </p>
                </section>

                {/* 7. 개인정보 보호책임자 */}
                <section className={styles.section}>
                    <h2>7. 개인정보 보호책임자</h2>
                    <ul className={styles.contactList}>
                        <li><strong>담당자:</strong> 개인 개발자 (김도현)</li>
                        <li><strong>이메일:</strong> <a href="mailto:readory@kimdohyeon.dev">readory@kimdohyeon.dev</a></li>
                    </ul>
                    <p>
                        개인정보 관련 문의사항은 위 이메일로 연락해 주시면 신속하게 답변드리겠습니다.
                    </p>
                </section>

                {/* 8. 개인정보처리방침의 변경 */}
                <section className={styles.section}>
                    <h2>8. 개인정보처리방침의 변경</h2>
                    <p>
                        본 방침은 법령 또는 서비스 정책 변경에 따라 수정될 수 있으며,
                        변경 시 서비스 내 공지를 통해 안내합니다.
                    </p>
                </section>

                {/* 푸터 */}
                <div className={styles.footer}>
                    <Link to="/login" className={styles.backLink}>← 로그인으로 돌아가기</Link>
                </div>
            </div>
        </div>
    );
}