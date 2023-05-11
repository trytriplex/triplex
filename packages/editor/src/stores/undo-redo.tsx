import { create } from "zustand";

interface UndoableEvent {
  undo: () => void;
  redo: () => void;
}

interface UndoRedoState {
  stack: { undo: UndoableEvent[]; redo: UndoableEvent[] };
  undoAvailable: boolean;
  redoAvailable: boolean;
  undo(): void;
  redo(): void;
  performUndoableEvent(event: UndoableEvent): void;
  clearUndoRedo(): void;
}

export const useUndoRedoState = create<UndoRedoState>((set, getState) => ({
  undoAvailable: false,
  redoAvailable: false,
  stack: { undo: [], redo: [] },
  performUndoableEvent(event) {
    const state = getState();
    state.stack.undo.push(event);
    state.stack.redo.length = 0;
    event.redo();

    set({
      undoAvailable: true,
      redoAvailable: false,
    });
  },
  undo() {
    const state = getState();
    const action = state.stack.undo.pop();

    if (action) {
      action.undo();
      state.stack.redo.push(action);

      set({
        undoAvailable: state.stack.undo.length > 0,
        redoAvailable: state.stack.redo.length > 0,
      });
    }
  },
  redo() {
    const state = getState();
    const action = state.stack.redo.pop();

    if (action) {
      action.redo();
      state.stack.undo.push(action);

      set({
        undoAvailable: state.stack.undo.length > 0,
        redoAvailable: state.stack.redo.length > 0,
      });
    }
  },
  clearUndoRedo() {
    set({
      undoAvailable: false,
      redoAvailable: false,
      stack: { undo: [], redo: [] },
    });
  },
}));
