import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "@/app/store";

import { RootLayout } from "@/RootLayout";
import SelectShell from "@/features/SelectShell";
import TitleShell from "@/features/TitleShell";
import StagingShell from "@/features/StagingShell";
import { DraftLayout, DraftApproach, DraftOffering, DraftReckoning, DraftRouter } from "@/features/DraftShell";
import LevelShell from "@/features/LevelShell";
import DoorShell from "@/features/DoorShell";
import DropShell from "@/features/DropShell";

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