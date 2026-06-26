/**
 * ============================================================
 * KOSTHINK — editor.js
 * Logika Editor: menghubungkan UndoRedoManager dengan UI
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  const textarea   = document.getElementById('editor-content');
  const titleInput = document.getElementById('editor-title');
  const btnUndo    = document.getElementById('btn-undo');
  const btnRedo    = document.getElementById('btn-redo');
  const btnSave    = document.getElementById('btn-save');
  const saveStatus = document.getElementById('save-status');
  const charCount  = document.getElementById('char-count');

  const docId   = textarea.dataset.docId;
  const saveUrl = textarea.dataset.saveUrl;
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  const manager = new UndoRedoManager(50);
  const DEBOUNCE_MS  = 800;   
  const AUTOSAVE_MS  = 30000; 

  let debounceTimer = null;

  textarea.addEventListener('input', function () {
    updateCharCount();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      manager.recordChange(textarea.value); 
      renderVisualizer();
      updateButtons();
    }, DEBOUNCE_MS);
  });

  // KEYBOARD SHORTCUTS: Z untuk Undo, X untuk Redo
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      performUndo();
    } else if (e.ctrlKey && e.key === 'x') { // REDO PAKAI X
      e.preventDefault();
      performRedo();
    } else if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveDocument();
    }
  });

  btnUndo.addEventListener('click', performUndo);

  function performUndo() {
    const previousContent = manager.undo(textarea.value);
    if (previousContent !== null) {
      textarea.value = previousContent;
      updateCharCount();
      renderVisualizer();
      updateButtons();
    }
  }

  btnRedo.addEventListener('click', performRedo);

  function performRedo() {
    const nextContent = manager.redo(textarea.value);
    if (nextContent !== null) {
      textarea.value = nextContent;
      updateCharCount();
      renderVisualizer();
      updateButtons();
    }
  }

  btnSave.addEventListener('click', saveDocument);

  function saveDocument() {
    setSaveStatus('saving');
    fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        title: titleInput.value.trim() || 'Untitled',
        content: textarea.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setSaveStatus('saved', data.updated_at);
        } else {
          setSaveStatus('error');
        }
      })
      .catch(() => setSaveStatus('error'));
  }

  setInterval(saveDocument, AUTOSAVE_MS);

  function setSaveStatus(state, time = '') {
    if (state === 'saving') {
      saveStatus.innerHTML = 'Menyimpan...';
    } else if (state === 'saved') {
      saveStatus.innerHTML = `Tersimpan pukul ${time}`;
    } else {
      saveStatus.innerHTML = 'Gagal menyimpan';
    }
  }

  function updateButtons() {
    if (manager.canUndo()) {
        btnUndo.disabled = false; btnUndo.style.opacity = '1';
    } else {
        btnUndo.disabled = true; btnUndo.style.opacity = '0.5';
    }
    
    if (manager.canRedo()) {
        btnRedo.disabled = false; btnRedo.style.opacity = '1';
    } else {
        btnRedo.disabled = true; btnRedo.style.opacity = '0.5';
    }
  }

  function updateCharCount() {
    const count = textarea.value.length;
    charCount.textContent = count.toLocaleString('id-ID') + ' karakter';
  }

  function renderVisualizer() {
    const state = manager.getState();
    renderStackPanel('undo-stack-visual', state.undoItems, 'undo');
    renderStackPanel('redo-stack-visual', state.redoItems, 'redo');
    document.getElementById('undo-count').textContent = state.undoSize;
    document.getElementById('redo-count').textContent = state.redoSize;
  }

  function renderStackPanel(containerId, stackArray, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (stackArray.length === 0) {
      container.innerHTML = '<div class="stack-empty">— kosong —</div>';
      return;
    }
    const reversed = [...stackArray].reverse();
    reversed.forEach((content, index) => {
      const isTop = index === 0;
      const item = document.createElement('div');
      item.className = `stack-item stack-item--${type}${isTop ? ' stack-item--top' : ''}`;
      const preview = content.replace(/\n/g, ' ').trim().substring(0, 28);
      const displayText = preview || '(kosong)';
      const ellipsis = content.replace(/\n/g, ' ').trim().length > 28 ? '…' : '';
      item.innerHTML = `<span class="stack-item__text">${displayText}${ellipsis}</span> <span class="stack-item__badge">${isTop ? 'TOP' : ''}</span>`;
      container.appendChild(item);
    });
  }

  updateButtons();
  updateCharCount();
  renderVisualizer();
});