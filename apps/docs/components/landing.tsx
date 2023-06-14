import Link from "next/link";

export function Landing() {
  return (
    <div className="relative">
      <div className="mx-auto max-w-[80rem] px-12 py-32">
        <div className="flex flex-col items-center gap-8 md:items-start lg:gap-10">
          <h1 className="max-w-4xl text-center text-6xl font-bold text-blue-400 md:text-left md:text-7xl lg:text-8xl">
            Visually Edit React Three Fiber Components
          </h1>

          <span className="text-center text-xl text-neutral-300">
            Save your changes straight back to source code.
          </span>

          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            <Link
              href="/download"
              className="flex h-[54px] w-[250px] items-center justify-center rounded-full bg-blue-400 text-xl font-bold text-neutral-900"
            >
              Get Early Access
            </Link>

            <a
              href="https://www.producthunt.com/posts/triplex?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-triplex"
              target="_blank"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=397798&theme=neutral"
                alt="Triplex - The&#0032;React&#0032;three&#0032;fiber&#0032;editor | Product Hunt"
                style={{ width: "250px", height: "54px" }}
                className="rounded-full"
                width="250"
                height="54"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
