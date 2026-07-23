import { Info } from '@phosphor-icons/react';
import styles from '../styles/Footer.module.css';

// 책 정보(도서 메타데이터)를 노출하는 페이지 하단에 출처를 표기하는 공통 푸터.
// 국립중앙도서관 OpenAPI 이용약관 제6조 ④(출처 명시 의무) 대응.
const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.credit}>
                <Info size={13} weight="regular" aria-hidden="true" />
                도서 정보 제공: 카카오 · 국립중앙도서관 OpenAPI
            </p>
        </footer>
    );
};

export default Footer;
