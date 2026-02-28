import { getRunMeta } from "@/workbench/phases/meta";
import { getPhase } from "@/workbench/phases/manager";

export default function SelectShell() {
  const meta = getRunMeta();
  return (
    <div style={{ padding: 16 }}>
      <h1>02_select (shell)</h1>
      <pre>{JSON.stringify({ phase: getPhase(), meta }, null, 2)}</pre>
      <p>Use Shift+D / Shift+L / Shift+O to walk.</p>
    </div>
  );
}