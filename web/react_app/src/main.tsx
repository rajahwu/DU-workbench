import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import { RootLayout } from "./RootLayout";
import { SelectShell } from "./SelectShell";
import { PhaseShell } from "./PhaseShell";
import { TitlePage } from "./TitlePage";

// side effects: boot + hotkeys + dev exchange
import "../boot-walk";

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            { path: "/", element: <TitlePage /> },
            { path: "/title", element: <TitlePage /> },
            { path: "/select", element: <SelectShell /> },
            { path: "/staging", element: <PhaseShell phase="03_staging" /> },
            { path: "/draft", element: <PhaseShell phase="04_draft" /> },
            { path: "/level", element: <PhaseShell phase="05_level" /> },
            { path: "/door", element: <PhaseShell phase="06_door" /> },
            { path: "/drop", element: <PhaseShell phase="07_drop" /> }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);