/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

interface UndoableEvent {
  redo: () => void;
  undo: () => void;
}

interface UndoRedoState {
  clearUndoRedo(): void;
  performUndoableEvent(event: UndoableEvent): void;
  redo(): void;
  redoAvailable: boolean;
  stack: { redo: UndoableEvent[]; undo: UndoableEvent[] };
  undo(): void;
  undoAvailable: boolean;
}

export const useUndoRedoState = create<UndoRedoState>((set, getState) => ({
  clearUndoRedo() {
    set({
      redoAvailable: false,
      stack: { redo: [], undo: [] },
      undoAvailable: false,
    });
  },
  performUndoableEvent(event) {
    const state = getState();
    state.stack.undo.push(event);
    state.stack.redo.length = 0;
    event.redo();

    set({
      redoAvailable: false,
      undoAvailable: true,
    });
  },
  redo() {
    const state = getState();
    const action = state.stack.redo.pop();

    if (action) {
      action.redo();
      state.stack.undo.push(action);

      set({
        redoAvailable: state.stack.redo.length > 0,
        undoAvailable: state.stack.undo.length > 0,
      });
    }
  },
  redoAvailable: false,
  stack: { redo: [], undo: [] },
  undo() {
    const state = getState();
    const action = state.stack.undo.pop();

    if (action) {
      action.undo();
      state.stack.redo.push(action);

      set({
        redoAvailable: state.stack.redo.length > 0,
        undoAvailable: state.stack.undo.length > 0,
      });
    }
  },
  undoAvailable: false,
}));
