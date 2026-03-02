import React from 'react';
import { transition, getRunMeta } from '@du/phases';
import { getDoorCosts, getSecretDoorThreshold, type VesselId } from '@data/vessels/vessels';
import './style.css';

export default function DoorShell() {
    const runMeta = getRunMeta();

    const light = runMeta.alignment.light;
    const dark = runMeta.alignment.dark;
    const depth = runMeta.depth;
    const maxDepth = 5;

    // Door costs from vessel config — scale with depth + vessel modifiers
    const packetRaw = localStorage.getItem("dudael:active_packet");
    const vesselId = (packetRaw ? JSON.parse(packetRaw)?.player?.vessel : 'EXILE') as VesselId;
    const { lightCost, darkCost } = getDoorCosts(vesselId, depth);
    const secretThreshold = getSecretDoorThreshold(vesselId);

    const canLight = light >= lightCost;
    const canDark = dark >= darkCost;
    const canSecret = (dark - light) >= secretThreshold;
    const isMaxDepth = depth >= maxDepth;

    const handleChooseDoor = (path: 'light' | 'dark' | 'secret') => {
        console.log(`🚪 Opening ${path.toUpperCase()} door. Continuing loop...`);

        const rawPacket = localStorage.getItem("dudael:active_packet");
        const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        // If they hit max depth, they extract safely. Otherwise, inner loop back to Draft.
        const targetPhase = isMaxDepth ? "07_drop" : "04_draft";

        const updatedPacket = {
            ...packet,
            from: "06_door",
            to: targetPhase,
            meta: {
                ...packet.meta,
                doorChosen: path
            }
        };

        transition(targetPhase as any, updatedPacket);
    };

    const handleForcedDrop = () => {
        console.log("☠️ No doors available. Forced Drop.");
        const rawPacket = localStorage.getItem("dudael:active_packet");
        const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        const updatedPacket = {
            ...packet,
            from: "06_door",
            to: "07_drop",
            meta: { ...packet.meta, forcedDrop: true }
        };

        transition("07_drop", updatedPacket);
    };

    return (
        <div className="door-shell-wrapper">
            <div className="top-bar">
                <div>
                    <span className="top-bar-label">Phase 06</span>
                    <br />
                    <span className="top-bar-phase" style={{ color: '#8BA0B5' }}>Door</span>
                </div>
                <div className="parity-display">
                    <span><span className="parity-dot light"></span>{light}</span>
                    <span><span className="parity-dot dark"></span>{dark}</span>
                </div>
            </div>

            <div className="content-area">
                <div className="theology-line">Each door leads forward. Only some are open to you.</div>
                <div className="section-label">Available Paths — Depth {depth + 1}</div>

                <div
                    className={`door-option ${canLight ? '' : 'locked'}`}
                    onClick={() => canLight && handleChooseDoor('light')}
                    style={canLight ? { borderColor: '#D4A84340' } : {}}
                >
                    <div className="door-option-name" style={{ color: '#D4A843' }}>Path of Light</div>
                    <div className="door-option-desc">A corridor of sanctified luminescence</div>
                    <div className="door-cost">
                        Requires: <span className="required" style={{ color: '#D4A843' }}>{lightCost} Light</span> {canLight ? '✓' : '— locked'}
                    </div>
                </div>

                <div
                    className={`door-option ${canDark ? '' : 'locked'}`}
                    onClick={() => canDark && handleChooseDoor('dark')}
                    style={canDark ? { borderColor: '#7B4FA240' } : {}}
                >
                    <div className="door-option-name" style={{ color: '#7B4FA2' }}>Path of Shadow</div>
                    <div className="door-option-desc">A passage shrouded in twilight</div>
                    <div className="door-cost">
                        Requires: <span className="required" style={{ color: '#7B4FA2' }}>{darkCost} Dark</span> {canDark ? '✓' : '— locked'}
                    </div>
                </div>

                <div
                    className={`door-option ${canSecret ? '' : 'locked'}`}
                    onClick={() => canSecret && handleChooseDoor('secret')}
                    style={canSecret ? { borderColor: '#B8863B40' } : {}}
                >
                    <div className="door-option-name" style={{ color: '#B8863B' }}>Secret Door</div>
                    <div className="door-option-desc">Requires mastery of both paths</div>
                    <div className="door-cost">
                        Requires: <span className="required" style={{ color: '#B8863B' }}>{secretThreshold}+ Dark over Light</span> {canSecret ? '✓' : '— locked'}
                    </div>
                </div>

                {(!canLight && !canDark && !canSecret) && (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <button className="btn-danger" onClick={handleForcedDrop}>No doors open — Drop</button>
                    </div>
                )}
            </div>
        </div>
    );
}