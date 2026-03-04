// web/react_app/src/RootLayout.tsx
import { Outlet } from "react-router";
import PhaseRouterBridge from "../DevTools/PhaseRouterBridge";
import { BootPacketBridge } from "../DevTools/DevWalk";
export default function RootLayout() {
    return (
        <>
            <BootPacketBridge />
            <PhaseRouterBridge />
            <Outlet />
        </>
    );
}