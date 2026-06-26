/**
 * ============================================================
 * KOSTHINK — stack.js
 * Implementasi Struktur Data Stack (LIFO)
 * ============================================================
 */

class Stack {
  constructor(maxSize = 50) {
    this._data = [];
    this._maxSize = maxSize;
  }

  push(item) {
    if (this._data.length >= this._maxSize) {
      this._data.shift();
    }
    this._data.push(item);
  }

  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack kosong — tidak ada item yang bisa di-pop.');
    }
    return this._data.pop();
  }

  peek() {
    if (this.isEmpty()) return null;
    return this._data[this._data.length - 1];
  }

  isEmpty() {
    return this._data.length === 0;
  }

  size() {
    return this._data.length;
  }

  clear() {
    this._data = [];
  }

  toArray() {
    return [...this._data];
  }
}

class UndoRedoManager {
  constructor(maxSize = 50) {
    this.undoStack = new Stack(maxSize);
    this.redoStack = new Stack(maxSize);
  }

  recordChange(content) {
    this.undoStack.push(content);
    this.redoStack.clear();
  }

  undo(currentContent) {
    if (this.undoStack.isEmpty()) return null;
    this.redoStack.push(currentContent);
    return this.undoStack.pop();
  }

  redo(currentContent) {
    if (this.redoStack.isEmpty()) return null;
    this.undoStack.push(currentContent);
    return this.redoStack.pop();
  }

  canUndo() {
    return !this.undoStack.isEmpty();
  }

  canRedo() {
    return !this.redoStack.isEmpty();
  }

  getState() {
    return {
      undoItems: this.undoStack.toArray(),
      redoItems: this.redoStack.toArray(),
      undoSize: this.undoStack.size(),
      redoSize: this.redoStack.size(),
    };
  }
}