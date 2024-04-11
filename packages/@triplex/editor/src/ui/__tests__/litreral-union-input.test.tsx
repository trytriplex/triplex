/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LiteralUnionInput } from "../literal-union-input";

describe("literal union input", () => {
  afterEach(cleanup);

  it("should default to a false boolean literal", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId, getByText } = render(
      <LiteralUnionInput
        actionId="contextpanel_project_ignore"
        defaultValue={false}
        name="union"
        onChange={onChange}
        onConfirm={onConfirm}
        values={[
          { kind: "boolean", literal: false },
          { kind: "string", literal: "one" },
        ]}
      />
    );

    const select = getByTestId("select-union") as HTMLSelectElement;
    const option = getByText("false") as HTMLOptionElement;

    expect(select.value).toEqual(option.value);
  });

  it("should update inputs value when prop changes", () => {
    const { getByTestId, rerender } = render(
      <LiteralUnionInput
        actionId="contextpanel_project_ignore"
        defaultValue={false}
        name="union"
        onChange={() => {}}
        onConfirm={() => {}}
        values={[
          { kind: "boolean", literal: false },
          { kind: "string", literal: "one" },
        ]}
      />
    );
    const select = getByTestId("select-union") as HTMLInputElement;

    rerender(
      <LiteralUnionInput
        actionId="contextpanel_project_ignore"
        defaultValue="one"
        name="union"
        onChange={() => {}}
        onConfirm={() => {}}
        values={[
          { kind: "boolean", literal: false },
          { kind: "string", literal: "one" },
        ]}
      />
    );

    expect(select.value).toEqual("1");
  });

  it("should callback with a boolean value", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId } = render(
      <LiteralUnionInput
        actionId="contextpanel_project_ignore"
        name="union"
        onChange={onChange}
        onConfirm={onConfirm}
        values={[
          { kind: "boolean", literal: false },
          { kind: "string", literal: "one" },
        ]}
      />
    );
    const select = getByTestId("select-union") as HTMLSelectElement;

    fireEvent.change(select, { target: { value: "0" } });

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("should callback with a numeric value", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId } = render(
      <LiteralUnionInput
        actionId="contextpanel_project_ignore"
        defaultValue={false}
        name="union"
        onChange={onChange}
        onConfirm={onConfirm}
        values={[
          { kind: "boolean", literal: false },
          { kind: "number", literal: 123 },
        ]}
      />
    );
    const select = getByTestId("select-union") as HTMLSelectElement;

    fireEvent.change(select, { target: { value: "1" } });

    expect(onChange).toHaveBeenCalledWith(123);
  });

  it("should callback with a string value", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId } = render(
      <LiteralUnionInput
        actionId="contextpanel_project_ignore"
        defaultValue={false}
        name="union"
        onChange={onChange}
        onConfirm={onConfirm}
        values={[
          { kind: "boolean", literal: false },
          { kind: "string", literal: "foo" },
        ]}
      />
    );
    const select = getByTestId("select-union") as HTMLSelectElement;

    fireEvent.change(select, { target: { value: "1" } });

    expect(onChange).toHaveBeenCalledWith("foo");
  });

  it("should not callback if value is already set", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId } = render(
      <LiteralUnionInput
        actionId="contextpanel_project_ignore"
        defaultValue={false}
        name="union"
        onChange={onChange}
        onConfirm={onConfirm}
        values={[
          { kind: "boolean", literal: false },
          { kind: "string", literal: "foo" },
        ]}
      />
    );
    const select = getByTestId("select-union") as HTMLSelectElement;

    fireEvent.change(select, { target: { value: "0" } });

    expect(onChange).not.toHaveBeenCalled();
  });
});
