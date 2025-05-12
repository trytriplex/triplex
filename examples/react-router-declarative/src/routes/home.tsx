import { Link } from "react-router";

export function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Home</h1>
      <Link className="text-blue-600 underline" to="/about">
        About
      </Link>
    </div>
  );
}
