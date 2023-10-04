/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Image from "next/image";

export function Tweet({
  name,
  tag,
  content,
  tweetUrl,
  avatarUrl,
  date,
}: {
  name: string;
  tag: string;
  date: string;
  content: React.ReactNode;
  tweetUrl: string;
  avatarUrl: string;
}) {
  return (
    <a
      href={tweetUrl}
      className="grid min-w-[340px] max-w-xs shrink-0 gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 pb-3 pt-4 [grid-template-columns:auto_1fr]"
      target="_blank"
    >
      <Image
        alt=""
        width={50}
        height={50}
        className="rounded-full"
        src={avatarUrl}
      />

      <div className="flex flex-col justify-start">
        <span className="font-extrabold tracking-tight text-white/90">
          {name}
        </span>
        <span className="text-base text-white/70">{tag}</span>
      </div>

      <div className="col-span-full self-start py-2 text-lg text-white/90">
        {content}
      </div>

      <div className="col-span-full self-end text-base text-white/70">
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
          name="kitze 🚀"
          tag="@thekitze"
          content="this is closest we've been to something exciting happening in the world of react/frontend. make more visual editor thingies please."
          tweetUrl="https://twitter.com/thekitze/status/1709220529280872866"
          date="1:55 AM · Oct 4, 2023"
          avatarUrl="/avatars/kitze-avatar.jpg"
        />
        <Tweet
          name="Guillermo Rauch"
          tag="@rauchg"
          content="Was just looking at this yesterday. Looks really good"
          tweetUrl="https://twitter.com/rauchg/status/1670874573062144001"
          date="12:18 PM · Jun 20, 2023"
          avatarUrl="/avatars/rauch-avatar.jpg"
        />
        <Tweet
          name="lil uzi perf"
          tag="@ken_wheeler"
          content="Holy shit"
          tweetUrl="https://twitter.com/ken_wheeler/status/1709518398328127860"
          date="9:38 PM · Oct 4, 2023"
          avatarUrl="/avatars/ken-avatar.jpg"
        />
        <Tweet
          name="TresJS"
          tag="@tresjs_dev"
          content="This is an incredible tool for the 3D web community, Congrats to the team behind it @_douges 👏🏻"
          tweetUrl="https://x.com/tresjs_dev/status/1696460634894872672?s=20"
          date="7:51 PM · Aug 29, 2023"
          avatarUrl="/avatars/tresjs-avatar.jpg"
        />
        <Tweet
          name="Alvaro 사부"
          tag="@alvarosabu"
          content="Man this is incredible fun to play with I love it. Kudos @_douges 👏🏻🔥"
          tweetUrl="https://x.com/alvarosabu/status/1696460264772657306?s=20"
          date="7:50 PM · Aug 29, 2023"
          avatarUrl="/avatars/alvaro-avatar.png"
        />
        <Tweet
          name="Julian"
          tag="@julianboolean"
          date="3:14 AM · Jun 5, 2023"
          content="Wait, whaaaat? Is this really 3D software running on node and react?"
          tweetUrl="https://twitter.com/julianboolean/status/1665421727768227842"
          avatarUrl="/avatars/julian-avatar.jpg"
        />
        <Tweet
          name="Wesley LeMahieu"
          tag="@WesleyLeMahieu"
          date="4:21 AM · Jun 20, 2023"
          content={'"Wow." - me'}
          tweetUrl="https://twitter.com/WesleyLeMahieu/status/1665196223744344064"
          avatarUrl="/avatars/wesley-avatar.jpg"
        />
        <Tweet
          name="LokLok (Wong Lok 黃樂)"
          tag="@WongLok831"
          date="7:28 AM · Jun 22, 2023"
          content="LOVE IT!!!!!"
          tweetUrl="https://twitter.com/WongLok831/status/1671646218303463424"
          avatarUrl="/avatars/loklok-avatar.jpg"
        />
        <Tweet
          name="perfectfm.jsx"
          tag="@perfectedfm"
          date="1:53 AM · Jun 4, 2023"
          content="Amazing 🤩"
          tweetUrl="https://twitter.com/perfectedfm/status/1665038936589082628"
          avatarUrl="/avatars/perfectfm-avatar.jpg"
        />
      </div>
    </section>
  );
}
