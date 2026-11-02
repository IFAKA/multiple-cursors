# Multiple Cursors Chrome Extension

A Chrome extension that brings VSCode-style multiple cursor selection to any webpage.

## Features

- **Multiple Cursor Selection**: Add multiple cursors anywhere on a webpage
- **Select Next Occurrence**: Use Ctrl+D to select the next occurrence of selected text
- **Alt+Click**: Add cursors by Alt+clicking at any position
- **Visual Indicators**: See all your cursors with animated indicators
- **Extension Icon Control**: Enable/disable via clicking the extension icon

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will be loaded and ready to use

## Usage

### Keyboard Shortcuts

- **Ctrl+D**: Select next occurrence of the current selection
- **Ctrl+L**: Select entire lines at all cursor positions
- **Alt+Click**: Add a cursor at the clicked position
- **Alt+Double-Click**: Select word at clicked position
- **Alt+Triple-Click**: Select line at clicked position
- **Alt+Shift+Click**: Select entire line at clicked position
- **Cmd+C / Ctrl+C**: Copy multiple selections to clipboard
- **Cmd+V / Ctrl+V**: Paste at multiple cursor positions
- **Escape**: Clear all cursors

### How to Use

1. **Enable the extension**: Click the extension icon and press "Enable Multiple Cursors"
2. **Select text**: Select any text on the page
3. **Add more selections**: Press `Ctrl+D` to select the next occurrence
4. **Add cursors manually**: Hold `Alt` and click anywhere to add a cursor
5. **Select words**: Hold `Alt` and double-click on words to select them
6. **Select lines**: Hold `Alt` and triple-click on lines to select them
7. **Select entire lines**: Press `Ctrl+L` to select entire lines at all cursor positions
8. **Select line at click**: Hold `Alt+Shift` and click to select entire line at that position
9. **Copy multiple selections**: Press `Cmd+C` (Mac) or `Ctrl+C` (Windows/Linux) to copy all selections
10. **Paste at multiple cursors**: Press `Cmd+V` (Mac) or `Ctrl+V` (Windows/Linux) to paste at all cursor positions
11. **Clear cursors**: Press `Escape` to clear all cursors

## Visual Indicators

- Blue animated cursors show where your multiple cursors are positioned
- A status indicator appears in the top-right corner when the extension is active
- Cursor positions update automatically as you type or navigate

## Compatibility

This extension works on any webpage, including:
- Text editors
- Code editors
- Forms
- Text areas
- Any editable content

## Technical Details

- Uses content scripts to inject functionality into web pages
- Handles text selection and cursor positioning
- Provides visual feedback with CSS animations
- Works with both light and dark themes

## Troubleshooting

If the extension doesn't work on a particular site:
1. Make sure the extension is enabled (Ctrl+Shift+M)
2. Try refreshing the page
3. Some sites may have restrictions on content script injection

## Development

To modify or extend this extension:
1. Edit the files in the extension directory
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension card
4. Test your changes

## License

MIT License - feel free to modify and distribute.

## Support

If this project is useful to you, you can support my work:

[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/zfaka)
