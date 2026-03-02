import React, { useState } from 'react';
import { transition, getRunMeta } from '@du/phases';
import './style.css';

// The data from your prototype, adapted for React state
const phaseData = {
    title: { name: 'Title', color: '#4A4D58', summary: 'Entry point. Brand presence, session initialization, meta-progress loading. The forensic archive opens.', theology: 'The archive door. Before the descent, there is the threshold — the moment of choosing to enter.' },
    select: { name: 'Select', color: '#D4A843', summary: 'Vessel class selection. Player commits identity for this run. Each Vessel shapes the entire downstream experience.', theology: 'You choose what you carry into the dark. The Vessel is not armor — it is temperament.' },
    staging: { name: 'Staging', color: '#6B8F71', summary: 'The locker room. Heal, apply skills, spend meta-currency, review loadout. This is the calm between descents. Re-entry point after death.', theology: 'Even the condemned prepare. The Staging Area is liturgical — the ritual before the ordeal.' },
    draft: { name: 'Draft', color: '#7B4FA2', summary: 'The Keepers present cards. The Surveyor (Light) and Smuggler (Dark) each offer selections. Your draft shapes what tools you carry into the Level.', theology: 'The Keepers do not serve you. They offer what serves their own alignment. Choose carefully — every card tilts the balance.' },
    level: { name: 'Level', color: '#C04050', summary: 'Active gameplay. A flexible container that loads different mini-game types. Points earned here determine which Doors become available.', theology: 'The Depth tests. It does not explain itself. The Vessel endures or it does not.', levelTypes: ['Top-Down', 'Platformer', 'Puzzle', 'Expandable'] },
    door: { name: 'Door', color: '#8BA0B5', summary: 'Path selection. Performance in Level determines which Doors are available. Each Door leads to a different Draft → Level configuration.', theology: 'Every door is a question: how much further will you go? The answer writes itself into the record.' },
    drop: { name: 'Drop / Loop', color: '#B8863B', summary: 'Terminal state. Death or extraction triggers meta-progression writeback. Unlocks, scars, boons, persist to Supabase.', theology: 'Dying in the Drop is not failure. It is testimony. The record of what you attempted is the offering.' }
};

const phasesList = [
    { id: 'title', icon: '◈', num: '01' },
    { id: 'select', icon: '⬡', num: '02' },
    { id: 'staging', icon: '⊞', num: '03' },
    { id: 'draft', icon: '⊟', num: '04' },
    { id: 'level', icon: '◉', num: '05' },
    { id: 'door', icon: '⊡', num: '06' },
    { id: 'drop', icon: '⊘', num: '07' }
];

export default function StagingShell() {
    const [activePhaseId, setActivePhaseId] = useState<keyof typeof phaseData>('staging');
    const activeData = phaseData[activePhaseId];

    // Pull live run stats from the engine
    const runMeta = getRunMeta();

    const handleInitiateDraft = () => {
        console.log("⏬ Commencing Draft sequence...");
        const rawPacket = localStorage.getItem("dudael:active_packet");
        const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        const updatedPacket = {
            ...packet,
            from: "03_staging",
            to: "04_draft"
        };

        transition("04_draft", updatedPacket);
    };

    return (
        <div className="staging-shell-wrapper">
            <div className="header">
                <div className="header-title">
                    Sinerine Forensic Archive
                    <span>Diagnostic & Staging</span>
                </div>
                <div className="header-meta">
                    DOCUMENT: PHASE-FSM-001<br />
                    VESSEL LOCK: CONFIRMED<br />
                    SYSTEM: AWAITING DESCENT
                </div>
            </div>

            {/* LIVE ENGINE DATA */}
            <div className="live-stats-bar">
                <div className="stat-block">
                    <span className="stat-label">Vessel Lock</span>
                    <span className="stat-value" style={{ color: '#D4A843' }}>{runMeta.identity?.vessel?.toUpperCase() || 'UNKNOWN'}</span>
                </div>
                <div className="stat-block">
                    <span className="stat-label">Current Depth</span>
                    <span className="stat-value" style={{ color: '#6B8F71' }}>Lvl {runMeta.depth}</span>
                </div>
                <div className="stat-block">
                    <span className="stat-label">Loop Count</span>
                    <span className="stat-value" style={{ color: '#7B4FA2' }}>{runMeta.loopCount}</span>
                </div>
                <div className="stat-block">
                    <span className="stat-label">Parity Alignment</span>
                    <span className="stat-value" style={{ color: '#8BA0B5' }}>{runMeta.parity.toUpperCase()}</span>
                </div>
            </div>

            <div className="diagram-container">
                <div className="diagram-label">Routing Topology // Select node for architecture specs</div>

                <div className="phase-flow">
                    {phasesList.map((phase, index) => (
                        <React.Fragment key={phase.id}>
                            <div
                                className={`phase-node ${activePhaseId === phase.id ? 'active' : ''}`}
                                data-phase={phase.id}
                                onClick={() => setActivePhaseId(phase.id as keyof typeof phaseData)}
                            >
                                <div className="phase-box">
                                    <div className="phase-number">{phase.num}</div>
                                    <div className="phase-icon">{phase.icon}</div>
                                </div>
                                <div className="phase-name">{phaseData[phase.id as keyof typeof phaseData].name}</div>
                                <div className="phase-type">
                                    {phase.id === 'title' ? 'Entry' : phase.id === 'select' ? 'Identity' : phase.id === 'staging' ? 'Prep' : phase.id === 'drop' ? 'Terminal' : 'Loop'}
                                </div>
                            </div>
                            {index < phasesList.length - 1 && <div className="phase-arrow">→</div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="loop-svg-container">
                <svg viewBox="0 0 700 80" width="700" height="80" xmlns="http://www.w3.org/2000/svg">
                    <line x1="200" y1="10" x2="200" y2="20" stroke="#6B8F71" strokeWidth="0.5" opacity="0.4" />
                    <line x1="200" y1="20" x2="650" y2="20" stroke="#6B8F71" strokeWidth="0.5" opacity="0.4" />
                    <line x1="650" y1="10" x2="650" y2="20" stroke="#6B8F71" strokeWidth="0.5" opacity="0.4" />
                    <text x="425" y="16" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#6B8F71" fillOpacity="0.5" textAnchor="middle" letterSpacing="2">RUN LOOP — STAGING RE-ENTRY ON DEATH</text>

                    <line x1="300" y1="40" x2="300" y2="50" stroke="#7B4FA2" strokeWidth="0.8" opacity="0.6" />
                    <line x1="300" y1="50" x2="550" y2="50" stroke="#7B4FA2" strokeWidth="0.8" opacity="0.6" />
                    <line x1="550" y1="40" x2="550" y2="50" stroke="#7B4FA2" strokeWidth="0.8" opacity="0.6" />
                    <path d="M 550 50 C 560 50 560 65 540 65 L 310 65 C 290 65 290 50 300 50" fill="none" stroke="#7B4FA2" strokeWidth="0.6" opacity="0.4" strokeDasharray="3 3" />
                    <polygon points="300,48 296,53 304,53" fill="#7B4FA2" fillOpacity="0.4" />
                    <text x="425" y="47" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#7B4FA2" fillOpacity="0.7" textAnchor="middle" letterSpacing="2">INNER LOOP — DRAFT → LEVEL → DOOR</text>
                </svg>
            </div>

            <div className="detail-panel">
                <div className="detail-col">
                    <div className="detail-label">Phase Architecture — <span style={{ color: activeData.color }}>{activeData.name}</span></div>
                    <div className="detail-value">{activeData.summary}</div>
                    <div className="theology-note">{activeData.theology}</div>
                </div>

                <div className="detail-col">
                    <div className="detail-label">System Context</div>
                    <div className="loop-indicator" style={{ border: `1px solid ${activeData.color}40`, color: activeData.color }}>
                        {['draft', 'level', 'door'].includes(activePhaseId) ? 'INNER LOOP' : ['staging', 'drop'].includes(activePhaseId) ? 'OUTER LOOP' : 'LINEAR'}
                    </div>
                    <div style={{ fontSize: '8px', color: '#2A2D38', marginTop: '8px', lineHeight: 1.8 }}>
                        {['draft', 'level', 'door'].includes(activePhaseId) ? 'Draft → Level → Door repeats as the player descends through Depth. Each cycle the cards change, the difficulty scales, and the parity shifts.' : 'Core checkpoint. Progression limits applied here.'}
                    </div>
                </div>

                <div className="detail-col" style={{ justifyContent: 'flex-end' }}>
                    {/* ONLY SHOW INITIATE DRAFT BUTTON IF WE ARE ACTUALLY IN STAGING AND LOOKING AT STAGING DOCS */}
                    <button
                        className="draft-button"
                        onClick={handleInitiateDraft}
                    >
                        INITIATE DRAFT
                    </button>
                </div>
            </div>

            <div className="footer-bar"></div>
            <div className="footer-text">
                <span>SINERINE // V-00 PHASE ARCHITECTURE</span>
                <span>7 PHASES // 2 LOOPS // 1 SURFACE</span>
            </div>
        </div>
    );
}