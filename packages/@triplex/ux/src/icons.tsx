/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function LocalSpaceIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
    >
      <path
        d="M12 6.5C12 7.285 11.7251 8.11914 11.2784 8.94948C10.8334 9.77669 10.2339 10.5707 9.62398 11.2666C9.01529 11.9612 8.40507 12.5481 7.94642 12.9616C7.77249 13.1184 7.62086 13.2499 7.5 13.3524C7.37915 13.2499 7.22751 13.1184 7.05358 12.9616C6.59493 12.5481 5.98471 11.9612 5.37602 11.2666C4.76607 10.5707 4.16657 9.77669 3.72158 8.94948C3.27492 8.11914 3 7.285 3 6.5C3 3.19196 5.27044 1.5 7.5 1.5C9.72956 1.5 12 3.19196 12 6.5Z"
        stroke="currentColor"
      />
      <path
        d="M9.49999 6C9.49999 7.10457 8.60456 8 7.49999 8C6.39542 8 5.49999 7.10457 5.49999 6C5.49999 4.89543 6.39542 4 7.49999 4C8.60456 4 9.49999 4.89543 9.49999 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WorldSpaceIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
    >
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" />
      <path
        d="M10.5 7.5C10.5 9.22874 10.1216 10.769 9.53464 11.8591C8.93669 12.9696 8.19442 13.5 7.5 13.5C6.80558 13.5 6.06331 12.9696 5.46536 11.8591C4.87838 10.769 4.5 9.22874 4.5 7.5C4.5 5.77126 4.87838 4.23096 5.46536 3.14086C6.06331 2.03038 6.80558 1.5 7.5 1.5C8.19442 1.5 8.93669 2.03038 9.53464 3.14086C10.1216 4.23096 10.5 5.77126 10.5 7.5Z"
        stroke="currentColor"
      />
      <path
        d="M10.5 7.5C10.5 9.22874 10.1216 10.769 9.53464 11.8591C8.93669 12.9696 8.19442 13.5 7.5 13.5C6.80558 13.5 6.06331 12.9696 5.46536 11.8591C4.87838 10.769 4.5 9.22874 4.5 7.5C4.5 5.77126 4.87838 4.23096 5.46536 3.14086C6.06331 2.03038 6.80558 1.5 7.5 1.5C8.19442 1.5 8.93669 2.03038 9.53464 3.14086C10.1216 4.23096 10.5 5.77126 10.5 7.5Z"
        stroke="currentColor"
      />
      <path d="M7.5 2V13" stroke="currentColor" />
      <path d="M13 7.5L2 7.5" stroke="currentColor" />
    </svg>
  );
}

export function VRGogglesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="15"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      viewBox="0 0 24 24"
      width="15"
    >
      <path
        d="M20 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-1.6-.8l-1.6-2.13a1 1 0 0 0-1.6 0L9.6 17.2A2 2 0 0 1 8 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
