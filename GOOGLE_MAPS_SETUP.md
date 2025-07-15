# Google Maps API Setup for Address Autocomplete

## Setup Instructions

1. **Get a Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Places API" and "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Add the API Key to Environment Variables**:
   Create a `.env.local` file in your project root and add:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Restart your development server** after adding the environment variable.

## Features Added

- **Click outside to close**: Both signup form and success modal can be closed by clicking outside
- **Address autocomplete**: Business address field now has Google Places autocomplete
- **Auto-fill city, state, ZIP**: When an address is selected, it automatically fills in the city, state, and ZIP code fields

## How it Works

1. User starts typing in the Business Address field
2. Google Places API provides address suggestions
3. User selects an address from the dropdown
4. The form automatically fills in:
   - Street address
   - City
   - State
   - ZIP code

## Security Note

Make sure to restrict your Google Maps API key to your domain to prevent unauthorized usage. 