/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Image from "next/image";

export function IntroVideo() {
  return (
    <div className="relative flex min-h-[120vh] flex-col items-center justify-center px-10">
      <div className="relative grid h-[90vh] w-full items-center justify-center md:h-[80vh]">
        {/* <button className="z-50 flex h-32 w-32 scale-90 items-center justify-center rounded-full bg-neutral-800/90 pl-2 text-white/60 hover:text-white/80 active:scale-[.8] md:scale-100 md:active:scale-90">
          <svg width="48" viewBox="0 0 60 67">
            <g id="Regular-S">
              <path
                id="Path"
                fill="currentColor"
                stroke="none"
                d="M 5.976074 66.314453 C 6.822388 66.314453 7.628052 66.167969 8.393066 65.875 C 9.158081 65.582031 9.947388 65.191406 10.76123 64.703125 L 54.706543 39.410156 C 56.496948 38.36853 57.733887 37.448853 58.41748 36.651367 C 59.101074 35.853882 59.442871 34.901733 59.442871 33.794922 C 59.442871 32.68811 59.101074 31.735962 58.41748 30.938477 C 57.733887 30.140991 56.496948 29.221313 54.706543 28.179688 L 10.76123 2.886719 C 9.947388 2.398438 9.158081 2.007813 8.393066 1.714844 C 7.628052 1.421875 6.822388 1.275391 5.976074 1.275391 C 4.446167 1.275391 3.233521 1.820679 2.338379 2.911133 C 1.443237 4.001587 0.995605 5.458374 0.995605 7.28125 L 0.995605 60.308594 C 0.995605 62.13147 1.443237 63.588257 2.338379 64.678711 C 3.233521 65.769165 4.446167 66.314453 5.976074 66.314453 Z"
              />
            </g>
          </svg>
        </button> */}
        <Image
          alt="Screenshot of the Triplex user interface running on macOS"
          className="object-contain md:hidden"
          fill
          src="/landing-ui_sm.png"
        />
        <Image
          alt="Screenshot of the Triplex user interface running on macOS"
          className="hidden object-contain md:block"
          fill
          src="/landing-ui.png"
        />
      </div>
    </div>
  );
}
