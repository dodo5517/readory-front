import React from "react";
import styles from "../styles/Header.module.css";

type Props = {
    onExpire: () => void;
    onExtend: () => void;
    refreshing: boolean;
};

const TOTAL_SEC = 1800;

// ── 7-세그먼트: 얇고 둥근 현대적 스타일 ──────────────
// W=8, H=14, 세그먼트는 rounded rect로
const DW = 8, DH = 14, ST = 1.2, SR = 0.6; // 두께, 라운드

const SEG_MAP: Record<string, boolean[]> = {
    //         a      b      c      d      e      f      g
    "0": [true,  true,  true,  true,  true,  true,  false],
    "1": [false, true,  true,  false, false, false, false],
    "2": [true,  true,  false, true,  true,  false, true ],
    "3": [true,  true,  true,  true,  false, false, true ],
    "4": [false, true,  true,  false, false, true,  true ],
    "5": [true,  false, true,  true,  false, true,  true ],
    "6": [true,  false, true,  true,  true,  true,  true ],
    "7": [true,  true,  true,  false, false, false, false],
    "8": [true,  true,  true,  true,  true,  true,  true ],
    "9": [true,  true,  true,  true,  false, true,  true ],
};

// 각 세그먼트를 rounded rect로 — 수평/수직 pill 모양
// [x, y, w, h, 가로세그먼트여부]
function getSegRect(seg: string): [number, number, number, number, boolean] {
    const m = 0.8; // 여백
    const hw = DW - m * 2; // 수평 세그먼트 너비
    const vl = DH / 2 - m * 2; // 수직 세그먼트 높이
    const mid = DH / 2;
    switch (seg) {
        case "a": return [m,           0,           hw, ST, true ];
        case "b": return [DW - ST,     m,           ST, vl, false];
        case "c": return [DW - ST,     mid + m,     ST, vl, false];
        case "d": return [m,           DH - ST,     hw, ST, true ];
        case "e": return [0,           mid + m,     ST, vl, false];
        case "f": return [0,           m,           ST, vl, false];
        case "g": return [m,           mid - ST/2,  hw, ST, true ];
        default:  return [0, 0, 0, 0, true];
    }
}

interface DigitProps {
    char: string;
    x: number;
    on: string;
    off: string;
}

const Digit: React.FC<DigitProps> = ({ char, x, on, off }) => {
    const segs = SEG_MAP[char] ?? Array(7).fill(false);
    const names = ["a","b","c","d","e","f","g"];
    return (
        <g transform={`translate(${x}, 0)`}>
            {names.map((name, i) => {
                const [rx, ry, rw, rh] = getSegRect(name);
                return (
                    <rect key={name}
                          x={rx} y={ry} width={rw} height={rh}
                          rx={SR} ry={SR}
                          fill={segs[i] ? on : off}
                          style={{ transition: "fill 0.08s" }}
                    />
                );
            })}
        </g>
    );
};

const Colon: React.FC<{ x: number; on: string; blink: boolean }> = ({ x, on, blink }) => (
    <g transform={`translate(${x}, 0)`}
       style={{ transition: "opacity 0.3s" }}
       opacity={blink ? 0.25 : 1}>
        <rect x="0" y="3.5" width={ST} height={ST} rx={SR} fill={on}/>
        <rect x="0" y="9"   width={ST} height={ST} rx={SR} fill={on}/>
    </g>
);

// ── TokenHUD ─────────────────────────────────────────
const TokenHUD: React.FC<Props> = ({ onExpire, onExtend, refreshing }) => {
    const [remainSec, setRemainSec] = React.useState<number | null>(null);
    const [hovered, setHovered] = React.useState(false);

    const readRemain = React.useCallback(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem("accessTokenExpiresAt");
        if (!raw) { setRemainSec(null); return; }
        const diff = Math.max(0, Math.floor((Number(raw) - Date.now()) / 1000));
        setRemainSec(diff);
    }, []);

    React.useEffect(() => {
        readRemain();
        const id = setInterval(readRemain, 1000);
        return () => clearInterval(id);
    }, [readRemain]);

    React.useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === "accessTokenExpiresAt") readRemain();
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, [readRemain]);

    const onExpireRef = React.useRef(onExpire);
    React.useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
    const promptedRef = React.useRef(false);

    React.useEffect(() => {
        if (refreshing) return;
        if (remainSec === null) { promptedRef.current = false; return; }
        if (remainSec > 0) { promptedRef.current = false; return; }
        if (promptedRef.current) return;
        promptedRef.current = true;
        onExpireRef.current();
    }, [remainSec, refreshing]);

    const handleExtendClick = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            onExtend();
            const el = e.currentTarget;
            el.blur();
            requestAnimationFrame(() => el.blur());
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        },
        [onExtend]
    );

    if (remainSec === null) return null;

    const expired = remainSec <= 0;
    const blink = remainSec % 2 === 0;

    const pad = (n: number) => String(n).padStart(2, "0");

    // 호버 시 TOTAL_SEC 표시
    const displaySec = hovered ? TOTAL_SEC : remainSec;
    const h = Math.floor(displaySec / 3600);
    const m = Math.floor((displaySec % 3600) / 60);
    const s = displaySec % 60;

    const showHour = h > 0;
    const chars = showHour
        ? pad(h).split("").concat(pad(m).split(""))
        : pad(m).split("").concat(pad(s).split(""));
    const [d1, d2, d3, d4] = chars;

    const onColor  = expired
        ? "var(--danger-color)"
        : hovered ? "var(--text-normal)" : "var(--text-muted)";
    const offColor = expired
        ? "rgba(185,74,74,0.1)"
        : hovered ? "rgba(0,0,0,0.1)" : "var(--border-color)";

    const GAP = 2;
    const COL_W = 3;
    // x 위치
    const x0 = 0;
    const x1 = x0 + DW + GAP;
    const xC = x1 + DW + GAP;
    const x2 = xC + COL_W + GAP;
    const x3 = x2 + DW + GAP;
    const svgW = x3 + DW;

    return (
        <span className={styles.tokenWrap}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
        >
            <span
                className={`${styles.tokenBadge} ${expired ? styles.tokenExpired : ""} ${hovered ? styles.tokenHovered : ""}`}
                aria-live="polite"
                title={hovered ? "클릭하여 연장" : `${pad(Math.floor(remainSec/3600))}:${pad(Math.floor((remainSec%3600)/60))}:${pad(remainSec%60)}`}
                onClick={() => onExtend()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onExtend(); }}
            >
                <svg
                    className={styles.segClockSvg}
                    viewBox={`-0.5 -0.5 ${svgW + 1} ${DH + 1}`}
                    width={(svgW + 1) * 0.9}
                    height={(DH + 1) * 0.9}
                    aria-hidden="true"
                >
                    <Digit char={d1} x={x0} on={onColor} off={offColor}/>
                    <Digit char={d2} x={x1} on={onColor} off={offColor}/>
                    <Colon x={xC}    on={onColor} blink={blink}/>
                    <Digit char={d3} x={x2} on={onColor} off={offColor}/>
                    <Digit char={d4} x={x3} on={onColor} off={offColor}/>
                </svg>
            </span>

        </span>
    );
};

export default React.memo(TokenHUD);