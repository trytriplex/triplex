// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ArrayInput } from "../array-input";

describe("array input", () => {
  it("should callback on change", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 1 },
          { type: "number", value: 2 },
        ]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );
    const result = getByTestId("number-1");

    fireEvent.change(result, { target: { valueAsNumber: 3 } });

    expect(change).toHaveBeenCalledWith([3, 2]);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("should callback on blur from any input", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 5 },
          { type: "number", value: 6 },
        ]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );
    const result = getByTestId("number-5");

    fireEvent.blur(result, { target: { valueAsNumber: 100 } });

    expect(confirm).toHaveBeenCalledWith([100, 6]);
  });
});
