/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Image from "next/image";

export function Tweet({
  avatarUrl,
  content,
  date,
  name,
  tag,
  tweetUrl,
}: {
  avatarUrl: string;
  content: React.ReactNode;
  date: string;
  name: string;
  tag: string;
  tweetUrl: string;
}) {
  return (
    <a
      className="border-neutral bg-surface grid min-w-[340px] max-w-xs shrink-0 gap-2 border px-4 pb-3 pt-4 text-base [grid-template-columns:auto_1fr]"
      href={tweetUrl}
      rel="noreferrer"
      target="_blank"
    >
      <Image
        alt=""
        className="rounded-full"
        height={50}
        src={avatarUrl}
        width={50}
      />

      <div className="flex flex-col justify-start">
        <span className="text-default font-medium">{name}</span>
        <span className="text-subtle text-base">{tag}</span>
      </div>

      <div className="text-default col-span-full self-start py-2 text-lg">
        {content}
      </div>

      <div className="text-subtlest col-span-full self-end text-base">
        {date}
      </div>
    </a>
  );
}

export function Tweets() {
  return (
    <section className="pb-20 pt-10">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-4">
        <Tweet
          avatarUrl="/avatars/kitze-avatar.jpg"
          content="this is closest we've been to something exciting happening in the world of react/frontend. make more visual editor thingies please."
          date="1:55 AM · Oct 4, 2023"
          name="kitze 🚀"
          tag="@thekitze"
          tweetUrl="https://twitter.com/thekitze/status/1709220529280872866"
        />
        <Tweet
          avatarUrl="/avatars/rauch-avatar.jpg"
          content="Was just looking at this yesterday. Looks really good"
          date="12:18 PM · Jun 20, 2023"
          name="Guillermo Rauch"
          tag="@rauchg"
          tweetUrl="https://twitter.com/rauchg/status/1670874573062144001"
        />
        <Tweet
          avatarUrl="/avatars/ken-avatar.jpg"
          content="Holy shit"
          date="9:38 PM · Oct 4, 2023"
          name="lil uzi perf"
          tag="@ken_wheeler"
          tweetUrl="https://twitter.com/ken_wheeler/status/1709518398328127860"
        />
        <Tweet
          avatarUrl="/avatars/tresjs-avatar.jpg"
          content="This is an incredible tool for the 3D web community, Congrats to the team behind it @_douges 👏🏻"
          date="7:51 PM · Aug 29, 2023"
          name="TresJS"
          tag="@tresjs_dev"
          tweetUrl="https://x.com/tresjs_dev/status/1696460634894872672?s=20"
        />
        <Tweet
          avatarUrl="/avatars/alvaro-avatar.png"
          content="Man this is incredible fun to play with I love it. Kudos @_douges 👏🏻🔥"
          date="7:50 PM · Aug 29, 2023"
          name="Alvaro 사부"
          tag="@alvarosabu"
          tweetUrl="https://x.com/alvarosabu/status/1696460264772657306?s=20"
        />
        <Tweet
          avatarUrl="/avatars/julian-avatar.jpg"
          content="Wait, whaaaat? Is this really 3D software running on node and react?"
          date="3:14 AM · Jun 5, 2023"
          name="Julian"
          tag="@julianboolean"
          tweetUrl="https://twitter.com/julianboolean/status/1665421727768227842"
        />
        <Tweet
          avatarUrl="/avatars/wesley-avatar.jpg"
          content={'"Wow." - me'}
          date="4:21 AM · Jun 20, 2023"
          name="Wesley LeMahieu"
          tag="@WesleyLeMahieu"
          tweetUrl="https://twitter.com/WesleyLeMahieu/status/1665196223744344064"
        />
        <Tweet
          avatarUrl="/avatars/loklok-avatar.jpg"
          content="LOVE IT!!!!!"
          date="7:28 AM · Jun 22, 2023"
          name="LokLok (Wong Lok 黃樂)"
          tag="@WongLok831"
          tweetUrl="https://twitter.com/WongLok831/status/1671646218303463424"
        />
        <Tweet
          avatarUrl="/avatars/perfectfm-avatar.jpg"
          content="Amazing 🤩"
          date="1:53 AM · Jun 4, 2023"
          name="perfectfm.jsx"
          tag="@perfectedfm"
          tweetUrl="https://twitter.com/perfectedfm/status/1665038936589082628"
        />
      </div>
    </section>
  );
}
