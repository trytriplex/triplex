/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function addDOMTestData(testId: string, data: Record<string, unknown>) {
  const element = document.createElement("div");
  element.setAttribute("data-testid", testId);
  element.textContent = JSON.stringify(data);
  element.style.display = "none";
  document.body.append(element);

  return () => {
    element.remove();
  };
}
