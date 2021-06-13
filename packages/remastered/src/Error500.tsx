import React from "react";

export default function Default500(props: { error: any }) {
  return (
    <>
      <h1>Internal Server Error</h1>
      <small>
        Overwrite this page by adding a <code>500.tsx</code> file
      </small>
      <pre>
        {JSON.stringify(
          {
            obj: props.error,
            message: props.error.message,
            stack: props.error.stack,
          },
          null,
          2
        )}
      </pre>
    </>
  );
}
