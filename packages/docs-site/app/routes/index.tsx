import React from "react";

export default function Home() {
  return (
    <>
      <div className="p-4 text-white from-black via-black to-pink-900 bg-gradient-to-br">
        <h2 className="pb-4 text-2xl font-black sm:text-4xl lg:pb-12 lg:pt-8 sm:text-center lg:text-9xl">
          <span className="block">a genuine</span>
          <span className="block text-transparent from-red-400 to-pink-500 bg-gradient-to-r bg-clip-text">
            full-stack approach
          </span>
          <span className="block">to React development</span>
        </h2>
        <div className="max-w-3xl mx-auto leading-relaxed space-y-2">
          <p className="text-xl text-red-100 text-opacity-90">
            Modern front-end tools have changed the way we expect the web
            platform to behave. They also made us forgot some of the
            fundamentals and kinda make shipping.. harder.
          </p>
          <p className="text-lg">
            <strong>Remastered</strong> is a full-stack framework based on
            React, that puts routing as the center of your application. That
            means owning back the entire stack, leveraging HTTP to its fullest
            capabilities and shipping <em>faster</em> with great confidence,
            without risking developer experience.
          </p>
          <p className="text-lg">Ready to learn more?</p>
          <div className="flex justify-between lg:p-4">
            <a
              href="docs"
              className="inline-block px-4 py-2 text-sm font-bold text-center text-white uppercase rounded-sm opacity-95 hover:opacity-100 bg-gradient-to-r from-red-400 to-pink-500"
            >
              Read the docs
            </a>
            <a
              href="https://github.com/Schniz/remastered"
              target="_blank"
              rel="noreferer noopener"
              className="inline-block px-4 py-2 text-sm font-bold text-center text-red-200 underline uppercase rounded-sm bg-clip-text opacity-95 hover:opacity-100"
            >
              See the source
            </a>
          </div>
        </div>
      </div>
      <div className="p-4 mt-4">
        <div className="max-w-3xl mx-auto">
          <ul className="list-none">
            <li>
              <Check /> Route-first approach
            </li>
            <li>
              <Check /> Snappy SPA
            </li>
            <li>
              <Check /> Convenient data fetching
            </li>
            <li>
              <Check /> Automatic code-splitting
            </li>
            <li>
              <Check /> Server-side rendering
            </li>
            <li>... and more!</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function Check() {
  return (
    <span aria-hidden={true} className="inline-block mr-2">
      ✅
    </span>
  );
}
