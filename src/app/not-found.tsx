import Link from "next/link";
export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-5xl font-light">This wall is empty.</h1>
        <Link href="/" className="btn btn-yellow mt-7">
          Back home
        </Link>
      </div>
    </div>
  );
}
