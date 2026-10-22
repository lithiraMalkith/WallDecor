"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="container-x py-24 text-center" role="alert">
    <h1 className="text-3xl">We couldn’t load this page.</h1>
    <p className="mt-4">Please try again in a moment.</p>
    <button className="btn btn-accent mt-6" onClick={reset}>Try again</button>
  </div>;
}
