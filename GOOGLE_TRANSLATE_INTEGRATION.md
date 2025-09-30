# Google Translate Integration

This application now integrates with browser translation features to offer automatic translation based on user preferences.

## How It Works

### 1. Automatic Browser Language Detection
- When users first visit the site, the app detects their browser's language preference
- If their browser is set to Spanish, the content automatically displays in Spanish
- The preference is saved to localStorage for future visits

### 2. Dynamic HTML Lang Attribute
- When users change the language via the hamburger menu, the HTML `lang` attribute updates
- This triggers Chrome and other browsers to offer "Translate this page?" if the page language doesn't match the user's browser language
- Example: If a Spanish-speaking user is viewing English content, Chrome will offer to translate

### 3. Language Selection Menu
- Users can manually switch languages via the hamburger menu
- Language preference is saved across sessions
- Available in both mobile and desktop views

## How Users Experience It

1. **First Visit:**
   - Browser language is auto-detected
   - Content displays in detected language (English or Spanish)

2. **Chrome Translation Prompt:**
   - If page language ≠ browser language, Chrome offers to translate
   - Users can accept one-time translation or "Always translate"
   - Translation is applied to entire page

3. **Manual Language Switch:**
   - Open hamburger menu
   - Click "Language: English" or "Language: Español"
   - Content switches immediately
   - Preference saved for next visit

## Optional: Full Google Translate Widget

If you want to enable the full Google Translate widget with multiple languages, add this to your `ClientLayout.tsx`:

```tsx
import GoogleTranslate from '@/components/GoogleTranslate';

// Inside the return statement, add:
<GoogleTranslate />
```

This enables:
- 12+ language options (English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, Russian)
- Visual translate widget (can be styled or hidden)
- Automatic translation synced with menu selection

## Technical Details

### Files Modified:
1. **`src/contexts/LanguageContext.tsx`**
   - Manages global language state
   - Auto-detects browser language
   - Updates `document.documentElement.lang` attribute
   - Adds `content-language` meta tag

2. **`src/components/Header.tsx`**
   - Added language toggle to hamburger menu
   - Shows current language
   - Toggles between EN/ES

3. **`src/components/GoogleTranslate.tsx`** (optional)
   - Embeds Google Translate widget
   - Syncs with language menu selection
   - Hides Google branding (optional)

### Browser Compatibility:
- **Chrome/Edge:** Shows "Translate this page?" prompt
- **Firefox:** Requires Google Translate add-on
- **Safari:** Requires user to enable translation in preferences
- **All browsers:** Manual language selection works universally

## SEO Considerations

The HTML `lang` attribute helps with:
- Search engine language detection
- Accessibility (screen readers)
- Browser translation features
- International SEO

## Future Enhancements

Consider adding:
- More languages (French, German, etc.)
- Language-specific URLs (example.com/es/)
- Server-side rendering of language preference
- Geolocation-based language detection

