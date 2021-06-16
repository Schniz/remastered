import React from "react";
import { useLocation, useNavigate } from "react-router";
import { REMASTERED_JSON_ACCEPT } from "remastered/dist/constants";
import * as megajson from "remastered/dist/megajson";

function createTx(): string {
  return String(Math.random());
}

/** A pending submit */
type PendingSubmit = {
  /** A ticket for the pending submit. Can be used as an ID of the request. */
  tx: string;

  /** The encoding type as declared by the form (and will sent as a Content-Type) */
  encType: string;

  /** The form method */
  method: string;

  /** The form data */
  data: FormData;

  /** The form action */
  action: string;
};

/**
 * Returns a `[Form, pendingSubmits]` pair, where:
 *
 * `Form` is a wrapper around a simple HTML `<form />`.
 * When a value is being submitted we store it in `pendingSubmits` (see type defs for more info)
 * and when the response cycle finishes we remove it from `pendingSubmits`.
 *
 * `pendingSubmits` is an array of all the submissions that are in-flight
 * for this form.
 *
 * Forms in Remastered are progressively enhanced. A plain old `form` element is being rendered
 * and the form can be submitted right away using HTML and simple hard-refresh HTTP methods.
 * When JavaScript kicks in, we attach to `onSubmit` to allow for a better experience. Like:
 *
 * * Forms with JavaScript enabled can handle focus states for the user.
 * * Forms with JavaScript enabled can submit two things at the same time: imagine a to-do list where a user
 *   just enters a couple of things really fast. You can do that
 * * Forms with JavaScript enabled can use `pendingSubmits` to provide an optimistic UI.
 */
export function useForm() {
  const location = useLocation();
  const [pendingSubmits, setPendingSubmits] = React.useState<PendingSubmit[]>(
    []
  );

  React.useEffect(() => {
    const tx = (location.state as any)?._remastered_submitted_tx as
      | string
      | undefined;
    if (tx) {
      setPendingSubmits((ps) => {
        const filtered = ps.filter((x) => x.tx !== tx);
        if (filtered.length !== ps.length) {
          return filtered;
        } else {
          return ps;
        }
      });
    }
  }, [location]);
  const FormWrapper = React.useMemo(() => {
    return React.forwardRef<
      HTMLFormElement,
      React.ComponentProps<"form"> & CustomFormProps
    >((props, ref) => (
      <Form ref={ref as any} {...props} setPendingSubmits={setPendingSubmits} />
    ));
  }, []);

  const response = React.useMemo(() => {
    return [FormWrapper, pendingSubmits] as const;
  }, [FormWrapper, pendingSubmits]);

  return response;
}

type CustomFormProps = {
  /** Submit the form with the browser instead of JavaScript, even if JavaScript is on the page. */
  forceRefresh?: boolean;

  /** Replace the current item in the history stack, instead of adding a new entry on submit */
  replace?: boolean;

  /** Handle responses that do not return 3xx response from a POST request */
  onUnknownResponse(response: Response): unknown;
};

type InternalFormProps = {
  setPendingSubmits(a: React.SetStateAction<PendingSubmit[]>): void;
};

type FormProps = React.ComponentProps<"form"> &
  CustomFormProps &
  InternalFormProps;

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      setPendingSubmits,
      forceRefresh,
      replace,
      onUnknownResponse,
      ...formProps
    },
    ref
  ) => {
    const navigate = useNavigate();
    const onUnknownResponseRef =
      React.useRef<typeof onUnknownResponse>(onUnknownResponse);
    React.useEffect(() => {
      onUnknownResponseRef.current = onUnknownResponse;
    }, [onUnknownResponse]);
    const onSubmit = React.useCallback(
      async (event: React.FormEvent<HTMLFormElement>) => {
        if (formProps.onSubmit) {
          if (import.meta.env.DEV) {
            console.warn(
              "You passed onSubmit to `Form`, which deactivates the special behavior."
            );
          }

          return formProps.onSubmit(event);
        }

        if (forceRefresh) return;

        event.preventDefault();
        if (event.target instanceof HTMLFormElement) {
          const pendingSubmit: PendingSubmit = {
            tx: createTx(),
            action: event.target.action,
            encType: event.target.enctype,
            method: event.target.method,
            data: new FormData(event.target),
          };

          setPendingSubmits((ps) => [...ps, pendingSubmit]);
          const newUrl = new URL(event.target.action, window.location.href);
          const navigateOptions = {
            state: { _remastered_submitted_tx: pendingSubmit.tx },
            replace,
          };

          if (pendingSubmit.method.toLowerCase() === "get") {
            formDataToSearchParams(pendingSubmit.data, newUrl.searchParams);
            const visitableUrl = `${newUrl.pathname}${newUrl.search}`;
            navigate(visitableUrl, navigateOptions);
          } else {
            const body =
              pendingSubmit.encType === "multipart/form-data"
                ? pendingSubmit.data
                : formDataToSearchParams(pendingSubmit.data);
            const request = new Request(newUrl.toString(), {
              method: event.target.method,
              headers: {
                "Content-Type": pendingSubmit.encType,
                Accept: REMASTERED_JSON_ACCEPT,
              },
              body,
            });

            fetch(request).then(
              async (result) => {
                const response = megajson.deserialize(
                  await result.json()
                ) as Response;

                const locationHeader = response.headers.get("location");
                if (
                  response.status >= 300 &&
                  response.status < 400 &&
                  locationHeader
                ) {
                  try {
                    const resolvedUrl = new URL(locationHeader);
                    navigate(
                      locationHeader.replace(resolvedUrl.origin, ""),
                      navigateOptions
                    );
                  } catch {
                    navigate(locationHeader, navigateOptions);
                  }
                } else {
                  onUnknownResponseRef.current?.(response);
                }
              },
              (error) => {
                console.error("OH NO", error);
                setPendingSubmits((ps) =>
                  ps.filter((x) => x !== pendingSubmit)
                );
              }
            );
          }
        }
      },
      [forceRefresh, replace, navigate, setPendingSubmits, formProps.onSubmit]
    );

    const method = formProps.method?.toLowerCase() ?? "get";
    const methodAllowed = ["get", "post"].includes(method);

    return (
      <form
        ref={ref}
        encType="application/x-www-urlencoded"
        {...formProps}
        onSubmit={onSubmit}
        method={methodAllowed ? method : "post"}
      >
        {!methodAllowed && (
          <input type="hidden" name="_remastered_method" value={method} />
        )}
        {formProps.children && formProps.children}
      </form>
    );
  }
);

function formDataToSearchParams(
  formData: FormData,
  searchParams = new URLSearchParams()
): URLSearchParams {
  for (const [key, value] of formData) {
    if (typeof value !== "string") continue;
    searchParams.append(key, value);
  }

  return searchParams;
}
