# Installation Guide

## Quick Start

1. **Download the Extension**
   - Download or clone this repository to your computer
   - Make sure you have all the files in the `multiple-cursors` folder

2. **Load the Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked"
   - Select the `multiple-cursors` folder
   - The extension should now appear in your extensions list

3. **Test the Extension**
   - Open the `test.html` file in Chrome (or any webpage)
   - Press `Ctrl+Shift+M` to enable multiple cursors
   - You should see a blue status indicator in the top-right corner

## Usage Instructions

### Basic Controls
- **Ctrl+Shift+M**: Toggle the extension on/off
- **Ctrl+D**: Select next occurrence of selected text
- **Alt+Click**: Add cursor at clicked position
- **Escape**: Clear all cursors
- **Any key**: Type at all cursor positions

### Step-by-Step Example
1. Enable the extension with `Ctrl+Shift+M`
2. Select the word "text" in any paragraph
3. Press `Ctrl+D` to select the next occurrence
4. Press `Ctrl+D` again to select more occurrences
5. Start typing to replace all selected text
6. Press `Escape` to clear cursors

## Troubleshooting

### Extension Not Working
- Make sure Developer mode is enabled in Chrome
- Try refreshing the page after loading the extension
- Check that the extension is enabled in `chrome://extensions/`

### Cursors Not Appearing
- Press `Ctrl+Shift+M` to toggle the extension
- Look for the blue status indicator in the top-right corner
- Try selecting text first, then using `Ctrl+D`

### Keyboard Shortcuts Not Working
- Make sure the page has focus (click on the page)
- Some websites may block certain keyboard events
- Try on a simple page like the included `test.html`

## Features

✅ **Multiple Cursor Selection**: Select multiple occurrences of text
✅ **Manual Cursor Placement**: Alt+click to add cursors anywhere
✅ **Simultaneous Typing**: Type at all cursor positions at once
✅ **Visual Indicators**: See all your cursors with animated indicators
✅ **Keyboard Shortcuts**: Full keyboard control like VSCode
✅ **Cross-Site Compatibility**: Works on any webpage

## Advanced Usage

### Working with Code
- Great for editing code in online editors
- Works with syntax highlighting
- Maintains cursor positions during editing

### Form Editing
- Edit multiple form fields simultaneously
- Useful for bulk data entry
- Works with text inputs and textareas

### Content Management
- Edit multiple instances of the same text
- Useful for website content updates
- Works with rich text editors

## Support

If you encounter issues:
1. Check the browser console for errors (F12 → Console)
2. Try on different websites to isolate the issue
3. Make sure the extension is properly loaded
4. Restart Chrome if needed

## Development

To modify the extension:
1. Edit the files in the extension folder
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension
4. Test your changes
