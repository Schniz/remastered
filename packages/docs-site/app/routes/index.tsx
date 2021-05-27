import {
  CodeIcon,
  CogIcon,
  CubeTransparentIcon,
  DotsHorizontalIcon,
  LinkIcon,
  RefreshIcon,
  SparklesIcon,
} from "@heroicons/react/solid";
import React from "react";
import { Link } from "remastered";

export default function Home() {
  return (
    <>
      <HeroMessage />
      <div className="p-4 mt-4">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold opacity-90">
            Remastered is packed with greatness
          </h3>

          <ul className="py-8 text-lg list-none space-y-8">
            <Feature icon={LinkIcon} title="URL-first approach">
              The web is focused around hyperlinks. Remastered embraces URLs as
              the most important building block. Use file-system routing to
              declare URLs, and allow customers to share the experience of your
              app with the world.
            </Feature>
            <Feature icon={CogIcon} title="Server-side rendered SPA">
              Make sure your app loads as fast as it can, with no jitter and
              "flash of unstyled content". Remastered serves your application
              ready for action, even before JavaScript loads. And when it loads,
              it acts as if you were building a single-page-application,
              providing the great modern user-experience your customers expect
              from a modern web-app.
            </Feature>
            <Feature icon={RefreshIcon} title="Hot module reloading">
              Don't squint! See the changes on your development environment once
              you save a file! By leveraging{" "}
              <a
                href="https://vitejs.dev"
                target="_blank"
                rel="noreferrer noopener"
              >
                Vite
              </a>
              , a futuristic JavaScript bundler that ensures you get the best
              and fastest developer experience, no matter what size is your app.
            </Feature>
            <Feature icon={SparklesIcon} title="Convenient data fetching">
              Instead of throwing useEffect everywhere, In Remastered, every
              Route might expose a co-located server-side data loader which gets
              fetched automatically and stored in the history stack. All you
              have to do is call a React hook to get it, synchronously.
            </Feature>
            <Feature
              icon={CubeTransparentIcon}
              title="Automatic code-splitting"
            >
              Only ships assets your clients need to interact with the page they
              are visiting. Remastered will download the assets needed for new
              interactions as soon as they are needed.
            </Feature>
            <Feature icon={CodeIcon} title="Titles and Meta Tags">
              The <code>{"<title>"}</code> and the <code>{"<meta>"}</code> are
              the way to share metadata about the current page in the web
              platform. They can't be an afterthought! Remastered takes it very
              seriously and provides and easy way to declare metadata for the
              current page, allowing search engines and screen-readers to easily
              understand what they are going to experience.
            </Feature>
            <Feature title="And so much more." icon={DotsHorizontalIcon}>
              So many more stuff are baked in. Just come and{" "}
              <Link to="docs">read the docs to learn more!</Link>
            </Feature>
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

function HeroMessage() {
  return (
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
          Modern front-end tools have changed the way we expect the web platform
          to behave. They also made us forgot some of the fundamentals and kinda
          make shipping.. harder.
        </p>
        <p className="text-lg">
          <strong>Remastered</strong> is a full-stack framework based on React,
          that puts routing as the center of your application. That means owning
          back the entire stack, leveraging HTTP to its fullest capabilities and
          shipping <em>faster</em> with great confidence, without risking
          developer experience.
        </p>
        <p className="text-lg">Ready to learn more?</p>
        <div className="flex justify-between lg:p-4">
          <Link
            to="docs"
            className="inline-block px-4 py-2 text-sm font-bold text-center text-white uppercase rounded-sm opacity-95 hover:opacity-100 bg-gradient-to-r from-red-400 to-pink-500"
          >
            Read the docs
          </Link>
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
  );
}

function Feature(props: {
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  title: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <li className="flex p-2 -mx-2 rounded shadow-none items-top group lg:hover:shadow-lg lg:hover:scale-105 transform transition-all duration-100">
      <props.icon className="inline-block w-10 h-10 p-1 mr-4 text-gray-700 bg-gray-200 rounded-lg group-hover:text-pink-600 group-hover:bg-pink-100" />
      <div className="flex-1 prose prose-lg prose-pink">
        <h4 className="md:group-hover:text-pink-600">{props.title}</h4>
        {props.children}
      </div>
    </li>
  );
}
