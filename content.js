class MultipleCursors {
  constructor() {
    this.cursors = [];
    this.isActive = false;
    this.currentSelection = null;
    this.overlay = null;
    this.init();
  }

  init() {
    this.createOverlay();
    this.bindEvents();
    this.addStyles();
    this.loadState();
    
    // Periodic cleanup of invalid cursors
    setInterval(() => {
      if (this.isActive && this.cursors.length > 0) {
        this.cleanupInvalidCursors();
      }
    }, 1000);
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'multiple-cursors-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    `;
    document.body.appendChild(this.overlay);
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cursor-indicator {
        position: absolute;
        width: 2px;
        height: 20px;
        background-color: #007acc;
        pointer-events: none;
        z-index: 2147483648;
        animation: blink 1s infinite;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      .cursor-selection {
        position: absolute;
        background-color: rgba(0, 122, 204, 0.2);
        pointer-events: none;
        z-index: 2147483647;
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    // Handle Ctrl+D for selecting next occurrence
    document.addEventListener('keydown', (e) => {
      if (this.isActive && e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.selectNextOccurrence();
      }
    });

    // Handle Ctrl+L for selecting entire lines
    document.addEventListener('keydown', (e) => {
      if (this.isActive && e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        this.selectEntireLines();
      }
    });

    // Handle Alt+Click for adding cursors and drag selection
    document.addEventListener('mousedown', (e) => {
      if (this.isActive && e.altKey && e.button === 0) {
        this.isDragging = false;
        this.dragStartPos = { x: e.clientX, y: e.clientY };
        this.dragStartRange = this.getRangeFromPoint(e.clientX, e.clientY);
        this.dragStartTime = Date.now();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isActive && e.altKey && e.button === 0 && this.dragStartRange) {
        const distance = Math.sqrt(
          Math.pow(e.clientX - this.dragStartPos.x, 2) + 
          Math.pow(e.clientY - this.dragStartPos.y, 2)
        );
        
        if (distance > 5) { // Only start dragging if moved more than 5 pixels
          this.isDragging = true;
          e.preventDefault();
          this.updateDragSelection(e);
        }
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (this.isActive && e.altKey && e.button === 0 && this.dragStartRange) {
        if (this.isDragging) {
          e.preventDefault();
          this.finalizeDragSelection(e);
        } else {
          // Simple click - add cursor at position
          this.addCursorAtPosition(e);
        }
        this.dragStartRange = null;
        this.isDragging = false;
      }
    });

    // Handle normal click to cancel multiple cursors (but not interfere with normal selection)
    document.addEventListener('mousedown', (e) => {
      if (this.isActive && this.cursors.length > 0 && !e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.button === 0) {
        // Only clear if not in an input/textarea/editable element
        const target = e.target;
        const isEditable = target.isContentEditable || 
                          target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' ||
                          target.closest('[contenteditable]');
        
        if (!isEditable) {
          this.clearCursors();
        }
      }
    });

    // Handle Alt+double-click for word selection (like normal double-click)
    document.addEventListener('dblclick', (e) => {
      if (this.isActive && e.altKey && e.button === 0) {
        e.preventDefault();
        this.selectWordAtPosition(e);
        // Clear any drag state
        this.dragStartRange = null;
        this.isDragging = false;
      }
    });

    // Handle Alt+triple-click for line selection
    document.addEventListener('click', (e) => {
      if (this.isActive && e.altKey && e.button === 0) {
        // Check for triple click (3 clicks within 500ms)
        const now = Date.now();
        if (!this.lastClickTime || now - this.lastClickTime > 500) {
          this.clickCount = 1;
        } else {
          this.clickCount++;
        }
        this.lastClickTime = now;
        
        if (this.clickCount === 3) {
          e.preventDefault();
          this.selectLineAtPosition(e);
          this.clickCount = 0;
          // Clear any drag state
          this.dragStartRange = null;
          this.isDragging = false;
        }
      }
    });

    // Handle Alt+Shift+Click for line selection
    document.addEventListener('mousedown', (e) => {
      if (this.isActive && e.altKey && e.shiftKey && e.button === 0) {
        e.preventDefault();
        this.selectLineAtPosition(e);
      }
    });

    // Handle Escape to clear cursors
    document.addEventListener('keydown', (e) => {
      if (this.isActive && e.key === 'Escape') {
        this.clearCursors();
      }
    });

    // Handle copy with multiple cursors
    document.addEventListener('keydown', (e) => {
      if (this.isActive && this.cursors.length > 0 && 
          ((e.metaKey && e.key === 'c') || (e.ctrlKey && e.key === 'c'))) {
        e.preventDefault();
        this.copyMultipleSelections();
      }
    });

    // Handle paste with multiple cursors
    document.addEventListener('keydown', (e) => {
      if (this.isActive && this.cursors.length > 0 && 
          ((e.metaKey && e.key === 'v') || (e.ctrlKey && e.key === 'v'))) {
        e.preventDefault();
        this.pasteAtMultipleCursors();
      }
    });
  }

  toggle() {
    this.isActive = !this.isActive;
    if (!this.isActive) {
      this.clearCursors();
    }
    this.updateOverlay();
    this.saveState();
  }

  loadState() {
    chrome.storage.local.get(['multipleCursorsActive'], (result) => {
      this.isActive = result.multipleCursorsActive || false;
      this.updateOverlay();
    });
  }

  saveState() {
    chrome.storage.local.set({ multipleCursorsActive: this.isActive });
  }

  addCursorAtPosition(event) {
    const range = this.getRangeFromPoint(event.clientX, event.clientY);
    if (range) {
      this.addCursor(range);
    }
  }

  getRangeFromPoint(x, y) {
    try {
      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(x, y);
        if (range && range.startContainer) {
          return range;
        }
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos && pos.offsetNode) {
          const range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.setEnd(pos.offsetNode, pos.offset);
          return range;
        }
      }
    } catch (e) {
      console.log('Error getting range from point:', e);
    }
    return null;
  }

  addCursor(range) {
    // Check if this selection already exists
    if (this.isDuplicateSelection(range)) {
      return;
    }

    const cursor = {
      range: range.cloneRange(),
      element: this.createCursorElement(range)
    };
    
    this.cursors.push(cursor);
    this.updateCursorPositions();
  }

  isDuplicateSelection(newRange) {
    return this.cursors.some(cursor => {
      const existingRange = cursor.range;
      
      // Check for exact match
      if (existingRange.startContainer === newRange.startContainer &&
          existingRange.endContainer === newRange.endContainer &&
          existingRange.startOffset === newRange.startOffset &&
          existingRange.endOffset === newRange.endOffset) {
        return true;
      }
      
      // Check for overlapping selections
      const existingStart = this.getRangePosition(existingRange);
      const existingEnd = existingStart + (existingRange.endOffset - existingRange.startOffset);
      const newStart = this.getRangePosition(newRange);
      const newEnd = newStart + (newRange.endOffset - newRange.startOffset);
      
      // Check if ranges overlap
      return (newStart >= existingStart && newStart <= existingEnd) ||
             (newEnd >= existingStart && newEnd <= existingEnd) ||
             (newStart <= existingStart && newEnd >= existingEnd);
    });
  }

  getRangePosition(range) {
    try {
      const text = range.startContainer.textContent || range.startContainer.innerText;
      const allText = document.body.innerText;
      const beforeText = text.substring(0, range.startOffset);
      return allText.indexOf(beforeText, 0);
    } catch (e) {
      return 0;
    }
  }

  createCursorElement(range) {
    const rect = range.getBoundingClientRect();
    const cursor = document.createElement('div');
    cursor.className = 'cursor-indicator';
    
    // Check if this is a line selection (has width)
    if (rect.width > 2) {
      cursor.classList.add('line-selection');
    }
    
    cursor.style.left = rect.left + 'px';
    cursor.style.top = rect.top + 'px';
    cursor.style.width = Math.max(2, rect.width) + 'px';
    cursor.style.height = Math.max(20, rect.height) + 'px';
    
    this.overlay.appendChild(cursor);
    return cursor;
  }

  selectNextOccurrence() {
    if (this.cursors.length === 0) {
      const selection = window.getSelection();
      if (selection.toString().trim()) {
        this.currentSelection = selection.toString();
        this.addCursor(selection.getRangeAt(0));
      }
      return;
    }

    const firstCursor = this.cursors[0];
    const text = firstCursor.range.startContainer.textContent || firstCursor.range.startContainer.innerText;
    const searchText = this.currentSelection || text.substring(
      Math.max(0, firstCursor.range.startOffset - 50),
      Math.min(text.length, firstCursor.range.startOffset + 50)
    ).trim();

    if (!searchText) return;

    // Find next occurrence
    const allText = document.body.innerText;
    const currentPos = this.getCurrentPosition();
    const nextIndex = allText.indexOf(searchText, currentPos + 1);
    
    if (nextIndex !== -1) {
      const range = this.createRangeFromTextPosition(allText, nextIndex, searchText.length);
      if (range && !this.isDuplicateSelection(range)) {
        this.addCursor(range);
      }
    }
  }

  getCurrentPosition() {
    if (this.cursors.length === 0) return 0;
    const firstCursor = this.cursors[0];
    const text = document.body.innerText;
    const cursorText = firstCursor.range.startContainer.textContent || firstCursor.range.startContainer.innerText;
    return text.indexOf(cursorText, 0);
  }

  createRangeFromTextPosition(text, startIndex, length) {
    let currentIndex = 0;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent.length;
      if (currentIndex + nodeLength > startIndex) {
        const range = document.createRange();
        const offset = startIndex - currentIndex;
        range.setStart(node, offset);
        range.setEnd(node, offset + length);
        return range;
      }
      currentIndex += nodeLength;
    }
    return null;
  }

  selectEntireLines() {
    if (this.cursors.length === 0) {
      // If no cursors, add one at current selection
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        this.addCursor(selection.getRangeAt(0));
      }
    }

    // Select entire lines for all cursors
    this.cursors.forEach(cursor => {
      const range = cursor.range;
      const lineRange = this.getLineRange(range);
      if (lineRange) {
        cursor.range = lineRange;
        this.updateCursorElement(cursor);
      }
    });

    this.updateCursorPositions();
  }

  selectLineAtPosition(event) {
    const range = this.getRangeFromPoint(event.clientX, event.clientY);
    if (range) {
      const lineRange = this.getLineRange(range);
      if (lineRange) {
        this.addCursor(lineRange);
      }
    }
  }

  selectWordAtPosition(event) {
    const range = this.getRangeFromPoint(event.clientX, event.clientY);
    if (range) {
      const wordRange = this.getWordRange(range);
      if (wordRange) {
        this.addCursor(wordRange);
      }
    }
  }

  getWordRange(range) {
    try {
      const startContainer = range.startContainer;
      
      if (startContainer.nodeType === Node.TEXT_NODE) {
        const text = startContainer.textContent;
        const offset = range.startOffset;
        
        if (!text || offset < 0 || offset > text.length) {
          return range;
        }
        
        // Find word boundaries
        let wordStart = offset;
        let wordEnd = offset;
        
        // Find start of word
        while (wordStart > 0 && /\w/.test(text[wordStart - 1])) {
          wordStart--;
        }
        
        // Find end of word
        while (wordEnd < text.length && /\w/.test(text[wordEnd])) {
          wordEnd++;
        }
        
        // Only create word range if we found a word
        if (wordStart < wordEnd) {
          const wordRange = document.createRange();
          wordRange.setStart(startContainer, wordStart);
          wordRange.setEnd(startContainer, wordEnd);
          return wordRange;
        }
      }
      
      return range;
    } catch (e) {
      console.log('Error creating word range:', e);
      return range; // Return original range as fallback
    }
  }

  updateDragSelection(event) {
    // Create a temporary range for the drag selection
    const endRange = this.getRangeFromPoint(event.clientX, event.clientY);
    if (endRange && this.dragStartRange) {
      // Create selection from start to current position
      const selection = document.createRange();
      selection.setStart(this.dragStartRange.startContainer, this.dragStartRange.startOffset);
      selection.setEnd(endRange.startContainer, endRange.startOffset);
      
      // Update the temporary cursor for visual feedback
      if (this.tempCursor) {
        this.tempCursor.remove();
      }
      this.tempCursor = this.createCursorElement(selection);
    }
  }

  finalizeDragSelection(event) {
    const endRange = this.getRangeFromPoint(event.clientX, event.clientY);
    if (endRange && this.dragStartRange) {
      // Create final selection
      const selection = document.createRange();
      selection.setStart(this.dragStartRange.startContainer, this.dragStartRange.startOffset);
      selection.setEnd(endRange.startContainer, endRange.startOffset);
      
      // Only add if there's actual content selected
      if (selection.toString().trim()) {
        this.addCursor(selection);
      }
    }
    
    // Clean up temporary cursor
    if (this.tempCursor) {
      this.tempCursor.remove();
      this.tempCursor = null;
    }
  }

  getLineRange(range) {
    try {
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      
      // Create a new range for the entire line
      const lineRange = document.createRange();
      
      // Find the start of the line
      let lineStart = startContainer;
      let lineStartOffset = range.startOffset;
      
      if (startContainer.nodeType === Node.TEXT_NODE) {
        const text = startContainer.textContent;
        const beforeCursor = text.substring(0, lineStartOffset);
        const lineStartIndex = beforeCursor.lastIndexOf('\n') + 1;
        lineStartOffset = lineStartIndex;
      }
      
      // Find the end of the line
      let lineEnd = endContainer;
      let lineEndOffset = range.endOffset;
      
      if (endContainer.nodeType === Node.TEXT_NODE) {
        const text = endContainer.textContent;
        const afterCursor = text.substring(lineEndOffset);
        const nextNewline = afterCursor.indexOf('\n');
        if (nextNewline === -1) {
          lineEndOffset = text.length;
        } else {
          lineEndOffset = lineEndOffset + nextNewline;
        }
      }
      
      lineRange.setStart(lineStart, lineStartOffset);
      lineRange.setEnd(lineEnd, lineEndOffset);
      
      return lineRange;
    } catch (e) {
      console.log('Error creating line range:', e);
      return null;
    }
  }

  updateCursorElement(cursor) {
    // Update the visual element to show the selection
    if (cursor.element) {
      const rect = cursor.range.getBoundingClientRect();
      cursor.element.style.left = rect.left + 'px';
      cursor.element.style.top = rect.top + 'px';
      cursor.element.style.width = Math.max(2, rect.width) + 'px';
      cursor.element.style.height = Math.max(20, rect.height) + 'px';
    }
  }

  copyMultipleSelections() {
    if (this.cursors.length === 0) return;

    // Get all selected text from multiple cursors
    const selections = this.cursors.map(cursor => {
      return cursor.range.toString();
    });

    // Join all selections with newlines (like VSCode)
    const combinedText = selections.join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(combinedText).then(() => {
      console.log('Multiple selections copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      this.fallbackCopyToClipboard(combinedText);
    });
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('Fallback copy successful');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
  }

  pasteAtMultipleCursors() {
    if (this.cursors.length === 0) return;

    // Get clipboard content
    navigator.clipboard.readText().then(text => {
      this.pasteTextAtCursors(text);
    }).catch(err => {
      console.error('Failed to read clipboard:', err);
      // Fallback - try to get from a temporary textarea
      this.fallbackPasteFromClipboard();
    });
  }

  fallbackPasteFromClipboard() {
    const textArea = document.createElement('textarea');
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    
    try {
      document.execCommand('paste');
      const text = textArea.value;
      document.body.removeChild(textArea);
      this.pasteTextAtCursors(text);
    } catch (err) {
      console.error('Fallback paste failed:', err);
      document.body.removeChild(textArea);
    }
  }

  pasteTextAtCursors(text) {
    // If multiple lines in clipboard, paste each line at each cursor
    const lines = text.split('\n');
    
    this.cursors.forEach((cursor, index) => {
      const range = cursor.range;
      const textToPaste = lines[index] || lines[0] || text;
      
      try {
        range.deleteContents();
        range.insertNode(document.createTextNode(textToPaste));
        range.setStartAfter(range.endContainer);
        range.setEndAfter(range.endContainer);
      } catch (err) {
        console.error('Failed to paste at cursor:', err);
      }
    });
    
    this.updateCursorPositions();
  }

  updateCursorPositions() {
    this.cursors.forEach(cursor => {
      try {
        const rect = cursor.range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          // Handle collapsed ranges (cursor positions)
          cursor.element.style.left = rect.left + 'px';
          cursor.element.style.top = rect.top + 'px';
          cursor.element.style.width = '2px';
          cursor.element.style.height = '20px';
        } else {
          // Handle text selections
          cursor.element.style.left = rect.left + 'px';
          cursor.element.style.top = rect.top + 'px';
          cursor.element.style.width = Math.max(2, rect.width) + 'px';
          cursor.element.style.height = Math.max(20, rect.height) + 'px';
        }
      } catch (e) {
        console.log('Error updating cursor position:', e);
        // Remove invalid cursors
        if (cursor.element && cursor.element.parentNode) {
          cursor.element.parentNode.removeChild(cursor.element);
        }
      }
    });
  }

  clearCursors() {
    this.cursors.forEach(cursor => {
      if (cursor.element && cursor.element.parentNode) {
        cursor.element.parentNode.removeChild(cursor.element);
      }
    });
    this.cursors = [];
    this.currentSelection = null;
    
    // Clean up any temporary cursors
    if (this.tempCursor && this.tempCursor.parentNode) {
      this.tempCursor.parentNode.removeChild(this.tempCursor);
      this.tempCursor = null;
    }
  }

  updateOverlay() {
    if (this.isActive) {
      this.overlay.style.display = 'block';
    } else {
      this.overlay.style.display = 'none';
      this.clearCursors();
    }
  }

  cleanupInvalidCursors() {
    // Remove cursors with invalid ranges
    this.cursors = this.cursors.filter(cursor => {
      try {
        // Test if the range is still valid
        cursor.range.getBoundingClientRect();
        return true;
      } catch (e) {
        // Remove invalid cursor
        if (cursor.element && cursor.element.parentNode) {
          cursor.element.parentNode.removeChild(cursor.element);
        }
        return false;
      }
    });
  }
}

// Initialize the multiple cursors functionality
const multipleCursors = new MultipleCursors();

// Add a visual indicator when the extension is active
const statusIndicator = document.createElement('div');
statusIndicator.id = 'multiple-cursors-status';
statusIndicator.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: #007acc;
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
  z-index: 2147483649;
  display: none;
`;
statusIndicator.textContent = 'Multiple Cursors: ON';
document.body.appendChild(statusIndicator);

// Update status indicator
const originalToggle = multipleCursors.toggle.bind(multipleCursors);
multipleCursors.toggle = function() {
  originalToggle();
  statusIndicator.style.display = this.isActive ? 'block' : 'none';
};

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    multipleCursors.toggle();
    sendResponse({active: multipleCursors.isActive});
    return true; // Keep the message channel open for async response
  }
});
