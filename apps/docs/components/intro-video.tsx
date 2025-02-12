/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Image from "next/image";

export function IntroVideo() {
  return (
    <div className="relative flex min-h-[120vh] flex-col items-center justify-start px-10">
      <div className="relative grid h-[90vh] w-full items-center justify-start md:h-[80vh]">
        <Image
          alt="Screenshot of the Triplex user interface running on macOS"
          className="hidden object-contain dark:block"
          fill
          priority
          src="/ui/vsce-dark.png"
        />
        <Image
          alt="Screenshot of the Triplex user interface running on macOS"
          className="block object-contain dark:hidden"
          fill
          priority
          src="/ui/vsce-light.png"
        />
      </div>
    </div>
  );
}
