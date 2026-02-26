import { createBrowserRouter } from "react-router";
import App from "./App";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "analysis",
        Component: Analysis,
      },
    ],
  },
]);
