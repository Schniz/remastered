import React from "react";

export default function Home() {
  return (
    <>
      <div className="p-4 text-white bg-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="inline-block text-6xl font-bold text-transparent from-red-400 to-pink-500 bg-gradient-to-r bg-clip-text">
            Remastered
          </h1>
          <p className="text-lg text-red-100 text-opacity-75">
            A full-stack approach to React
          </p>
          <p>
            Remastered is a full-stack framework based on React, that puts
            routing as the center of your application. Building web-apps has
            never been so easy!
          </p>
          <div className="flex justify-between p-4">
            <a
              href="docs"
              className="inline-block px-4 py-2 text-sm text-white uppercase rounded-sm opacity-95 hover:opacity-100 bg-gradient-to-r from-red-400 to-pink-500"
            >
              Read the docs
            </a>
            <a
              href="https://github.com/Schniz/remastered"
              target="_blank"
              rel="noreferer noopener"
              className="inline-block bg-clip-text px-4 py-2 text-sm font-bold uppercase rounded-sm opacity-95 hover:opacity-100 text-red-200 underline"
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
