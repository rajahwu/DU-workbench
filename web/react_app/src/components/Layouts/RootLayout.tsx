// web/react_app/src/RootLayout.tsx
import { Outlet } from "react-router";
import PhaseRouterBridge from "../DevTools/PhaseRouterBridge";
import { BootWallBridge } from "../DevTools/DevWalk";
export default function RootLayout() {
    return (
        <>
            <BootWallBridge />
            <PhaseRouterBridge />
            <Outlet />
        </>
    );
}