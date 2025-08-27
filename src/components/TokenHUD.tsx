import React from "react";
import styles from "../styles/Header.module.css"; // 경로는 프로젝트에 맞게 조정

type Props = {
    onExpire: () => void;
    onExtend: () => void;
    refreshing: boolean;
};

const TokenHUD: React.FC<Props> = ({ onExpire, onExtend, refreshing }) => {
    const [remainSec, setRemainSec] = React.useState<number | null>(null);

    // 남은 시간 읽기
    const readRemain = React.useCallback(() => {
        // SSR 방지
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem("accessTokenExpiresAt");
        if (!raw) { setRemainSec(null); return; }
        const diff = Math.max(0, Math.floor((Number(raw) - Date.now()) / 1000));
        setRemainSec(diff);
    }, []);

    // 1) 1초 타이머
    React.useEffect(() => {
        readRemain();
        const id = setInterval(readRemain, 1000);
        return () => clearInterval(id);
    }, [readRemain]);

    // 2) 다른 탭 동기화
    React.useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === "accessTokenExpiresAt") readRemain();
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, [readRemain]);

    // 3) 만료 시 콜백
    // onExpire가 매 렌더마다 새로 생겨도 effect 재실행을 막기 위해 ref로 고정
    const onExpireRef = React.useRef(onExpire);
    React.useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

    // 같은 만료 상태에서 여러 번 확인창이 뜨지 않도록 1회 호출 가드
    const promptedRef = React.useRef(false);

    React.useEffect(() => {
        if (refreshing) return;         // 연장 중이면 묻지 않음
        if (remainSec === null) {       // 로그인 전 등 리셋
            promptedRef.current = false;
            return;
        }
        if (remainSec > 0) {            // 다시 연장되면 가드 해제
            promptedRef.current = false;
            return;
        }
        // remainSec <= 0 인 상황
        if (promptedRef.current) return; // 이미 물어봤으면 패스
        promptedRef.current = true;
        onExpireRef.current();          // 단 한 번만 호출
    }, [remainSec, refreshing]);

    // 남은 초 포맷
    const formatRemain = (sec: number) => {
        if (sec <= 0) return "만료됨";
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        const pad = (n: number) => String(n).padStart(2, "0");
        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    };

    // 모바일에서 연장 버튼 눌렀을 때 포커스 제거해 숨김
    const handleExtendClick = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            onExtend();                     // 실제 토큰 재발급 로직
            const el = e.currentTarget;
            el.blur();                      // 즉시 포커스 제거
            requestAnimationFrame(() => el.blur()); // iOS Safari 보정
            // 혹시 남아있는 포커스가 있으면 한 번 더 제거
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        },
        [onExtend]
    );

    // 로그인 전 등: 배지 숨김
    if (remainSec === null) return null;

    return (
        <span className={styles.tokenWrap}>
          <span className={styles.tokenBadge} aria-live="polite">
            {formatRemain(remainSec)}
          </span>
          <button
              type="button"
              className={`${styles.extendBtn} ${styles.desktopOnly}`}
              onClick={handleExtendClick}
              disabled={refreshing}
              aria-label="토큰 연장"
              title="토큰 연장"
          >
            {refreshing ? "연장 중…" : "연장"}
          </button>
        </span>
    );
};

export default React.memo(TokenHUD);
