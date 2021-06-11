import React from "react";
import { LoaderFn, usePendingLocation, useRouteData } from "remastered";
import { docList, FileEntry } from "../docList";
import once from "lodash/once";
import { readDocFile } from "../readDocFile";
import MiniSearch from "minisearch";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Spinner } from "../../app/Spinner";
import { debounce } from "lodash";

type Data = {
  results: {
    link: string;
    title: string;
    description?: string;
  }[];
};

export const generateIndex = once(async () => {
  const search = new MiniSearch<{
    link: string;
    title: string;
    description?: string;
  }>({
    idField: "link",
    fields: ["title", "description"],
    storeFields: ["title", "description"],
  });

  const allDocs = await docList();
  for (const file of allFiles(allDocs)) {
    const content = await readDocFile(file.link);
    if (!content) continue;
    search.add({
      link: `/docs/${file.link}`,
      title: file.title,
      description: content.description,
    });
  }
  return search;
});

export const loader: LoaderFn<Data> = async ({ request }) => {
  const search = await generateIndex();
  const searchParams = new URL(request.url, "https://example.com").searchParams;
  const term = searchParams.get("q") ?? "";
  const results = search
    .search(term, { fuzzy: 0.2 })
    .map((result): Data["results"][number] => {
      return {
        title: result.title,
        link: result.id,
        description: result.description,
      };
    });

  return { results };
};

function* allFiles(entries: FileEntry[]) {
  const queue = [...entries];
  while (queue.length) {
    const item = queue.shift()!;
    if (item.type === "dir") {
      queue.unshift(...item.children);
    } else {
      yield item;
    }
  }
}

type PendingSubmit = {
  encType: string;
  method: string;
  data: FormData;
  action: string;
  _visitedPath?: string;
};

function useForm() {
  const [pendingSubmits, setPendingSubmits] = React.useState<PendingSubmit[]>(
    []
  );
  const Form = React.useMemo(() => {
    return React.forwardRef<
      HTMLFormElement,
      React.ComponentProps<"form"> & {
        /** Submit the form with the browser instead of JavaScript, even if JavaScript is on the page. */
        forceRefresh?: boolean;

        /** Replace the current item in the history stack, instead of adding a new entry on submit */
        replace?: boolean;
      }
    >((props, ref) => {
      const location = useLocation();
      const navigate = useNavigate();
      const onSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
          if (props.forceRefresh) return;

          event.preventDefault();
          if (event.target instanceof HTMLFormElement) {
            const pendingSubmit: PendingSubmit = {
              action: event.target.action,
              encType: event.target.enctype,
              method: event.target.method,
              data: new FormData(event.target),
            };

            setPendingSubmits((ps) => [...ps, pendingSubmit]);

            if (pendingSubmit.method.toLowerCase() === "get") {
              const newUrl = new URL(event.target.action, window.location.href);
              for (const [key, value] of pendingSubmit.data) {
                if (typeof value !== "string") continue;
                newUrl.searchParams.set(key, value);
              }
              pendingSubmit._visitedPath = `${newUrl.pathname}${newUrl.search}`;
              navigate(pendingSubmit._visitedPath, {
                replace: props.replace,
              });
            } else {
              throw new Error("Still not implemented!");
            }
          }
        },
        [props.forceRefresh, props.replace, navigate]
      );

      React.useEffect(() => {
        setPendingSubmits((ps) => {
          const filtered = ps.filter((pendingSubmit) => {
            return (
              pendingSubmit.method !== "get" ||
              pendingSubmit._visitedPath !==
                `${location.pathname}${location.search}`
            );
          });

          if (filtered.length !== ps.length) {
            return filtered;
          }

          return ps;
        });
      });

      const method = props.method?.toLowerCase() ?? "get";
      const methodAllowed = ["get", "post"].includes(method);

      return (
        <form
          ref={ref}
          onSubmit={onSubmit}
          {...props}
          method={methodAllowed ? method : "post"}
        >
          {!methodAllowed && (
            <input type="hidden" name="_remastered_method" value={method} />
          )}
          {props.children && props.children}
        </form>
      );
    });
  }, []);

  const response = React.useMemo(() => {
    return [Form, pendingSubmits] as const;
  }, [Form, pendingSubmits]);

  return response;
}

export default function Search() {
  const data = useRouteData<Data>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryRef = React.useRef<HTMLInputElement>(null);
  const pendingLocation = usePendingLocation();
  /* const [Form, pendingSubmits] = useForm(); */
  /* console.log(pendingSubmits); */

  const submitSearch = React.useMemo(
    () => (ev: React.FormEvent | React.KeyboardEvent) => {
      if (!("key" in ev)) {
        ev.preventDefault();
      }

      if (queryRef.current) {
        setSearchParams({ q: queryRef.current.value }, { replace: true });
      }
    },
    [setSearchParams]
  );

  const debouncedSubmitSearch = React.useMemo(() => {
    return debounce(submitSearch, 200);
  }, [submitSearch]);

  return (
    <div className="w-full mx-auto max-w-screen-lg">
      <h1 className="text-2xl">Search</h1>
      <form onSubmit={submitSearch}>
        <input
          ref={queryRef}
          name="q"
          className="inline-block px-2 py-1 bg-white rounded shadow-sm"
          placeholder="Search term..."
          type="search"
          defaultValue={searchParams.get("q") ?? undefined}
          onChange={debouncedSubmitSearch}
        />
        {pendingLocation && (
          <Spinner className="inline-block w-6 h-6 animate-spin" />
        )}
      </form>
      <ul className="py-4 space-y-4">
        {data.results.map((result) => {
          return (
            <li key={result.link}>
              <Link to={result.link} className="block">
                <span className="flex items-end pb-1">
                  <span className="pr-2 font-bold opacity-80">
                    {result.title}
                  </span>
                  <span className="block font-mono text-xs text-right opacity-50">
                    {result.link}
                  </span>
                </span>
                {result.description && (
                  <span className="opacity-75">{result.description}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
