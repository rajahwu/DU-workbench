import { getRunMeta, getPhase } from "@du/phases";

export function SelectShell() {
  const meta = getRunMeta();

  return (
    <div style={{ padding: 16, fontFamily: "monospace" }}>
      <h1>02_select (shell)</h1>
      <pre>{JSON.stringify({ phase: getPhase(), meta }, null, 2)}</pre>
      <p>Hotkeys: Shift+D (draft), Shift+L (level), Shift+O (door), Shift+S (staging), Shift+X (drop)</p>
    </div>
  );
}