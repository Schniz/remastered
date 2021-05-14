export const loader = () =>
  new Response(
    JSON.stringify({
      randomNumber: Math.random(),
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
