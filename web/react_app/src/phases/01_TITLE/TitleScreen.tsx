import React from "react";

type TitleScreenProps = {
    isBooting: boolean;
    onEnterDrop: () => void;
};

/**
 * TitleScreen — presentational layout.
 * No store access. No dispatch. Pure props + callbacks.
 */
export default function TitleScreen({ isBooting, onEnterDrop }: TitleScreenProps) {
    return (
        <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#0D0E12] font-mono text-[#8B8FA0]">
            {/* CRT scanlines */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(13,14,18,0.04)_2px,rgba(13,14,18,0.04)_4px)]" />

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(13,14,18,0.9)_100%)]" />

            {/* Boot flash */}
            {isBooting && (
                <div className="pointer-events-none absolute inset-0 z-[999] animate-[flashAnim_0.8s_ease-out_forwards] bg-[#D4A843]" />
            )}

            {/* Title */}
            <div className="z-10 mb-15 text-center">
                <div className="text-[64px] font-bold uppercase tracking-[24px] text-[#D4A843] [text-shadow:0_0_20px_rgba(212,168,67,0.2)]">
                    DUDAEL
                </div>
                <div className="font-serif text-2xl italic tracking-[8px] text-[#4A4D58]">
                    THE DROP
                </div>
            </div>

            {/* Menu */}
            <div className="z-10 flex w-[300px] flex-col gap-4">
                <button
                    className="cursor-pointer border border-[#4A4D58] bg-transparent px-6 py-4 font-mono text-xs uppercase tracking-[4px] text-[#D4A843] transition-all duration-300 hover:bg-[rgba(212,168,67,0.1)] hover:shadow-[0_0_15px_rgba(212,168,67,0.1)]"
                    onClick={onEnterDrop}
                    disabled={isBooting}
                >
                    {isBooting ? "INITIALIZING..." : "ENTER DROP"}
                </button>
                <button className="cursor-pointer border border-[#1E2028] bg-transparent px-6 py-4 font-mono text-xs uppercase tracking-[4px] text-[#8B8FA0] transition-all duration-300 hover:border-[#D4A843] hover:text-[#D4A843] hover:bg-[rgba(212,168,67,0.05)]">
                    CODEX
                </button>
                <button className="cursor-pointer border border-[#1E2028] bg-transparent px-6 py-4 font-mono text-xs uppercase tracking-[4px] text-[#8B8FA0] transition-all duration-300 hover:border-[#D4A843] hover:text-[#D4A843] hover:bg-[rgba(212,168,67,0.05)]">
                    SETTINGS
                </button>
                <button className="cursor-pointer border border-[#1E2028] bg-transparent px-6 py-4 font-mono text-xs uppercase tracking-[4px] text-[#8B8FA0] transition-all duration-300 hover:border-[#D4A843] hover:text-[#D4A843] hover:bg-[rgba(212,168,67,0.05)]">
                    EXIT
                </button>
            </div>

            {/* System status */}
            <div className="absolute bottom-6 left-6 z-10 text-[9px] tracking-widest text-[#2A2D38]">
                SYSTEM: RADIANT CORE v0.1.0 // STATUS: NOMINAL
            </div>
        </div>
    );
}
