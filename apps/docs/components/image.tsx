/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import Image from "next/image";

export function InlineImage({ src }: { src: { dark: string; light: string } }) {
  return (
    <>
      <Image
        alt=""
        className="border-neutral bg-neutral border object-cover object-left md:rounded-xl dark:hidden"
        fill
        loading="eager"
        src={src.light}
      />
      <Image
        alt=""
        className="border-neutral bg-neutral hidden border object-cover object-left md:rounded-xl dark:block"
        fill
        loading="eager"
        src={src.dark}
      />
    </>
  );
}
