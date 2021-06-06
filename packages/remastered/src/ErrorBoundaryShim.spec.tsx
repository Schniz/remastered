import * as React from "react";
import { ErrorBoundaryShim } from "./ErrorBoundaryShim";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

// for some reason we can't use the shim here, so we
// mock it inline... this is not fun!
jest.mock("react", () => {
  let g = global as {
    $$remasteredContextMap?: Set<WeakRef<React.Context<any>>>;
  };
  g.$$remasteredContextMap = new Set();
  const set = g.$$remasteredContextMap;

  const ActualReact = jest.requireActual("react");
  return {
    ...ActualReact,
    createContext(v: unknown) {
      const ctx = ActualReact.createContext(v);
      set.add(new WeakRef(ctx));
      return ctx;
    },
  };
});

afterEach(() => jest.resetAllMocks());

test("renders the child", () => {
  const SuccessfulComponent = () => <div>Success!</div>;
  const ErrorComponent = () => <div>not going to show</div>;
  const output = renderToStaticMarkup(
    <ErrorBoundaryShim fallbackComponent={ErrorComponent}>
      <SuccessfulComponent />
    </ErrorBoundaryShim>
  );
  expect(output).toEqual(`<div>Success!</div>`);
});

test("renders the error boundary on error", () => {
  const FailingComponent: React.ComponentType = () => {
    throw new Error("I am an error!");
  };
  const ErrorComponent = (props: { error: unknown }) => (
    <div>Oh no: {String(props.error)}</div>
  );
  const output = renderToStaticMarkup(
    <ErrorBoundaryShim fallbackComponent={ErrorComponent}>
      <FailingComponent />
    </ErrorBoundaryShim>
  );
  expect(output).toEqual(`<div>Oh no: Error: I am an error!</div>`);
});

test("propagates contexts", () => {
  const MyContext = React.createContext<string>("default");
  const ErrorComponent = () => <div>not going to show</div>;
  const SuccessfulComponent = () => {
    const value = React.useContext(MyContext);
    return <div>Value is {value}</div>;
  };
  const output = renderToStaticMarkup(
    <MyContext.Provider value="cool">
      <ErrorBoundaryShim fallbackComponent={ErrorComponent}>
        <SuccessfulComponent />
      </ErrorBoundaryShim>
    </MyContext.Provider>
  );
  expect(output).toEqual(`<div>Value is cool</div>`);
});

test("works with router", async () => {
  const { Route, Routes, useLocation } = require("react-router");
  const ErrorComponent = (props: { error: any }) => (
    <div>{String(props.error)}</div>
  );
  const SuccessfulComponent = () => {
    const location = useLocation();
    return <div>My location is {location.pathname}</div>;
  };
  const output = renderToStaticMarkup(
    <StaticRouter location="/">
      <Routes>
        <Route
          element={
            <ErrorBoundaryShim fallbackComponent={ErrorComponent}>
              <SuccessfulComponent />
            </ErrorBoundaryShim>
          }
        />
      </Routes>
    </StaticRouter>
  );
  expect(output).toEqual("<div>My location is /</div>");
});

test("nested boundaries", () => {
  const FailingComponent: React.ComponentType = () => {
    throw new Error("I am an error!");
  };
  const SuccessfulComponent: React.ComponentType = () => {
    return <div>All good!</div>;
  };
  const ErrorComponent = (props: { error: unknown }) => (
    <div>Oh no: {String(props.error)}</div>
  );
  const output = renderToStaticMarkup(
    <ErrorBoundaryShim fallbackComponent={ErrorComponent}>
      <>
        <SuccessfulComponent />
        <ErrorBoundaryShim fallbackComponent={ErrorComponent}>
          <>
            <div>This will not be seen</div>
            <FailingComponent />
          </>
        </ErrorBoundaryShim>
      </>
    </ErrorBoundaryShim>
  );
  expect(output).toEqual(
    `<div>All good!</div><div>Oh no: Error: I am an error!</div>`
  );
});
