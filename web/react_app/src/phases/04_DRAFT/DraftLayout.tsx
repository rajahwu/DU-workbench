import React from 'react';
import { Outlet } from 'react-router';
import { getRunMeta } from '@du/phases';
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import type { DraftShellContext } from './DraftShell.types';
import type { DraftCard } from '@data/cards/types';
import './style.css';

// DraftLayout is the Shell for the Draft phase.
// It reads engine state once & passes it to sub-routes via Outlet context.
// Sub-routes (Approach, Offering, Reckoning) are presentational — no direct
// store access, no getRunMeta() calls.

export default function DraftLayout() {
    const runMeta = getRunMeta();
    const dispatch = useAppDispatch();

    const handleEnterDepth = (selectedCards: unknown[]) => {
        const rawPacket = localStorage.getItem('dudael:active_packet');
        const packet    = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };
        const cards = selectedCards as DraftCard[];

        const lightDelta = cards.reduce((sum, c) => sum + (c.mechanics?.lightDelta ?? 0), 0);
        const darkDelta  = cards.reduce((sum, c) => sum + (c.mechanics?.darkDelta  ?? 0), 0);

        const updatedPacket = {
            ...packet,
            from: '04_draft',
            to:   '05_level',
            meta: {
                ...packet.meta,
                draftedCards:   cards,
                paritySnapshot: {
                    light: (runMeta?.alignment?.light ?? 0) + lightDelta,
                    dark:  (runMeta?.alignment?.dark  ?? 0) + darkDelta,
                },
            },
        };
        dispatch(requestTransition("05_level", updatedPacket));
    };

    const ctx: DraftShellContext = { runMeta, onEnterDepth: handleEnterDepth };

    return (
        <div className="draft-shell-wrapper">

            {/* ── Top Bar — always visible ── */}
            <div className="top-bar">
                <div>
                    <span className="top-bar-label">Phase 04</span>
                    <br />
                    <span className="top-bar-phase" style={{ color: '#7B4FA2' }}>Draft</span>
                </div>

                <div className="parity-display">
                    <span>
                        <span className="parity-dot light"></span>
                        {runMeta.alignment.light}
                    </span>
                    <span>
                        <span className="parity-dot dark"></span>
                        {runMeta.alignment.dark}
                    </span>
                </div>
            </div>

            {/* ── Cartridge slot — stage renders here ── */}
            <Outlet context={ctx} />

        </div>
    );
}
