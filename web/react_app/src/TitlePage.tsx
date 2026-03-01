import { useEffect, useRef } from "react";

// Prefer importing from your phases package barrel if possible.
// If you don't have a stable subpath export yet, import from a relative path in the app.
import { mountTitleScreen } from "@du/phases";
// Later: import { loadUserProfile, titleExchange, commitExchange } from "@du/phases/01_title/title-exchange";
// Later: import { DEFAULT_POOL } from "@du/phases/02_select/pool";

export function TitlePage() {
    const hostRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        let disposed = false;
        let cleanupFn: void | (() => void);

        (async () => {
            // In dev StrictMode, effect may run twice. If we got disposed, bail.
            if (disposed) return;

            // If your mountTitleScreen signature is (host, onEnterDudael),
            // pass the handler here. For now you can pass a noop.
            cleanupFn = await mountTitleScreen(host, async () => {
                // ✅ real exchange hook (uncomment once wired)
                // const profile = await loadUserProfile();
                // const result = titleExchange(profile, DEFAULT_POOL);
                // commitExchange(result);
                // window.dispatchEvent(new CustomEvent("dudael:exchange", { detail: result.packet }));
            });
        })();

        return () => {
            disposed = true;
            try {
                cleanupFn?.();
            } catch {
                // ignore
            }
        };
    }, []);

    return (
        <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
            <div ref={hostRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}