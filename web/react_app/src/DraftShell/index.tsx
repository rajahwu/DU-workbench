import React, { useState, useEffect } from 'react';
import { transition, getRunMeta } from '@du/phases';
import './style.css';

// Master Prototype Card Pool
const cardPool = {
    light: [
        { id: 'l1', name: 'Sanctum Ward', effect: '+2 Light', light: 2, dark: 0 },
        { id: 'l2', name: 'Grace Thread', effect: '+1 Light', light: 1, dark: 0 },
        { id: 'l3', name: 'Beacon Pulse', effect: '+3 Light', light: 3, dark: 0 },
        { id: 'l4', name: 'Covenant Seal', effect: '+1 Light, +1 HP', light: 1, dark: 0, heal: 1 },
    ],
    dark: [
        { id: 'd1', name: "Root-Cutter's Venom", effect: '+2 Dark', light: 0, dark: 2 },
        { id: 'd2', name: 'Veil Fragment', effect: '+1 Dark', light: 0, dark: 1 },
        { id: 'd3', name: 'Abyssal Echo', effect: '+3 Dark', light: 0, dark: 3 },
        { id: 'd4', name: "Smuggler's Cut", effect: '+1 Dark, +2 PTS', light: 0, dark: 1, points: 2 },
    ]
};

// Utility to shuffle cards
const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());

export default function DraftShell() {
    const runMeta = getRunMeta();
    const maxPicks = 2;

    const [offerings, setOfferings] = useState({ light: [], dark: [] });
    const [pickedCards, setPickedCards] = useState<any[]>([]);
    const [rerolls, setRerolls] = useState(1); // Give them 1 free reroll per draft to add weight

    // Deal cards on mount
    useEffect(() => {
        dealCards();
    }, []);

    const dealCards = () => {
        setOfferings({
            light: shuffle(cardPool.light).slice(0, 2) as any,
            dark: shuffle(cardPool.dark).slice(0, 2) as any
        });
        setPickedCards([]);
    };

    const handleReroll = () => {
        if (rerolls > 0) {
            setRerolls(r => r - 1);
            dealCards();
        }
    };

    const handlePickCard = (card: any) => {
        if (pickedCards.length < maxPicks && !pickedCards.find(c => c.id === card.id)) {
            setPickedCards([...pickedCards, card]);
        }
    };

    const handleEnterDepth = () => {
        console.log("⏬ Drafting Complete. Loading Level Cartridge...", pickedCards);

        const rawPacket = localStorage.getItem("dudael:active_packet");
        const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        const updatedPacket = {
            ...packet,
            from: "04_draft",
            to: "05_level",
            meta: {
                ...packet.meta,
                draftedCards: pickedCards // We carry the drafted loadout into the Level!
            }
        };

        transition("05_level", updatedPacket);
    };

    return (
        <div className="draft-shell-wrapper">
            <div className="top-bar">
                <div>
                    <span className="top-bar-label">Phase 04</span>
                    <br />
                    <span className="top-bar-phase" style={{ color: '#7B4FA2' }}>Draft</span>
                </div>
                <div className="parity-display">
                    <span><span className="parity-dot light"></span>{runMeta.alignment.light}</span>
                    <span><span className="parity-dot dark"></span>{runMeta.alignment.dark}</span>
                </div>
            </div>

            <div className="content-area">
                <div className="theology-line">The Keepers present their offerings.</div>

                {/* LIGHT KEEPER */}
                <div className="keeper-section">
                    <div className="keeper-header">
                        <span className="keeper-name" style={{ color: '#D4A843' }}>The Surveyor</span>
                        <span className="keeper-tag" style={{ borderColor: '#D4A84340', color: '#D4A843' }}>Light</span>
                    </div>
                    {offerings.light.map((card: any) => (
                        <div
                            key={card.id}
                            className={`draft-card ${pickedCards.find(c => c.id === card.id) ? 'picked' : ''}`}
                            onClick={() => handlePickCard(card)}
                        >
                            <span className="draft-card-name">{card.name}</span>
                            <span className="draft-card-effect" style={{ color: '#D4A843' }}>{card.effect}</span>
                        </div>
                    ))}
                </div>

                {/* DARK KEEPER */}
                <div className="keeper-section">
                    <div className="keeper-header">
                        <span className="keeper-name" style={{ color: '#7B4FA2' }}>The Smuggler</span>
                        <span className="keeper-tag" style={{ borderColor: '#7B4FA240', color: '#7B4FA2' }}>Dark</span>
                    </div>
                    {offerings.dark.map((card: any) => (
                        <div
                            key={card.id}
                            className={`draft-card ${pickedCards.find(c => c.id === card.id) ? 'picked' : ''}`}
                            onClick={() => handlePickCard(card)}
                        >
                            <span className="draft-card-name">{card.name}</span>
                            <span className="draft-card-effect" style={{ color: '#7B4FA2' }}>{card.effect}</span>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', fontSize: '8px', color: '#2A2D38', marginTop: '4px' }}>
                    Pick {maxPicks - pickedCards.length} more card(s)
                </div>
            </div>

            <div className="bottom-action">
                <button
                    className="btn btn-secondary"
                    onClick={handleReroll}
                    disabled={rerolls <= 0 || pickedCards.length > 0} // Can't reroll if you've already picked one
                    style={{ flex: 0.4 }}
                >
                    Reroll ({rerolls})
                </button>
                <button
                    className="btn btn-primary"
                    disabled={pickedCards.length < maxPicks}
                    onClick={handleEnterDepth}
                    style={{ flex: 1 }}
                >
                    Enter the Depth
                </button>
            </div>
        </div>
    );
}