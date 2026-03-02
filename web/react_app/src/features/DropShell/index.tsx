import React from 'react';
import { transition, getRunMeta } from '@du/phases';
import { shouldIncrementMetaCounter, VESSELS, type VesselId } from '@data/vessels/vessels';
import './style.css';

export default function DropShell() {
    const runMeta = getRunMeta();

    const rawPacket = localStorage.getItem("dudael:active_packet");
    const packet = rawPacket ? JSON.parse(rawPacket) : null;
    const vesselId = (packet?.player?.vessel ?? 'EXILE') as VesselId;
    const vesselConfig = VESSELS[vesselId];

    const levelResult = packet?.meta?.levelResult || { survived: false, points: 0 };
    const forcedDrop = packet?.meta?.forcedDrop;

    const survived = levelResult.survived && !forcedDrop;

    // Meta progression check
    const metaIncremented = shouldIncrementMetaCounter(vesselId, {
        insight: runMeta?.insight ?? 0,
        currentLight: runMeta.alignment.light,
        currentDark: runMeta.alignment.dark,
    });

    const handleReturnToStaging = () => {
        console.log("♻️ Run concluded. Looping back to Staging...");

        // In a full implementation, you'd trigger a Supabase write here to save meta-progression

        const newPacket = {
            from: "07_drop",
            to: "03_staging",
            ts: Date.now(),
            user: packet?.user || { id: "guest", kind: "user" },
            player: packet?.player,
            meta: {
                previousRun: { depth: runMeta.depth, points: levelResult.points }
            }
        };

        // Transition back to the locker room
        transition("03_staging", newPacket as any);
    };

    return (
        <div className="drop-shell-wrapper">
            <div className="top-bar">
                <div>
                    <span className="top-bar-label">Phase 07</span>
                    <br />
                    <span className="top-bar-phase" style={{ color: '#B8863B' }}>Drop</span>
                </div>
            </div>

            <div className="content-area">
                <div className="theology-line">
                    {survived
                        ? "You reached the bottom. The record is written."
                        : "The Depth claimed you. But the record remains."}
                </div>

                <div className="section-label">Run Summary</div>
                <div className="drop-summary">
                    <div className="drop-stat">
                        <span className="drop-stat-label">Vessel</span>
                        <span className="drop-stat-value" style={{ color: '#D4A843' }}>{runMeta.identity?.vessel?.toUpperCase() || 'UNKNOWN'}</span>
                    </div>
                    <div className="drop-stat">
                        <span className="drop-stat-label">Depth Reached</span>
                        <span className="drop-stat-value">{runMeta.depth} / 5</span>
                    </div>
                    <div className="drop-stat">
                        <span className="drop-stat-label">Points</span>
                        <span className="drop-stat-value">{levelResult.points || runMeta.depth}</span>
                    </div>
                    <div className="drop-stat">
                        <span className="drop-stat-label">Final Parity</span>
                        <span className="drop-stat-value">
                            <span style={{ color: '#D4A843' }}>{runMeta.alignment.light}L</span> / <span style={{ color: '#7B4FA2' }}>{runMeta.alignment.dark}D</span>
                        </span>
                    </div>
                    <div className="drop-stat">
                        <span className="drop-stat-label">Status</span>
                        <span className="drop-stat-value" style={{ color: survived ? '#6B8F71' : '#C04050' }}>
                            {survived ? 'SURVIVED' : 'FALLEN'}
                        </span>
                    </div>
                    <div className="drop-stat">
                        <span className="drop-stat-label">Total Loops</span>
                        <span className="drop-stat-value">{runMeta.loopCount}</span>
                    </div>
                </div>

                <div className="section-label">Archive Extraction</div>
                <div>
                    {/* Mock unlocks based on depth/points */}
                    {runMeta.depth >= 3 && <span className="unlock-badge">+1 Currency</span>}
                    {!survived && <span className="unlock-badge" style={{ borderColor: '#C04050', color: '#C04050' }}>Scar: Fractured</span>}
                    {survived && <span className="unlock-badge" style={{ borderColor: '#D4A843', color: '#D4A843' }}>Boon: Deep Memory</span>}
                    {metaIncremented && vesselConfig.mechanics.metaCounter && (
                        <span className="unlock-badge" style={{ borderColor: '#8BA0B5', color: '#8BA0B5' }}>
                            +1 {vesselConfig.mechanics.metaCounter.charAt(0).toUpperCase() + vesselConfig.mechanics.metaCounter.slice(1)}
                        </span>
                    )}
                    {runMeta.depth < 3 && survived && <span style={{ fontSize: '9px', color: '#4A4D58' }}>No new anomalies detected.</span>}
                </div>
            </div>

            <div className="bottom-action">
                <button className="btn-primary" onClick={handleReturnToStaging}>
                    Return to Staging
                </button>
            </div>
        </div>
    );
}