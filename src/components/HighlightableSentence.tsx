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
    x: number;
    y: number;
}

/**
 * 문장(sentence)을 하이라이트 범위에 맞춰 마커로 쪼개 렌더하고,
 * 마우스로 일부를 선택하면 색(초록/살구) 팝오버를 띄워 하이라이트를 추가한다.
 * 마커를 클릭하면 해당 하이라이트를 삭제한다.
 * offset은 sentence 문자열 기준(UTF-16 code unit)이며 서버와 일치한다.
 */
export default function HighlightableSentence({
    recordId, sentence, highlights, className, onAdd, onRemove,
}: Props) {
    const rootRef = useRef<HTMLQuoteElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);
    const [popover, setPopover] = useState<PopoverState | null>(null);

    // 텍스트 선택 → sentence 기준 offset 계산 → 색 팝오버 표시
    const handleMouseUp = useCallback(() => {
        const root = rootRef.current;
        if (!root) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setPopover(null); return; }

        const range = sel.getRangeAt(0);
        if (!root.contains(range.commonAncestorContainer)) { setPopover(null); return; }

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

        const rect = range.getBoundingClientRect();
        setPopover({ start, end, x: rect.left + rect.width / 2, y: rect.top });
    }, [highlights]);

    // 팝오버 바깥 클릭/스크롤 시 닫기
    useEffect(() => {
        if (!popover) return;
        const onDocMouseDown = (e: MouseEvent) => {
            if (popRef.current && e.target instanceof Node && popRef.current.contains(e.target)) return;
            setPopover(null);
        };
        const onScroll = () => setPopover(null);
        document.addEventListener("mousedown", onDocMouseDown);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            document.removeEventListener("mousedown", onDocMouseDown);
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
                    className={styles.popover}
                    style={{ left: popover.x, top: popover.y }}
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
