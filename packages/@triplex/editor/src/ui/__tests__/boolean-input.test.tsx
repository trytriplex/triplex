/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BooleanInput } from "../boolean-input";

describe("boolean input", () => {
  afterEach(cleanup);

  it("should update inputs value when prop changes", () => {
    const { getByTestId, rerender } = render(
      <BooleanInput
        actionId="contextpanel_project_ignore"
        defaultValue={false}
        name="name"
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );
    const element = getByTestId("boolean-false") as HTMLInputElement;

    rerender(
      <BooleanInput
        actionId="contextpanel_project_ignore"
        defaultValue={true}
        name="name"
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(element.checked).toEqual(true);
  });
});
