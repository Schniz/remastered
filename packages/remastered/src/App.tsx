import { useRoutes } from "react-router-dom";
import { getRouteElements } from "./fsRoutes";
import { wrapRoutes } from "./wrapRoutes";

export default function App() {
  const element = useRoutes(wrapRoutes(getRouteElements()));
  return element;
}
