/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Image from "next/image";

export function IntroVideo() {
  return (
    <div className="relative flex min-h-[120vh] flex-col items-center justify-start px-10">
      <div className="relative grid h-[90vh] w-full items-center justify-start md:h-[80vh]">
        <Image
          alt="Screenshot of the Triplex user interface running on macOS"
          className="object-contain"
          fill
          src="/hero.png"
        />
      </div>
    </div>
  );
}
