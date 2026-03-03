// web/react_app/src/RootLayout.tsx
import { Outlet } from "react-router";
import PhaseRouterBridge from "./PhaseRouterBridge";
import { BootPacketBridge } from "./DevWalk";
export default function RootLayout() {
    return (
        <>
            <BootPacketBridge />
            <PhaseRouterBridge />
            <Outlet />
        </>
    );
}