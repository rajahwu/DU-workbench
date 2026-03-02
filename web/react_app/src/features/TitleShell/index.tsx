import React, { useState } from "react";
import { loadUserProfile, titleExchange, commitExchange } from "@du/phases/01_title/title-exchange";
import { DEFAULT_POOL } from "@du/phases/02_select/pool";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import "./style.css";

export default function TitleShell() {
    const [isBooting, setIsBooting] = useState(false);
    const dispatch = useAppDispatch();

    const handleEnterDrop = async () => {
        if (isBooting) return;
        setIsBooting(true);

        const profile = await loadUserProfile();
        const result = titleExchange(profile, DEFAULT_POOL);

        // persists ephemeral run record (fine to keep)
        commitExchange(result);

        // let the flash play, then do the canonical transition
        setTimeout(() => {
            dispatch(requestTransition(result.packet.to, result.packet)); // ✅ "02_select"
        }, 600);
    };

    return (
        <div className="title-shell-wrapper">
            <div className="vignette" />
            {isBooting && <div className="transition-flash" />}

            <div className="title-container">
                <div className="main-title">DUDAEL</div>
                <div className="sub-title">THE DROP</div>
            </div>

            <div className="menu-container">
                <button className="menu-button primary" onClick={handleEnterDrop} disabled={isBooting}>
                    {isBooting ? "INITIALIZING..." : "ENTER DROP"}
                </button>
                <button className="menu-button">CODEX</button>
                <button className="menu-button">SETTINGS</button>
                <button className="menu-button">EXIT</button>
            </div>

            <div className="system-status">SYSTEM: RADIANT CORE v0.1.0 // STATUS: NOMINAL</div>
        </div>
    );
}