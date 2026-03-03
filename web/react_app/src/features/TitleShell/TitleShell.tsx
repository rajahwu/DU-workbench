import React, { useState } from "react";
import { loadUserProfile, titleExchange, commitExchange } from "@du/phases/01_title/title-exchange";
import { DEFAULT_POOL } from "@du/phases/02_select/pool";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import TitleScreen from "./TitleScreen";

/**
 * TitleShell — data + dispatch layer.
 * Owns: exchange logic, profile loading, transition dispatch.
 * Renders: TitleScreen (presentational).
 */
export default function TitleShell() {
    const [isBooting, setIsBooting] = useState(false);
    const dispatch = useAppDispatch();

    const handleEnterDrop = async () => {
        if (isBooting) return;
        setIsBooting(true);

        const profile = await loadUserProfile();
        const result = titleExchange(profile, DEFAULT_POOL);
        commitExchange(result);

        setTimeout(() => {
            dispatch(requestTransition(result.packet.to, result.packet));
        }, 600);
    };

    return <TitleScreen isBooting={isBooting} onEnterDrop={handleEnterDrop} />;
}
