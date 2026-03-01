// web/react_app/src/RootLayout.tsx
import { Outlet } from "react-router";
import { PhaseRouterBridge } from "./PhaseRouterBridge";

export function RootLayout() {
    return (
        <>
            <PhaseRouterBridge />
            <Outlet />
        </>
    );
}