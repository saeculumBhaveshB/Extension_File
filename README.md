# Indiamart Lead Fetcher

A Chrome extension that automatically fetches lead data from Indiamart's Lead Manager.

## Features

- Automatically fetches all lead data when you visit the Indiamart Lead Manager page
- Provides a button on the page to manually trigger data fetching
- Exports lead data as CSV or JSON files
- Stores lead data locally for offline access

## Installation

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now be installed and active

## Usage

### Automatic Data Fetching

1. Log in to your Indiamart seller account
2. Navigate to the Lead Manager page (`https://seller.indiamart.com/messagecentre`)
3. The extension will automatically detect the page and start fetching lead data
4. A notification will appear when the data fetching is complete

### Manual Data Fetching

1. Click the "Fetch All Leads" button that appears in the bottom right corner of the Lead Manager page
2. A notification will appear when the data fetching is complete

### Force Fetch (Bypass Login Check)

If you're experiencing issues with the extension not detecting your login status:

1. Click the "Force Fetch (Bypass Login Check)" button that appears next to the regular fetch button
2. This will attempt to fetch leads even if the extension doesn't detect that you're logged in
3. This feature is useful when the automatic login detection fails but you are actually logged in

### Direct Fetch Method

If both the standard and force fetch methods don't work:

1. Click the "Try Direct Fetch Method" button that appears on the page or in the popup
2. This method uses a different approach that closely mimics the exact API calls made by the Indiamart website
3. This is the most reliable method but may be slower than the standard methods

### Accessing and Exporting Data

1. Click the extension icon in the Chrome toolbar to open the popup
2. View the total number of leads and when they were last fetched
3. Click "Fetch All Leads Now" to manually trigger data fetching
4. Click "Export as CSV" or "Export as JSON" to download the lead data in your preferred format
5. Click "Clear Stored Data" to remove all stored lead data from your browser

### Debug Mode

If you're experiencing issues:

1. Click the "Debug" button that appears on the Lead Manager page
2. This will show information about your current session, login status, and cookies
3. Use this information to help troubleshoot any issues

## How It Works

The extension works by:

1. Detecting when you visit the Indiamart Lead Manager page
2. Making a POST request to `https://seller.indiamart.com/lmsreact/contactCount` to get the total number of leads
3. Making multiple POST requests to `https://seller.indiamart.com/lmsreact/getContactList` to fetch all lead data in batches
4. Storing the lead data in Chrome's local storage for offline access
5. Providing a user interface to view and export the data

## Privacy

All data is stored locally on your computer and is not sent to any external servers. The extension only makes requests to Indiamart's servers to fetch your own lead data.

## Troubleshooting

If you encounter any issues:

1. Make sure you are logged in to your Indiamart seller account
2. Check the browser console for any error messages
3. Try clearing the extension's stored data and fetching again
4. Ensure your internet connection is stable

### Common Issues

#### "Successfully fetched 0 leads out of 0 total" or "No leads have been fetched yet"

If you see this message, it could be due to one of the following reasons:

1. **Not logged in**: Make sure you are properly logged in to your Indiamart seller account. The extension needs your authentication cookies to access the API.

   - Solution: Log out and log back in to Indiamart, then try again.
   - Alternative: Use the "Force Fetch (Bypass Login Check)" button to attempt fetching even if login is not detected.

2. **Session expired**: Your Indiamart session may have expired.

   - Solution: Refresh the Indiamart page, log in again if needed, and try fetching leads again.

3. **No leads available**: Your account might not have any leads in the Lead Manager.

   - Solution: Check your Indiamart Lead Manager page manually to see if there are any leads.

4. **API changes**: Indiamart may have changed their API structure.

   - Solution: Try the "Direct Fetch Method" which uses a different approach to fetch leads.

5. **Cookie access issues**: The extension might not have permission to access the necessary cookies.
   - Solution: Make sure you've granted the extension all required permissions.
   - Alternative: Try the "Direct Fetch Method" which uses a different approach to handle cookies.

To help diagnose the issue, the extension now includes a Debug button that appears next to the Fetch All Leads button. Click this to see information about your current session and cookies.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
