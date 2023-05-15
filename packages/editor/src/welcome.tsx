import { createRoot } from "react-dom/client";
import {
  DiscordLogoIcon,
  ReaderIcon,
  HeartFilledIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import "./styles.css";
import { Button } from "./ds/button";
import { version } from "../package.json";
import { cn } from "./ds/cn";
import { useEffect, useState } from "react";

function ProgressBar() {
  const [progress, setProgress] = useState(-1);

  useEffect(() => {
    return window.triplex.handleProgressBarChange((progress) => {
      setProgress(progress);
    });
  }, []);

  return (
    <div
      className={cn([
        progress > 0 ? "opacity-100" : "opacity-0",
        "absolute bottom-0 left-0 right-0 h-1 overflow-hidden bg-gradient-to-r from-black/50 to-white/20 transition-opacity",
      ])}
    >
      {progress > 1 ? (
        <div className="indeterminate absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400" />
      ) : (
        <div
          className="absolute inset-0 origin-left bg-gradient-to-r from-blue-500 to-blue-400"
          style={{ transform: `scale3d(${progress * 100}%, 1, 1)` }}
        />
      )}
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex h-screen w-screen select-none flex-col gap-8">
      <div className="absolute left-0 right-0 top-0 z-50 h-8 [-webkit-app-region:drag]"></div>
      <div className="relative">
        <img
          src="banner-r3f.jpg"
          className="select bg-black"
          draggable="false"
        />
        <span className="absolute right-2 top-1.5 ml-auto text-xs text-neutral-300">
          {version}
        </span>

        <ProgressBar />
      </div>

      <div className="flex gap-4 px-10">
        <div className="basis-1/2">
          <h2 className="text-xs font-medium text-neutral-400">Projects</h2>

          <div className="-mx-2 flex flex-col">
            <Button
              size="tight"
              onClick={() => window.triplex.sendCommand("open-project")}
            >
              Open Project...
            </Button>
          </div>
        </div>
        <div className="flex basis-1/2 flex-col"></div>
      </div>

      <div className="mt-auto flex gap-5 px-10">
        <div className="basis-1/2">
          <div className="-mx-2 flex flex-col">
            <Button
              size="tight"
              icon={ReaderIcon}
              onClick={() =>
                window.triplex.openLink("https://triplex.dev/docs")
              }
            >
              Documentation
            </Button>
            <Button
              size="tight"
              icon={DiscordLogoIcon}
              onClick={() =>
                window.triplex.openLink("https://discord.gg/nBzRBUEs4b")
              }
            >
              Join Discord
            </Button>
          </div>
        </div>
        <div className="basis-1/2">
          <div className="-mx-2 flex flex-col">
            <Button
              icon={GlobeIcon}
              size="tight"
              onClick={() =>
                window.triplex.openLink(
                  "https://github.com/try-triplex/releases/releases"
                )
              }
            >
              Release Notes
            </Button>
            <Button
              icon={HeartFilledIcon}
              size="tight"
              isSelected
              onClick={() =>
                window.triplex.openLink("https://github.com/sponsors/itsdouges")
              }
            >
              Sponsor Development
            </Button>
          </div>
        </div>
      </div>
      <div />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<WelcomeScreen />);
