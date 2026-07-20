import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/HighlightableSentence.module.css";
import { Highlight, HighlightColor } from "../types/records";

interface Props {
    recordId: number;
    sentence: string;
    highlights: Highlight[];
    className?: string;
    onAdd: (recordId: number, start: number, end: number, color: HighlightColor) => void;
    onRemove: (recordId: number, highlightId: number) => void;
}

interface PopoverState {
    start: number;
    end: number;
    // mobile(coarse pointer)에서는 네이티브 선택 메뉴와 겹치지 않도록 화면 하단 고정 바로 띄운다.
    // 이때 x/y는 사용하지 않고, 데스크탑에서만 선택 영역 위쪽 앵커 좌표로 쓴다.
    mobile: boolean;
    x: number;
    y: number;
}

/**
 * 문장(sentence)을 하이라이트 범위에 맞춰 마커로 쪼개 렌더하고,
 * 드래그로 일부를 선택하면 색(초록/살구) 팝오버를 띄워 하이라이트를 추가한다.
 * 마커를 클릭하면 해당 하이라이트를 삭제한다.
 * offset은 sentence 문자열 기준(UTF-16 code unit)이며 서버와 일치한다.
 *
 * 선택 감지는 mouseup(데스크탑 즉시 반응)과 document의 selectionchange(모바일에서
 * 선택 핸들을 조정하는 경우까지 포함) 두 경로를 모두 사용한다. 드래그는 복사·하이라이트
 * 양쪽 목적에 공통이므로 제스처로 구분하지 않고, 선택이 끝나면 네이티브 복사 메뉴와 나란히
 * 색 팝오버를 띄워 사용자가 다음에 무엇을 누르는지로 자연히 갈리게 한다.
 */
export default function HighlightableSentence({
    recordId, sentence, highlights, className, onAdd, onRemove,
}: Props) {
    const rootRef = useRef<HTMLQuoteElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);
    const selTimer = useRef<number | null>(null);
    const [popover, setPopover] = useState<PopoverState | null>(null);

    // 현재 텍스트 선택 → sentence 기준 offset 계산 → 색 팝오버 표시
    const evaluateSelection = useCallback(() => {
        const root = rootRef.current;
        if (!root) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setPopover(null); return; }

        const range = sel.getRangeAt(0);
        // 선택이 이 문장 안에 완전히 들어와야 함
        if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
            setPopover(null);
            return;
        }

        // 선택 시작 지점까지의 텍스트 길이 = start offset
        const pre = document.createRange();
        pre.selectNodeContents(root);
        pre.setEnd(range.startContainer, range.startOffset);
        const start = pre.toString().length;
        const text = range.toString();
        const end = start + text.length;

        if (end <= start || !text.trim()) { setPopover(null); return; }
        // 기존 하이라이트와 겹치면 무시 (서버도 거부)
        if (highlights.some(h => start < h.end && h.start < end)) { setPopover(null); return; }

        // 모바일은 네이티브 선택 메뉴(복사하기 등)가 선택 근처·최상단에 떠서 충돌하므로
        // 앵커하지 않고 화면 하단 고정 바로 띄운다. 데스크탑은 선택 영역 위에 앵커.
        const mobile = window.matchMedia("(pointer: coarse)").matches;
        const rect = range.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const x = Math.min(Math.max(cx, 60), window.innerWidth - 60);
        setPopover({ start, end, mobile, x, y: rect.top });
    }, [highlights]);

    // 데스크탑: 마우스 놓는 즉시 반응
    const handleMouseUp = useCallback(() => {
        evaluateSelection();
    }, [evaluateSelection]);

    // 모바일 포함: 선택이 바뀌면(핸들 드래그 등) 잠시 뒤 평가 — 드래그 중 깜빡임 방지용 디바운스
    useEffect(() => {
        const onSelectionChange = () => {
            if (selTimer.current) window.clearTimeout(selTimer.current);
            selTimer.current = window.setTimeout(evaluateSelection, 200);
        };
        document.addEventListener("selectionchange", onSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", onSelectionChange);
            if (selTimer.current) window.clearTimeout(selTimer.current);
        };
    }, [evaluateSelection]);

    // 팝오버 바깥 탭/클릭·스크롤 시 닫기
    useEffect(() => {
        if (!popover) return;
        const onOutside = (e: Event) => {
            if (popRef.current && e.target instanceof Node && popRef.current.contains(e.target)) return;
            setPopover(null);
        };
        const onScroll = () => setPopover(null);
        document.addEventListener("mousedown", onOutside);
        document.addEventListener("touchstart", onOutside);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            document.removeEventListener("mousedown", onOutside);
            document.removeEventListener("touchstart", onOutside);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [popover]);

    const applyColor = (color: HighlightColor) => {
        if (!popover) return;
        onAdd(recordId, popover.start, popover.end, color);
        setPopover(null);
        window.getSelection()?.removeAllRanges();
    };

    const handleMarkerClick = (e: React.MouseEvent, h: Highlight) => {
        e.stopPropagation();
        if (window.confirm("이 하이라이트를 지울까요?")) {
            onRemove(recordId, h.id);
        }
    };

    // 문장을 하이라이트 범위로 분할해 렌더
    const sorted = [...highlights]
        .filter(h => h.start >= 0 && h.end <= sentence.length && h.start < h.end)
        .sort((a, b) => a.start - b.start);

    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    for (const h of sorted) {
        if (h.start < cursor) continue; // 겹치면 건너뜀(방어)
        if (h.start > cursor) nodes.push(<React.Fragment key={`t${cursor}`}>{sentence.slice(cursor, h.start)}</React.Fragment>);
        nodes.push(
            <mark
                key={`h${h.id}`}
                className={`${styles.mark} ${h.color === "PEACH" ? styles.peach : styles.green}`}
                onClick={(e) => handleMarkerClick(e, h)}
                title="클릭하면 하이라이트 삭제"
            >
                {sentence.slice(h.start, h.end)}
            </mark>
        );
        cursor = h.end;
    }
    if (cursor < sentence.length) nodes.push(<React.Fragment key="tend">{sentence.slice(cursor)}</React.Fragment>);

    return (
        <>
            <blockquote ref={rootRef} className={className} onMouseUp={handleMouseUp}>
                {nodes}
            </blockquote>
            {popover && (
                <div
                    ref={popRef}
                    className={`${styles.popover} ${popover.mobile ? styles.bar : ""}`}
                    style={popover.mobile ? undefined : { left: popover.x, top: popover.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className={`${styles.swatch} ${styles.swatchGreen}`}
                        aria-label="초록 형광펜"
                        onClick={() => applyColor("GREEN")}
                    />
                    <button
                        type="button"
                        className={`${styles.swatch} ${styles.swatchPeach}`}
                        aria-label="살구 형광펜"
                        onClick={() => applyColor("PEACH")}
                    />
                </div>
            )}
        </>
    );
}
