/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NumberInput } from "../number-input";
import { PropTagContext } from "../prop-input";

describe("number input", () => {
  afterEach(cleanup);

  it("should transform the set value", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="rotation"
        onChange={change}
        onConfirm={confirm}
        transformValue={{
          in: (value) => (value || 0) + 10,
          out: (value) => (value || 0) - 10,
        }}
      />,
    );

    const element = getByTestId("number-10") as HTMLInputElement;

    expect(element.value).toEqual("20");
  });

  it('should update the input value when the "value" prop changes via props', () => {
    const { getByTestId, rerender } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="rotation"
        onChange={() => {}}
        onConfirm={() => {}}
        transformValue={{
          in: (val) => (val || 0) + 1,
          out: (val) => (val || 0) - 1,
        }}
      />,
    );
    const element = getByTestId("number-10") as HTMLInputElement;

    rerender(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={20}
        name="rotation"
        onChange={() => {}}
        onConfirm={() => {}}
        transformValue={{
          in: (val) => (val || 0) + 1,
          out: (val) => (val || 0) - 1,
        }}
      />,
    );

    expect(element.valueAsNumber).toEqual(21);
  });

  it("should should callback with the transformed value", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={11}
        name="rotation"
        onChange={change}
        onConfirm={confirm}
        transformValue={{
          in: (value) => (value || 0) + 10,
          out: (value) => (value || 0) - 10,
        }}
      />,
    );
    const element = getByTestId("number-11") as HTMLInputElement;

    fireEvent.change(element, { target: { value: 19 } });
    fireEvent.blur(element, { target: { value: 19 } });

    expect(change).toHaveBeenCalledWith(9);
  });

  it("should decrement input", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByLabelText } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByLabelText("Decrease By 0.02");

    fireEvent.click(element);
    fireEvent.blur(element);

    expect(change).toHaveBeenCalledWith(9.98);
    expect(confirm).toHaveBeenCalledWith(9.98);
  });

  it("should increment input", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByLabelText } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByLabelText("Increase By 0.02");

    fireEvent.click(element);
    fireEvent.blur(element);

    expect(change).toHaveBeenCalledWith(10.02);
    expect(confirm).toHaveBeenCalledWith(10.02);
  });

  it("should clear value", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByLabelText } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByLabelText("Clear Value");

    fireEvent.click(element);
    fireEvent.blur(element);

    expect(change).toHaveBeenCalledWith(undefined);
    expect(confirm).toHaveBeenCalledWith(undefined);
  });

  it("should focus the input when not initiating a drag", async () => {
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );
    const element = getByTestId("number-10");

    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));
    fireEvent.mouseUp(element);

    expect(document.activeElement).toBe(element);
  });

  it("should not focus the input when initiating a drag", async () => {
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );
    const element = getByTestId("number-10");

    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));
    fireEvent.mouseMove(element);
    fireEvent.mouseUp(element);

    expect(document.activeElement).not.toBe(element);
  });

  it("should blur away from an iframe on mouse down", () => {
    const { getByTestId } = render(
      <>
        <iframe data-testid="iframe" />
        <NumberInput
          actionId="contextpanel_project_ignore"
          defaultValue={10}
          name="x"
          onChange={() => {}}
          onConfirm={() => {}}
        />
      </>,
    );
    const iframe = getByTestId("iframe");
    iframe.focus();
    const element = getByTestId("number-10");

    fireEvent.mouseDown(element);

    expect(document.activeElement).not.toBe(iframe);
  });

  it("should do nothing when there has been no movement in a drag", async () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByTestId("number-10");

    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));
    fireEvent.mouseMove(element, { clientX: 0 });

    expect(change).toHaveBeenCalledWith(10);
  });

  it("should increment when dragging movement is positive", async () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByTestId("number-10");
    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));

    fireEvent.mouseMove(element, { clientX: 1 });

    expect(change).toHaveBeenCalledWith(10.02);
  });

  it("should multiply the step during a drag when pressing ctrl", async () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10.2}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByTestId("number-10.2");
    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));
    await fireEvent.keyDown(document, { ctrlKey: true });

    fireEvent.mouseMove(element, { clientX: 1 });

    // TODO: This should be capped to multiples of 0.5
    // E.g. Round up or down. So this should round down to 10.5.
    expect(change).toHaveBeenCalledWith(10.7);
  });

  it("should reduce the step during a drag when pressing shift", async () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10.2}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByTestId("number-10.2");
    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));
    await fireEvent.keyDown(document, { shiftKey: true });

    fireEvent.mouseMove(element, { clientX: 1 });

    expect(change).toHaveBeenCalledWith(10.202);
  });

  it("should decrement when dragging movement is negative", async () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByTestId("number-10");
    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));

    fireEvent.mouseMove(element, { clientX: -1 });

    expect(change).toHaveBeenCalledWith(9.98);
  });

  it("should multiply the change when movement is over multiple pixels", async () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByTestId("number-10");
    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));

    fireEvent.mouseMove(element, { clientX: 100 });

    expect(change).toHaveBeenCalledWith(12);
  });

  it("should callback with confirm when completing a drag", async () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByTestId("number-10");
    fireEvent.mouseDown(element);
    await waitFor(() => getByTestId("pointer-lock"));
    fireEvent.mouseMove(element, { clientX: 100 });

    fireEvent.mouseUp(element);
    await waitForElementToBeRemoved(() => getByTestId("pointer-lock"));

    expect(confirm).toHaveBeenCalledWith(12);
  });

  it("should focus the input when clearing via the clear button", () => {
    const { getByLabelText, getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );
    const element = getByLabelText("Clear Value");
    const inputElement = getByTestId("number-10");

    fireEvent.click(element);

    expect(document.activeElement).toBe(inputElement);
  });

  it("should not callback if value is outside max range", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <PropTagContext.Provider value={{ max: 100 }}>
        <NumberInput
          actionId="contextpanel_project_ignore"
          defaultValue={10}
          name="x"
          onChange={change}
          onConfirm={confirm}
        />
      </PropTagContext.Provider>,
    );
    const element = getByTestId("number-10");

    fireEvent.change(element, { target: { value: "1000" } });
    fireEvent.blur(element);

    expect(change).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it("should not callback if value is outside max range", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <PropTagContext.Provider value={{ min: 0 }}>
        <NumberInput
          actionId="contextpanel_project_ignore"
          defaultValue={10}
          name="x"
          onChange={change}
          onConfirm={confirm}
        />
      </PropTagContext.Provider>,
    );
    const element = getByTestId("number-10");

    fireEvent.change(element, { target: { value: "-1000" } });
    fireEvent.blur(element);

    expect(change).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it("should not callback if nothing has changed", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <NumberInput
        actionId="contextpanel_project_ignore"
        defaultValue={10}
        name="x"
        onChange={change}
        onConfirm={confirm}
      />,
    );
    const element = getByTestId("number-10");

    fireEvent.change(element, { target: { value: "10" } });
    fireEvent.blur(element);

    expect(change).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });
});
