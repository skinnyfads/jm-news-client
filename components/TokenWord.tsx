"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useTokenContext } from "./TokenContext";

interface Token {
    surface: string;
    dictForm: string | null;
    reading: string | null;
    meanings: string[];
    pos: string[];
    reason: string | null;
}

interface TokenWordProps {
    token: Token;
    index: string;
}

export function TokenWord({ token, index }: TokenWordProps) {
    const { activeTokenIndex, handleTokenClick } = useTokenContext();
    const isOpen = activeTokenIndex === index;

    const triggerRef = React.useRef<HTMLSpanElement>(null);
    const popupRef = React.useRef<HTMLDivElement>(null);

    const [coords, setCoords] = React.useState({ top: 0, left: 0 });
    const [arrowOffset, setArrowOffset] = React.useState(0);
    const [placement, setPlacement] = React.useState<"top" | "bottom">("top");
    const [isMeasured, setIsMeasured] = React.useState(false);

    const togglePopup = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        e.preventDefault();
        handleTokenClick(index);
    };

    React.useLayoutEffect(() => {
        if (!isOpen || !triggerRef.current) {
            setIsMeasured(false);
            return;
        }

        const updatePosition = () => {
            if (!triggerRef.current || !popupRef.current) return;

            const triggerRect = triggerRef.current.getBoundingClientRect();
            const popupRect = popupRef.current.getBoundingClientRect();

            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const pWidth = popupRect.width;
            const pHeight = popupRect.height;

            const spaceAbove = triggerRect.top;
            const spaceBelow = screenHeight - triggerRect.bottom;

            let top = 0;
            let currentPlacement: "top" | "bottom" = "top";

            if (spaceBelow > pHeight + 20 || spaceBelow > spaceAbove) {
                currentPlacement = "bottom";
                top = triggerRect.bottom + scrollY + 10;
            } else {
                currentPlacement = "top";
                top = triggerRect.top + scrollY - pHeight - 10;
            }

            setPlacement(currentPlacement);

            const padding = 10;
            const triggerCenter = triggerRect.left + (triggerRect.width / 2);
            const left = triggerCenter - (pWidth / 2);
            const maxLeft = screenWidth - pWidth - padding;
            const minLeft = padding;
            const clampedViewportLeft = Math.max(minLeft, Math.min(maxLeft, left));
            const finalLeft = clampedViewportLeft + scrollX;
            const calculatedArrowOffset = triggerCenter - clampedViewportLeft;

            setCoords({ top, left: finalLeft });
            setArrowOffset(calculatedArrowOffset);
            setIsMeasured(true);
        };

        updatePosition();
    }, [isOpen]);

    if (!token.reading && token.meanings.length === 0) {
        return <span>{token.surface}</span>;
    }

    return (
        <>
            <span
                ref={triggerRef}
                className={cn(
                    "relative inline-block cursor-pointer hover:bg-orange-500/10 hover:text-orange-200 rounded-sm px-0.5 transition-colors duration-200 select-none",
                    isOpen && "bg-orange-100 text-orange-950 ring-1 ring-orange-400 [text-shadow:0_0_0.5px_currentColor]"
                )}
                onClick={togglePopup}
                data-token-trigger="true"
            >
                {token.surface}
            </span>

            {isOpen && createPortal(
                <div
                    ref={popupRef}
                    className={cn(
                        "absolute z-[9999] w-72 max-w-[90vw] p-3 rounded-lg shadow-xl bg-popover border border-border text-popover-foreground text-sm",
                        !isMeasured ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}
                    style={{
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                    data-token-popup="true"
                >
                    <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
                        <div className="flex items-baseline justify-between border-b border-border/50 pb-2">
                            <span className="text-lg font-bold text-primary">{token.reading || token.surface}</span>
                            {token.dictForm && token.dictForm !== token.surface && (
                                <span className="text-xs text-muted-foreground font-mono">{token.dictForm}</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            {token.pos.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                    {token.pos.map((p, i) => (
                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium uppercase tracking-wider">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <ol className="list-decimal list-inside space-y-1">
                                {token.meanings.map((meaning, i) => (
                                    <li key={i} className="leading-tight text-popover-foreground/90">
                                        {meaning}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "absolute border-[6px] border-transparent left-0",
                            placement === "top" ? "bottom-[-12px] border-t-border" : "top-[-12px] border-b-border"
                        )}
                        style={{
                            left: `${arrowOffset}px`,
                            transform: 'translateX(-50%)'
                        }}
                    />
                    <div
                        className={cn(
                            "absolute border-[5px] border-transparent left-0",
                            placement === "top" ? "bottom-[-10px] border-t-popover" : "top-[-10px] border-b-popover"
                        )}
                        style={{
                            left: `${arrowOffset}px`,
                            transform: 'translateX(-50%)'
                        }}
                    />
                </div>,
                document.body
            )}
        </>
    );
}
