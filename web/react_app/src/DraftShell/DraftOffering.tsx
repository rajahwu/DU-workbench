import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getRunMeta } from '@du/phases';

// DraftOffering — Stage 4B
// The cards are revealed. The player picks 2.
// This is where the existing DraftShell logic lives now.
// On commit, selected cards are passed to Reckoning via router state.

// ── Card Pool ────────────────────────────────────────────────────────────────
// TODO: replace with live card pool from game/core/cards/types.ts
// and vessel-aware getDraftPoolCounts() from game/core/vessels/vessels.ts

const cardPool = {
    light: [
        { id: 'l1', keeper: 'surveyor', name: 'Sanctum Ward',           effect: '+2 Light',          light: 2, dark: 0 },
        { id: 'l2', keeper: 'surveyor', name: 'Grace Thread',            effect: '+1 Light',          light: 1, dark: 0 },
        { id: 'l3', keeper: 'surveyor', name: 'Beacon Pulse',            effect: '+3 Light',          light: 3, dark: 0 },
        { id: 'l4', keeper: 'surveyor', name: 'Covenant Seal',           effect: '+1 Light, +1 HP',   light: 1, dark: 0, heal: 1 },
        { id: 'l5', keeper: 'surveyor', name: 'Lantern at the Threshold',effect: '+2 Light, +1 HP',   light: 2, dark: 0, heal: 1 },
    ],
    dark: [
        { id: 'd1', keeper: 'smuggler', name: "Root-Cutter's Venom",    effect: '+2 Dark',           light: 0, dark: 2 },
        { id: 'd2', keeper: 'smuggler', name: 'Veil Fragment',           effect: '+1 Dark',           light: 0, dark: 1 },
        { id: 'd3', keeper: 'smuggler', name: 'Abyssal Echo',            effect: '+3 Dark',           light: 0, dark: 3 },
        { id: 'd4', keeper: 'smuggler', name: "Smuggler's Cut",          effect: '+1 Dark, +2 PTS',   light: 0, dark: 1, points: 2 },
        { id: 'd5', keeper: 'smuggler', name: 'Root-Whisper',            effect: '+3 Dark, -Stability',light: 0, dark: 3, stabilityDelta: -1 },
    ]
};

const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());

// ── Component ────────────────────────────────────────────────────────────────

export default function DraftOffering() {
    const navigate  = useNavigate();
    const runMeta   = getRunMeta();
    const maxPicks  = 2;

    const vessel  = runMeta?.player?.vessel?.toUpperCase() ?? '';
    const insight = runMeta?.meta?.insight ?? 0;

    const [offerings, setOfferings] = useState<{ light: any[]; dark: any[] }>({ light: [], dark: [] });
    const [picked, setPicked]       = useState<any[]>([]);
    const [rerolls, setRerolls]     = useState(1);

    useEffect(() => { dealCards(); }, []);

    // TODO: wire getDraftPoolCounts(vessel, light, dark) here
    // to determine how many light/dark cards to slice
    const dealCards = () => {
        setOfferings({
            light: shuffle(cardPool.light).slice(0, 2),
            dark:  shuffle(cardPool.dark).slice(0, 2),
        });
        setPicked([]);
    };

    const handleReroll = () => {
        if (rerolls > 0) {
            setRerolls(r => r - 1);
            dealCards();
        }
    };

    const handlePick = (card: any) => {
        if (picked.length < maxPicks && !picked.find(c => c.id === card.id)) {
            setPicked(prev => [...prev, card]);
        }
    };

    const handleCommit = () => {
        // Pass selected cards to Reckoning via router state —
        // Redux slot ready when Redux is wired
        navigate('../reckoning', {
            relative: 'path',
            state: { selectedCards: picked }
        });
    };

    // Insight-gated visibility — Penitent sees more per card
    // TODO: wire full visibility manifest from card.types.ts
    const showEffect = (card: any) => {
        if (vessel === 'PENITENT' && insight === 0) return false; // pure lore at 0
        return true;
    };

    const cardColor = (keeper: string) => keeper === 'surveyor' ? '#D4A843' : '#7B4FA2';

    return (
        <>
            <div className="content-area">
                <div className="theology-line">
                    Choose carefully. The draft shapes what comes next.
                </div>

                {/* ── Surveyor cards ── */}
                <div className="keeper-section">
                    <div className="keeper-header">
                        <span className="keeper-name" style={{ color: '#D4A843' }}>The Surveyor</span>
                        <span className="keeper-tag" style={{ borderColor: '#D4A84340', color: '#D4A843' }}>Light</span>
                    </div>
                    {offerings.light.map((card: any) => (
                        <div
                            key={card.id}
                            className={`draft-card ${picked.find(c => c.id === card.id) ? 'picked' : ''}`}
                            onClick={() => handlePick(card)}
                        >
                            <span className="draft-card-name">{card.name}</span>
                            {showEffect(card) && (
                                <span className="draft-card-effect" style={{ color: cardColor(card.keeper) }}>
                                    {card.effect}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Smuggler cards ── */}
                <div className="keeper-section">
                    <div className="keeper-header">
                        <span className="keeper-name" style={{ color: '#7B4FA2' }}>The Smuggler</span>
                        <span className="keeper-tag" style={{ borderColor: '#7B4FA240', color: '#7B4FA2' }}>Dark</span>
                    </div>
                    {offerings.dark.map((card: any) => (
                        <div
                            key={card.id}
                            className={`draft-card ${picked.find(c => c.id === card.id) ? 'picked' : ''}`}
                            onClick={() => handlePick(card)}
                        >
                            <span className="draft-card-name">{card.name}</span>
                            {showEffect(card) && (
                                <span className="draft-card-effect" style={{ color: cardColor(card.keeper) }}>
                                    {card.effect}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pick counter */}
                <div style={{ textAlign: 'center', fontSize: 8, color: '#2A2D38', marginTop: 4 }}>
                    {picked.length < maxPicks
                        ? `Pick ${maxPicks - picked.length} more`
                        : 'Selection complete'}
                </div>
            </div>

            <div className="bottom-action">
                <button
                    className="btn btn-secondary"
                    onClick={handleReroll}
                    disabled={rerolls <= 0 || picked.length > 0}
                    style={{ flex: 0.4 }}
                >
                    Reroll ({rerolls})
                </button>
                <button
                    className="btn btn-primary"
                    disabled={picked.length < maxPicks}
                    onClick={handleCommit}
                    style={{ flex: 1 }}
                >
                    Commit
                </button>
            </div>
        </>
    );
}
