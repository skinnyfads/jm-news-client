"use client";

import * as React from "react";

interface TokenContextType {
    activeTokenIndex: string | null;
    handleTokenClick: (index: string) => void;
    closeAll: () => void;
}

const TokenContext = React.createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
    const [activeTokenIndex, setActiveTokenIndex] = React.useState<string | null>(null);

    const handleTokenClick = (index: string) => {
        if (activeTokenIndex === index) {
            setActiveTokenIndex(null);
            return;
        }

        if (activeTokenIndex !== null) {
            setActiveTokenIndex(null);
        } else {
            setActiveTokenIndex(index);
        }
    };

    const closeAll = () => {
        setActiveTokenIndex(null);
    };

    React.useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as Element;
            if (target.closest('[data-token-trigger="true"]') || target.closest('[data-token-popup="true"]')) {
                return;
            }
            setActiveTokenIndex(null);
        };

        document.addEventListener("click", handleGlobalClick);
        return () => {
            document.removeEventListener("click", handleGlobalClick);
        };
    }, []);

    return (
        <TokenContext.Provider value={{ activeTokenIndex, handleTokenClick, closeAll }}>
            {children}
        </TokenContext.Provider>
    );
}

export function useTokenContext() {
    const context = React.useContext(TokenContext);
    if (!context) {
        throw new Error("useTokenContext must be used within a TokenProvider");
    }
    return context;
}
