/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function LoadingTriangle() {
  return (
    <div
      aria-label="Loading"
      style={{
        alignItems: "center",
        display: "flex",
        height: 50,
        justifyContent: "center",
        pointerEvents: "none",
        position: "fixed",
        right: 12,
        top: 12,
        width: 50,
      }}
    >
      <style>
        {`
  .loading--animate-dashes {
    stroke-dasharray: 25;
    animation: dash 1.4s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 100;
    }
  }
      `}
      </style>
      <svg height="33" viewBox="0 0 33 33" width="33">
        <defs>
          <linearGradient id="l-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgb(245 245 245)" />
            <stop offset="100%" stopColor="rgb(163 163 163)" />
          </linearGradient>
        </defs>
        <polygon
          className="loading--animate-dashes"
          fill="none"
          points="16,1 32,32 1,32"
          stroke="url(#l-gradient)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
