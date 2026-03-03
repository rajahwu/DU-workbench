import React from "react";
import "./style.css";

type DoorScreenProps = {
    light: number;
    dark: number;
    depth: number;
    lightCost: number;
    darkCost: number;
    secretThreshold: number;
    canLight: boolean;
    canDark: boolean;
    canSecret: boolean;
    onChooseDoor: (path: "light" | "dark" | "secret") => void;
    onForcedDrop: () => void;
};

/**
 * DoorScreen — presentational layout.
 * Three door options (Light, Dark, Secret) + forced drop fallback.
 * No store access. No dispatch. Pure props + callbacks.
 */
export default function DoorScreen({
    light,
    dark,
    depth,
    lightCost,
    darkCost,
    secretThreshold,
    canLight,
    canDark,
    canSecret,
    onChooseDoor,
    onForcedDrop,
}: DoorScreenProps) {
    return (
        <div className="door-shell-wrapper">
            <div className="top-bar">
                <div>
                    <span className="top-bar-label">Phase 06</span>
                    <br />
                    <span className="top-bar-phase" style={{ color: "#8BA0B5" }}>Door</span>
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
                    className={`door-option ${canLight ? "" : "locked"}`}
                    onClick={() => canLight && onChooseDoor("light")}
                    style={canLight ? { borderColor: "#D4A84340" } : {}}
                >
                    <div className="door-option-name" style={{ color: "#D4A843" }}>Path of Light</div>
                    <div className="door-option-desc">A corridor of sanctified luminescence</div>
                    <div className="door-cost">
                        Requires: <span className="required" style={{ color: "#D4A843" }}>{lightCost} Light</span> {canLight ? "✓" : "— locked"}
                    </div>
                </div>

                <div
                    className={`door-option ${canDark ? "" : "locked"}`}
                    onClick={() => canDark && onChooseDoor("dark")}
                    style={canDark ? { borderColor: "#7B4FA240" } : {}}
                >
                    <div className="door-option-name" style={{ color: "#7B4FA2" }}>Path of Shadow</div>
                    <div className="door-option-desc">A passage shrouded in twilight</div>
                    <div className="door-cost">
                        Requires: <span className="required" style={{ color: "#7B4FA2" }}>{darkCost} Dark</span> {canDark ? "✓" : "— locked"}
                    </div>
                </div>

                <div
                    className={`door-option ${canSecret ? "" : "locked"}`}
                    onClick={() => canSecret && onChooseDoor("secret")}
                    style={canSecret ? { borderColor: "#B8863B40" } : {}}
                >
                    <div className="door-option-name" style={{ color: "#B8863B" }}>Secret Door</div>
                    <div className="door-option-desc">Requires mastery of both paths</div>
                    <div className="door-cost">
                        Requires: <span className="required" style={{ color: "#B8863B" }}>{secretThreshold}+ Dark over Light</span> {canSecret ? "✓" : "— locked"}
                    </div>
                </div>

                {!canLight && !canDark && !canSecret && (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                        <button className="btn-danger" onClick={onForcedDrop}>No doors open — Drop</button>
                    </div>
                )}
            </div>
        </div>
    );
}
