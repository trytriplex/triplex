/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function LoadingTriangle() {
  return (
    <div className="fixed inset-0 flex items-center justify-center pt-20">
      <svg height="200" viewBox="0 0 40 60" width="200">
        <defs>
          <linearGradient id="l-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgb(245 245 245)" />
            <stop offset="100%" stopColor="rgb(163 163 163)" />
          </linearGradient>
        </defs>
        <polygon
          fill="none"
          points="16,1 32,32 1,32"
          stroke="url(#l-gradient)"
          strokeWidth="1.4"
        />
      </svg>
    </div>
  );
}
