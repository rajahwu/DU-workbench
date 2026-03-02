import React, { useState } from 'react';
// Engine Imports (Adjust path to your @du/phases workspace if needed)
import { loadUserProfile, titleExchange, commitExchange } from '@du/phases/01_title/title-exchange';
import { DEFAULT_POOL } from '@du/phases/02_select/pool';
import './style.css';

export default function TitleShell() {
    const [isBooting, setIsBooting] = useState(false);

    const handleEnterDrop = async () => {
        if (isBooting) return;
        setIsBooting(true);

        console.log("🚪 Initiating Drop sequence. System meets user at the door...");

        // 1. Check who is at the door (Mocked for now, will connect to Supabase later)
        const profile = await loadUserProfile();

        // 2. Perform the engine exchange (System decides Lite vs Full path)
        const result = titleExchange(profile, DEFAULT_POOL);

        // 3. Persist the ephemeral run record
        commitExchange(result);

        console.log(`⚖️ Exchange Complete. Path opened: ${result.path.toUpperCase()}`);

        // Allow the visual flash transition to play out before firing the router event
        setTimeout(() => {
            // 4. Fire the canonical packet to the Bootloader!
            window.dispatchEvent(
                new CustomEvent("dudael:exchange", {
                    detail: result.packet,
                })
            );
        }, 600); // 600ms matches the visual flash timing
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
                <button
                    className="menu-button primary"
                    onClick={handleEnterDrop}
                    disabled={isBooting}
                >
                    {isBooting ? 'INITIALIZING...' : 'ENTER DROP'}
                </button>
                <button className="menu-button">CODEX</button>
                <button className="menu-button">SETTINGS</button>
                <button className="menu-button">EXIT</button>
            </div>

            <div className="system-status">
                SYSTEM: RADIANT CORE v0.1.0 // STATUS: NOMINAL
            </div>
        </div>
    );
}