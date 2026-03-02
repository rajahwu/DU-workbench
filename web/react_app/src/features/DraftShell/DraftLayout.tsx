import React from 'react';
import { Outlet } from 'react-router';
import { getRunMeta } from '@du/phases';
import './style.css';

// DraftLayout is the persistent frame across all three draft stages.
// It never knows which stage is active — that's the Outlet's job.
// Holds: top bar, parity display, phase label.
// Each child stage owns its content-area and bottom-action.

export default function DraftLayout() {
    const runMeta = getRunMeta();

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
            <Outlet />

        </div>
    );
}
