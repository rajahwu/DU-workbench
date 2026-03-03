import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import RootLayout from "./components/RootLayout";
import { DraftLayout, DraftApproach, DraftOffering, DraftReckoning, DraftRouter } from "@/phases/04_DRAFT";
import { TitleStage, SelectStage, StagingStage, LevelStage, DoorStage, DropStage } from "@/phases";

import "./index.css";

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            { path: "/", element: <TitleStage /> },
            { path: "/title", element: <TitleStage /> },
            { path: "/select", element: <SelectStage /> },
            { path: "/staging", element: <StagingStage /> },
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
            { path: "/level", element: <LevelStage /> },
            { path: "/door", element: <DoorStage /> },
            { path: "/drop", element: <DropStage /> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>
);