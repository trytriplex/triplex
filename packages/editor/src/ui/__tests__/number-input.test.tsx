// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { NumberInput } from "../number-input";

describe("number input", () => {
  it("should transform the set value", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        name="rotation"
        defaultValue={10}
        onChange={change}
        onConfirm={confirm}
        transformValue={{
          in: (value) => (value || 0) + 10,
          out: (value) => (value || 0) - 10,
        }}
      />
    );

    const element = getByTestId("number-10") as HTMLInputElement;

    expect(element.value).toEqual("20");
  });

  it("should should callback with the transformed value", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        name="rotation"
        defaultValue={11}
        onChange={change}
        onConfirm={confirm}
        transformValue={{
          in: (value) => (value || 0) + 10,
          out: (value) => (value || 0) - 10,
        }}
      />
    );
    const element = getByTestId("number-11") as HTMLInputElement;

    fireEvent.change(element, { target: { value: 19 } });
    fireEvent.blur(element, { target: { value: 19 } });

    expect(change).toHaveBeenCalledWith(9);
  });
});
