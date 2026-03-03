import type { RunMetaSnapshot } from "@du/phases";

/**
 * DraftShellContext — shared context passed from DraftLayout (Shell)
 * to all Draft sub-routes via <Outlet context>.
 *
 * This lifts getRunMeta() + dispatch out of child components,
 * enforcing "Shell owns data" without changing behavior.
 */
export type DraftShellContext = {
    runMeta: RunMetaSnapshot;
    onEnterDepth: (selectedCards: unknown[]) => void;
};
