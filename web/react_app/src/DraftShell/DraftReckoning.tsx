import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { transition, getRunMeta } from '@du/phases';
import { formatEffect } from '@data/cards/pool';
import type { DraftCard } from '@data/cards/types';

// DraftReckoning — Stage 4C
// The player sees what their picks did to parity.
// Keeper commentary responds to the specific combination chosen.
// Stakes are shown before they enter the Level.
// On "Enter the Depth" — packet is written and phase transitions to 05_level.

export default function DraftReckoning() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const runMeta   = getRunMeta();

    // Cards arrive from Offering via router state
    const selectedCards: DraftCard[] = (location.state?.selectedCards ?? []) as DraftCard[];

    const light  = runMeta?.alignment?.light ?? 0;
    const dark   = runMeta?.alignment?.dark  ?? 0;
    const vessel = runMeta?.identity?.vessel?.toUpperCase() ?? '';

    // Compute parity deltas from selected cards
    const lightDelta = selectedCards.reduce((sum, c) => sum + (c.mechanics?.lightDelta ?? 0), 0);
    const darkDelta  = selectedCards.reduce((sum, c) => sum + (c.mechanics?.darkDelta  ?? 0), 0);

    const newLight = light + lightDelta;
    const newDark  = dark  + darkDelta;
    const swing    = Math.abs(newDark - newLight);

    // ── Keeper commentary ────────────────────────────────────────────────────
    // Responds to: card combination, vessel, and parity swing

    const keeperComment = (() => {
        const lightCards = selectedCards.filter(c => c.keeper === 'surveyor');
        const darkCards  = selectedCards.filter(c => c.keeper === 'smuggler');
        const bothLight  = lightCards.length === 2;
        const bothDark   = darkCards.length  === 2;
        const mixed      = lightCards.length === 1 && darkCards.length === 1;

        // Vessel-specific first
        if (vessel === 'PENITENT' && bothLight) {
            return { speaker: 'Surveyor', line: 'The Penitent carries the flame well. Your path is clear.' };
        }
        if (vessel === 'REBEL' && bothDark) {
            return { speaker: 'Smuggler', line: 'Full Dark. The Rebel commits. The Surveyor has noted the absence.' };
        }
        if (vessel === 'REBEL' && bothLight) {
            return { speaker: 'Surveyor', line: 'A Rebel choosing Light. This will be watched.' };
        }

        // Combination-based
        if (mixed) {
            return { speaker: 'Surveyor', line: 'Light and Dark in the same hand. The contradiction has been noted.' };
        }
        if (bothLight) {
            return { speaker: 'Surveyor', line: 'Light reveals, but demands sacrifice.' };
        }
        if (bothDark) {
            return { speaker: 'Smuggler', line: 'The Dark remembers what the Light forgets.' };
        }

        // Parity swing warning
        if (swing >= 4) {
            return { speaker: 'Smuggler', line: 'Your alignment is shifting fast. Door costs will spike at the next depth.' };
        }

        return { speaker: 'Surveyor', line: 'The descent continues.' };
    })();

    const speakerColor = keeperComment.speaker === 'Surveyor' ? '#D4A843' : '#7B4FA2';

    // ── Parity forecast ──────────────────────────────────────────────────────
    const forecast = (() => {
        if (newDark - newLight >= 3)  return 'Your path darkens. Secret doors may open.';
        if (newLight - newDark >= 3)  return 'Light holds. Doors will favor clarity.';
        return 'Parity balanced. Both paths remain open.';
    })();

    // ── Enter the Depth ──────────────────────────────────────────────────────
    const handleEnterDepth = () => {
        const rawPacket = localStorage.getItem('dudael:active_packet');
        const packet    = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        const updatedPacket = {
            ...packet,
            from: '04_draft',
            to:   '05_level',
            meta: {
                ...packet.meta,
                draftedCards:   selectedCards,
                paritySnapshot: { light: newLight, dark: newDark },
            },
        };

        transition('05_level', updatedPacket);
    };

    return (
        <>
            <div className="content-area">

                {/* Selected cards summary */}
                <div style={{ fontSize: 8, letterSpacing: 2, color: '#2A2D38', marginBottom: 4, textTransform: 'uppercase' }}>
                    You accepted
                </div>
                {selectedCards.map((card) => (
                    <div key={card.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#13141A',
                        border: '1px solid #1E2028',
                        marginBottom: 4,
                        fontSize: 10,
                    }}>
                        <span>{card.name}</span>
                        <span style={{ color: card.keeper === 'surveyor' ? '#D4A843' : '#7B4FA2', fontSize: 8 }}>
                            {formatEffect(card.mechanics)}
                        </span>
                    </div>
                ))}

                {/* Parity delta */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#13141A',
                    border: '1px solid #1E2028',
                    marginTop: 8,
                    fontSize: 10,
                }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 7, color: '#2A2D38', letterSpacing: 1, marginBottom: 4 }}>LIGHT</div>
                        <div style={{ color: '#D4A843' }}>
                            {light} → {newLight}
                            {lightDelta > 0 && <span style={{ fontSize: 8, marginLeft: 4 }}>+{lightDelta}</span>}
                        </div>
                    </div>
                    <div style={{ color: '#1E2028', alignSelf: 'center' }}>|</div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 7, color: '#2A2D38', letterSpacing: 1, marginBottom: 4 }}>DARK</div>
                        <div style={{ color: '#7B4FA2' }}>
                            {dark} → {newDark}
                            {darkDelta > 0 && <span style={{ fontSize: 8, marginLeft: 4 }}>+{darkDelta}</span>}
                        </div>
                    </div>
                </div>

                {/* Keeper commentary */}
                <div style={{
                    marginTop: 8,
                    padding: '10px 12px',
                    background: '#13141A',
                    border: '1px solid #1E2028',
                }}>
                    <div style={{ fontSize: 7, color: speakerColor, letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' }}>
                        {keeperComment.speaker}
                    </div>
                    <div className="theology-line" style={{ textAlign: 'left', padding: 0, fontSize: 11 }}>
                        "{keeperComment.line}"
                    </div>
                </div>

                {/* Parity forecast */}
                <div style={{
                    marginTop: 8,
                    fontSize: 9,
                    color: '#4A4D58',
                    textAlign: 'center',
                    letterSpacing: 1,
                    padding: '8px 0'
                }}>
                    {forecast}
                </div>

            </div>

            <div className="bottom-action">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('../offering', { relative: 'path' })}
                    style={{ flex: 0.4 }}
                >
                    Back
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleEnterDepth}
                    style={{ flex: 1 }}
                >
                    Enter the Depth
                </button>
            </div>
        </>
    );
}
