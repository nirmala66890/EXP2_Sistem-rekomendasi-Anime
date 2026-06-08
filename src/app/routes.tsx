import { createBrowserRouter, Outlet } from "react-router";
import { Home } from "./Home";

const Root = () => <Outlet />;

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home }
    ],
  },
]);
