export function PhaseShell({ phase }: { phase: string }) {
    return (
        <div style={{ padding: 16, fontFamily: "monospace" }}>
            <h1>{phase} (shell)</h1>
            <p>Waiting for manager to navigate…</p>
            <p>Hotkeys: Shift+D / Shift+L / Shift+O</p>
        </div>
    );
}