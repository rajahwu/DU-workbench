import React, { useState, useEffect, useRef } from 'react';
import { getRunMeta, PhasePacket } from '@du/phases';
import { VESSELS, getLevelCombatDeltas, type VesselId } from '@data/vessels/vessels';
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import './style.css';

const levelNames = ['The Threshold', 'The Hollow', 'The Furnace', 'The Archive', 'Dudael Core'];
const levelTypes = ['Puzzle', 'Top-Down', 'Platformer', 'Puzzle', 'Survival'];

export default function LevelShell() {
    const runMeta = getRunMeta();
    const depth = runMeta.depth || 1;
    const vessel = runMeta?.identity?.vessel?.toUpperCase() ?? '';
    const maxDepth = 5;

    // Vessel-aware combat config
    const vesselId = (vessel || 'EXILE') as VesselId;
    const combatDeltas = getLevelCombatDeltas(vesselId);
    const maxHealth = VESSELS[vesselId].maxHealth;

    // Game State
    const [gameActive, setGameActive] = useState(false);
    const [gameOverMsg, setGameOverMsg] = useState<string | null>("INITIALIZING CARTRIDGE...");
    const [timeLeft, setTimeLeft] = useState(100);

    // HUD State (In a real implementation, we'd dispatch Redux actions, but local state works for the cartridge runtime)
    const [health, setHealth] = useState(maxHealth); // Resetting to max for testing, but you'd pull this from meta eventually
    const [points, setPoints] = useState(0);
    const [light, setLight] = useState(runMeta.alignment.light);
    const [dark, setDark] = useState(runMeta.alignment.dark);

    // 3x3 Grid State
    const [litCell, setLitCell] = useState<{ idx: number, type: 'light' | 'dark' } | null>(null);
    const [cellEffects, setCellEffects] = useState<Record<number, 'hit' | 'miss'>>({});
    const dispatch = useAppDispatch();

    // Ref for safe tracking inside intervals
    const stateRef = useRef({ health, points, tapsHit: 0, missCount: 0, tapsNeeded: 5 + (depth * 2) });

    // Initialize and start game
    useEffect(() => {
        // Check Draft Payload
        const rawPacket = localStorage.getItem("dudael:active_packet");
        if (rawPacket) {
            const packet = JSON.parse(rawPacket);
            console.log("🎒 Loaded Cartridge with Drafted Cards:", packet.meta?.draftedCards || "None");
        }

        const startTimer = setTimeout(() => {
            setGameOverMsg(null);
            setGameActive(true);
            lightRandomCell();
        }, 1500);

        return () => clearTimeout(startTimer);
    }, []);

    // Main Timer Loop
    useEffect(() => {
        if (!gameActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1.5) {
                    endGame("TIME EXPIRED", false);
                    return 0;
                }
                return prev - (1.5 * combatDeltas.timerMultiplier);
            });
        }, 100);

        return () => clearInterval(timer);
    }, [gameActive]);

    const lightRandomCell = () => {
        setLitCell({
            idx: Math.floor(Math.random() * 9),
            type: Math.random() > 0.5 ? 'light' : 'dark'
        });
        setCellEffects({});
    };

    const endGame = (msg: string, survived: boolean) => {
        setGameActive(false);
        setGameOverMsg(msg);
        setLitCell(null);
        
        setTimeout(() => {
            const rawPacket = localStorage.getItem("dudael:active_packet");
            const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

            // const targetPhase = survived ? "06_door" : "07_drop";

            // Pass the results forward
            const updatedPacket: PhasePacket = {
                ...packet,
                from: "05_level",
                to: "06_door",
                meta: {
                    ...packet.meta,
                    levelResult: { survived, points: stateRef.current.points }
                }
            };
            dispatch(requestTransition("06_door", updatedPacket));
        }, 2000); // Wait 2 seconds so player sees the outcome
    };

    const handleTap = (idx: number) => {
        if (!gameActive) return;

        if (litCell && idx === litCell.idx) {
            // HIT
            setCellEffects({ [idx]: 'hit' });
            setLitCell(null);

            stateRef.current.tapsHit += 1;
            stateRef.current.points += depth * combatDeltas.pointsPerHit;
            setPoints(stateRef.current.points);

            if (litCell.type === 'light') setLight(l => l + 1);
            else setDark(d => d + 1);

            if (stateRef.current.tapsHit >= stateRef.current.tapsNeeded) {
                // Perfect level: zero misses → heal
                if (stateRef.current.missCount === 0 && combatDeltas.perfectLevelHeal > 0) {
                    stateRef.current.health = Math.min(
                        stateRef.current.health + combatDeltas.perfectLevelHeal, maxHealth
                    );
                    setHealth(stateRef.current.health);
                }
                endGame("DEPTH CLEARED", true);
            } else {
                setTimeout(lightRandomCell, 300);
            }
        } else {
            // MISS
            setCellEffects({ [idx]: 'miss' });
            stateRef.current.missCount += 1;

            // Miss forgiveness: every Nth miss is absorbed (e.g. Shadow every 3rd)
            const forgiven = combatDeltas.missForgivenessEveryN !== null
                && stateRef.current.missCount % combatDeltas.missForgivenessEveryN === 0;

            if (!forgiven) {
                stateRef.current.health -= combatDeltas.damagePerMiss;
                setHealth(stateRef.current.health);
            }

            if (stateRef.current.health <= 0) {
                endGame("VESSEL DESTROYED", false);
            } else {
                setTimeout(() => setCellEffects(prev => {
                    const next = { ...prev };
                    delete next[idx];
                    return next;
                }), 200);
            }
        }
    };

    const healthPct = (health / maxHealth) * 100;

    return (
        <div className="level-shell-wrapper">
            <div className="top-bar">
                <div>
                    <span className="top-bar-label">Depth {depth}</span>
                    <br />
                    <span className="top-bar-phase" style={{ color: '#C04050' }}>{levelNames[depth - 1] || `Depth ${depth}`}</span>
                </div>
                <div className="parity-display">
                    <span><span className="parity-dot light"></span>{light}</span>
                    <span><span className="parity-dot dark"></span>{dark}</span>
                </div>
            </div>

            <div className="timer-bar">
                <div className={`timer-fill ${timeLeft <= 30 ? 'urgent' : ''}`} style={{ width: `${timeLeft}%` }} />
            </div>

            <div className="hud-bar">
                <div className="hud-item">
                    <span className="hud-label">HP</span>
                    <div className="health-bar-container">
                        <div className="health-bar">
                            <div className={`health-fill ${healthPct <= 30 ? 'low' : ''}`} style={{ width: `${healthPct}%` }} />
                        </div>
                    </div>
                </div>
                <div className="hud-item">
                    <span className="hud-label">PTS</span>
                    <span className="hud-value">{points}</span>
                </div>
                <div className="hud-item">
                    <span className="hud-label">Depth</span>
                    <div className="depth-meter">
                        {Array.from({ length: maxDepth }).map((_, i) => (
                            <div key={i} className={`depth-pip ${i + 1 < depth ? 'reached' : i + 1 === depth ? 'current' : ''}`} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="level-container">
                <div className="level-header">
                    <div className="level-type-tag">{levelTypes[depth - 1] || 'Encounter'}</div>
                </div>

                <div className="game-slot">
                    {gameOverMsg && (
                        <div className="system-message">
                            <span style={{ color: gameOverMsg.includes("DESTROYED") || gameOverMsg.includes("EXPIRED") ? '#C04050' : '#D4A843' }}>
                                {gameOverMsg}
                            </span>
                        </div>
                    )}

                    <div className="tap-area">
                        {Array.from({ length: 9 }).map((_, idx) => {
                            const isLit = litCell?.idx === idx;
                            const effect = cellEffects[idx];

                            let className = 'tap-cell';
                            let content = '';

                            if (effect === 'hit') { className += ' hit'; content = '✓'; }
                            else if (effect === 'miss') { className += ' miss'; content = '✗'; }
                            else if (isLit) {
                                className += litCell.type === 'light' ? ' lit' : ' dark-lit';
                                content = litCell.type === 'light' ? '✦' : '◆';
                            }

                            return (
                                <div
                                    key={idx}
                                    className={className}
                                    onClick={() => handleTap(idx)}
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}