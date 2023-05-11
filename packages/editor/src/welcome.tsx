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

createRoot(document.getElementById("root")!).render(
  <div className="flex h-screen w-screen select-none flex-col gap-8">
    <div className="relative">
      <img src="banner-r3f.jpg" className="select bg-black" draggable="false" />
      <span className="absolute right-2 top-1.5 ml-auto text-xs text-neutral-300">
        {version}
      </span>
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
            onClick={() => window.triplex.openLink("https://triplex.dev/docs")}
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
