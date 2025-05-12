import { Link } from "react-router";

export function About() {
  return (
    <div>
      <h1 className="text-2xl font-bold">About</h1>
      <Link className="text-blue-600 underline" to="/">
        Home
      </Link>
    </div>
  );
}
