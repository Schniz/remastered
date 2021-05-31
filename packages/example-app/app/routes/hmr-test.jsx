import React from "react";
import { useRouteData } from "remastered";

export const loader = () => {
  return { lastRendered: String(new Date()) };
};

export default function HmrTest() {
  const { lastRendered } = useRouteData();
  const [bold, setBold] = React.useState(false);

  return (
    <>
      <h1>Test HMR!</h1>

      <p style={{ fontWeight: bold ? "bold" : "normal" }}>
        Is this bold? {bold ? "Yes!" : "No"}
      </p>

      <p>
        <button onClick={() => setBold((b) => !b)}>toggle</button>
      </p>

      <p>Last rendered at {lastRendered}</p>
    </>
  );
}
