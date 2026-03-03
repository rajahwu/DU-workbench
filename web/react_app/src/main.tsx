import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { RootLayout } from "@/RootLayout";
import SelectShell from "@/phases/SelectShell";
import TitleShell from "@/phases/TitleShell";
import StagingShell from "@/phases/StagingShell";
import { DraftLayout, DraftApproach, DraftOffering, DraftReckoning, DraftRouter } from "@/phases/DraftShell";
import LevelShell from "@/phases/LevelShell";
import DoorShell from "@/phases/DoorShell";
import DropShell from "@/phases/DropShell";

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
                path: "/draft",
                element: <DraftLayout />,
                children: [
                    { index: true, element: <DraftRouter /> },
                    { path: "approach", element: <DraftApproach /> },
                    { path: "offering", element: <DraftOffering /> },
                    { path: "reckoning", element: <DraftReckoning /> },
                ],
            },
            { path: "/level", element: <LevelShell /> },
            { path: "/door", element: <DoorShell /> },
            { path: "/drop", element: <DropShell /> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>
);