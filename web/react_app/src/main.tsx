import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import { RootLayout } from "./RootLayout";
import SelectShell from "./SelectShell";
import TitleShell from "./TitleShell";
import StagingShell from "./StagingShell";
import { DraftLayout, DraftApproach, DraftOffering, DraftReckoning, DraftRouter } from "./DraftShell";
import LevelShell from "./LevelShell";
import DoorShell from "./DoorShell";
import DropShell from "./DropShell";

// side effects: boot + hotkeys + dev exchange
import "../boot-walk";


const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            { path: "/", element: <TitleShell /> },
            { path: "/title", element: <TitleShell /> },
            { path: "/select", element: <SelectShell /> },
            { path: "/staging", element: <StagingShell /> },
            {
                path: "/draft", element: <DraftLayout />,
                children: [
                    { index: true, element: <DraftRouter /> },
                    { path: 'approach', element: <DraftApproach /> },
                    { path: 'offering', element: <DraftOffering /> },
                    { path: 'reckoning', element: <DraftReckoning /> },
                ]
            },
            { path: "/level", element: <LevelShell /> },
            { path: "/door", element: <DoorShell /> },
            { path: "/drop", element: <DropShell /> }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);