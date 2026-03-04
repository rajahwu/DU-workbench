import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import type { DraftShellContext } from './DraftShell.types';
import { LIGHT_POOL, DARK_POOL, formatEffect } from '@data/cards/pool';
import type { DraftCard } from '@data/cards/types';
import { getDraftPoolCounts, type VesselId } from '@data/vessels/vessels';

const shuffle = (arr: DraftCard[]) => [...arr].sort(() => 0.5 - Math.random());

// ── Component ────────────────────────────────────────────────────────────────
// Presentational — reads runMeta via Outlet context from DraftLayout (Shell).

export default function DraftOffering() {
    const navigate  = useNavigate();
    const { runMeta } = useOutletContext<DraftShellContext>();
    const maxPicks  = 2;

    const vessel  = runMeta.runner.vesselId?.toUpperCase() ?? '';
    const insight = runMeta.metaFlags.penitentInsight;

    const [offerings, setOfferings] = useState<{ light: DraftCard[]; dark: DraftCard[] }>({ light: [], dark: [] });
    const [picked, setPicked]       = useState<DraftCard[]>([]);
    const [rerolls, setRerolls]     = useState(1);

    useEffect(() => { dealCards(); }, []);

    const dealCards = () => {
        const vesselId = (vessel || 'EXILE') as VesselId;
        const { lightCards, darkCards } = getDraftPoolCounts(
            vesselId, runMeta.alignment.current.light, runMeta.alignment.current.dark
        );
        setOfferings({
            light: shuffle(LIGHT_POOL).slice(0, lightCards),
            dark:  shuffle(DARK_POOL).slice(0, darkCards),
        });
        setPicked([]);
    };

    const handleReroll = () => {
        if (rerolls > 0) {
            setRerolls(r => r - 1);
            dealCards();
        }
    };

    const handlePick = (card: DraftCard) => {
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
    const showEffect = (card: DraftCard) => {
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
                    {offerings.light.map((card) => (
                        <div
                            key={card.id}
                            className={`draft-card ${picked.find(c => c.id === card.id) ? 'picked' : ''}`}
                            onClick={() => handlePick(card)}
                        >
                            <span className="draft-card-name">{card.name}</span>
                            {showEffect(card) && (
                                <span className="draft-card-effect" style={{ color: cardColor(card.keeper) }}>
                                    {formatEffect(card.mechanics)}
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
                    {offerings.dark.map((card) => (
                        <div
                            key={card.id}
                            className={`draft-card ${picked.find(c => c.id === card.id) ? 'picked' : ''}`}
                            onClick={() => handlePick(card)}
                        >
                            <span className="draft-card-name">{card.name}</span>
                            {showEffect(card) && (
                                <span className="draft-card-effect" style={{ color: cardColor(card.keeper) }}>
                                    {formatEffect(card.mechanics)}
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
