# Math Notation AI - Chrome Extension

A powerful Chrome extension that provides instant AI-powered explanations for mathematical symbols and notation. Simply highlight any math symbol on any webpage to get clear, contextual explanations.

## Features

- **Instant Recognition**: Automatically detects mathematical symbols and notation
- **AI-Powered Explanations**: Uses advanced AI to provide clear, contextual explanations
- **Smart Context Awareness**: Considers surrounding text for better explanations
- **Beautiful Tooltips**: Clean, responsive tooltip design with dark mode support
- **Usage Tracking**: Monitor your daily usage and statistics
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance Optimized**: Lightweight and fast with intelligent caching

## File Structure

```
math notation ai/
├── manifest.json           # Extension manifest (Chrome Extension v3)
├── popup.html             # Popup interface HTML
├── README.md              # This file
├── SETUP.md               # Detailed setup instructions
├── create_icons.html      # Icon generator utility
├── js/                    # JavaScript files
│   ├── content.js         # Main content script (optimized)
│   ├── popup.js           # Popup interface logic
│   └── background.js      # Service worker for extension lifecycle
├── css/                   # Stylesheets
│   ├── tooltip.css        # Tooltip styling with accessibility
│   └── popup.css          # Popup interface styling
└── icons/                 # Extension icons
    ├── icon16.png         # 16x16 icon
    ├── icon48.png         # 48x48 icon
    └── icon128.png        # 128x128 icon
```

## Quick Setup

### 1. Generate Icons
1. Open `create_icons.html` in your browser
2. Right-click each icon and save as PNG in the `icons/` folder
3. Delete `create_icons.html` when done

### 2. Install Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder
4. The extension should now appear in your browser

### 3. Test the Extension
1. Visit any webpage with mathematical content (e.g., Wikipedia math articles)
2. Highlight a math symbol like `∫`, `α`, or `∑`
3. See the AI explanation appear instantly!

## Key Improvements Made

### 🏗️ Architecture
- **Modular Design**: Separated concerns into distinct files
- **Class-Based Structure**: Modern ES6 classes for better organization
- **Service Worker**: Proper background script for Chrome Extension v3
- **Error Handling**: Comprehensive error reporting and user feedback

### ⚡ Performance
- **Debounced Selection**: Prevents excessive API calls
- **Smart Caching**: Reduces redundant requests
- **Lazy Loading**: Only loads resources when needed
- **Memory Management**: Proper cleanup and resource management

### 🎨 User Experience
- **Responsive Design**: Works on all screen sizes
- **Dark Mode Support**: Automatic dark/light theme detection
- **Accessibility**: ARIA labels, keyboard navigation, high contrast support
- **Loading States**: Clear feedback during API requests

### 🔧 Developer Experience
- **Clean Code**: Well-documented, maintainable code structure
- **Error Logging**: Comprehensive logging for debugging
- **Extensible**: Easy to add new features and modify existing ones
- **Standards Compliant**: Follows Chrome Extension best practices

## Configuration

### API Endpoint
Update the API URL in `js/content.js`:
```javascript
this.API_URL = 'https://your-production-api.com'; // Change from localhost
```

### Settings
The extension supports various settings stored in Chrome storage:
- `enableTooltips`: Enable/disable tooltip display
- `autoHide`: Automatically hide tooltips after delay
- `autoHideDelay`: Time before auto-hiding (default: 20 seconds)
- `maxSymbolLength`: Maximum length of text to process (default: 50 chars)
- `enableKeyboardShortcuts`: Enable ESC key to close tooltips

## Usage Statistics

The extension tracks:
- Daily usage counts
- Total lookups performed
- Installation date
- User preferences

All data is stored locally in Chrome storage and never transmitted except for API requests.

## Browser Compatibility

- **Chrome**: Full support (v88+)
- **Edge**: Full support (Chromium-based)
- **Firefox**: Not supported (Chrome Extension v3 specific)
- **Safari**: Not supported

## Development

### Adding New Math Patterns
Edit the `looksLikeMath()` function in `js/content.js`:
```javascript
const mathPatterns = [
  /[α-ωΑ-Ω]/,              // Greek letters
  /[∫∂∇∑∏√±∞]/,            // Calculus & operators
  // Add your patterns here
];
```

### Customizing Tooltips
Modify styles in `css/tooltip.css`:
- Colors and themes
- Animation timing
- Responsive breakpoints
- Accessibility features

### Backend Integration
The extension expects a REST API with this endpoint:
```
POST /api/explain
{
  "symbol": "∫",
  "context": "surrounding text...",
  "userId": "user_123...",
  "tier": "free"
}
```

Response format:
```json
{
  "explanation": "The integral symbol represents...",
  "category": "calculus",
  "cached": false
}
```

## Security

- **Content Security Policy**: Strict CSP in manifest
- **Permissions**: Minimal required permissions
- **Data Privacy**: No personal data collection
- **Secure Communication**: HTTPS-only API communication

## Troubleshooting

### Extension Not Loading
1. Check `chrome://extensions/` for errors
2. Ensure all files are in correct locations
3. Verify manifest.json syntax
4. Check browser console for errors

### Tooltips Not Appearing
1. Verify API endpoint is accessible
2. Check network requests in DevTools
3. Ensure math symbols are being detected
4. Check if tooltips are disabled in settings

### Performance Issues
1. Check for JavaScript errors in console
2. Verify API response times
3. Clear extension storage if needed
4. Restart browser

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the SETUP.md file for detailed instructions
3. Check browser console for error messages
4. Create an issue with detailed reproduction steps

---

**Built with ❤️ for the mathematical community**
