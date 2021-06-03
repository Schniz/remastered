import React from "react";
import { ErrorBoundaryShim, shim } from "./ErrorBoundaryShim";
import { renderToStaticMarkup } from "react-dom/server";

let removeShim: Function;
beforeEach(() => {
  removeShim = shim();
});
afterEach(() => {
  removeShim?.();
});

test("smoke", () => {});

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
