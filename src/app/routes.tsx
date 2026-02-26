import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { AnalysisFlow } from "./pages/AnalysisFlow";
import { AnalysisResults } from "./pages/AnalysisResults";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "analysis/:sampleId", Component: AnalysisFlow },
      { path: "results/:sampleId", Component: AnalysisResults },
    ],
  },
]);
