# Indiamart Lead Fetcher

A Chrome extension that automatically fetches lead data from Indiamart's Lead Manager for paid customers.

## Features

- Automatically fetches all lead data when you visit the Indiamart Lead Manager page
- Provides buttons on the page to manually trigger data fetching using different methods
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

1. Navigate to the Lead Manager page (`https://seller.indiamart.com/messagecentre`)
2. The extension will automatically detect the page and start fetching lead data
3. A notification will appear when the data fetching is complete

### Manual Data Fetching

1. Click the "Fetch All Leads" button that appears in the bottom right corner of the Lead Manager page
2. A notification will appear when the data fetching is complete

### Direct Fetch Method

If the standard method doesn't work:

1. Click the "Try Direct Fetch Method" button that appears on the page or in the popup
2. This method uses a different approach that closely mimics the exact API calls made by the Indiamart website
3. This is the most reliable method but may be slower than the standard methods

### XHR Fetch Method

If all other methods don't work:

1. Click the "Try XHR Fetch Method" button that appears on the page or in the popup
2. This method uses XMLHttpRequest instead of the Fetch API to make requests
3. This can sometimes work when other methods fail due to different handling of cookies and headers
4. This is a last resort method that uses a completely different approach to communicate with the Indiamart API

### Accessing and Exporting Data

1. Click the extension icon in the Chrome toolbar to open the popup
2. View the total number of leads and when they were last fetched
3. Click "Fetch All Leads Now" to manually trigger data fetching
4. Click "Export as CSV" or "Export as JSON" to download the lead data in your preferred format
5. Click "Clear Stored Data" to remove all stored lead data from your browser

### Debug Mode

If you're experiencing issues:

1. Click the "Debug" button that appears on the Lead Manager page
2. This will show information about your current session and cookies
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

1. Check the browser console for any error messages
2. Try clearing the extension's stored data and fetching again
3. Ensure your internet connection is stable
4. Try each of the different fetch methods (standard, direct, and XHR)

### Common Issues

#### "Successfully fetched 0 leads out of 0 total" or "No leads have been fetched yet"

If you see this message, it could be due to one of the following reasons:

1. **No leads available**: Your account might not have any leads in the Lead Manager.

   - Solution: Check your Indiamart Lead Manager page manually to see if there are any leads.

2. **API changes**: Indiamart may have changed their API structure.

   - Solution: Try the "Direct Fetch Method" which uses a different approach to fetch leads.
   - Alternative: Try the "XHR Fetch Method" which uses XMLHttpRequest instead of the Fetch API.

3. **Cookie access issues**: The extension might not have permission to access the necessary cookies.
   - Solution: Make sure you've granted the extension all required permissions.
   - Alternative: Try the "Direct Fetch Method" or "XHR Fetch Method" which use different approaches to handle cookies.

To help diagnose the issue, the extension now includes a Debug button that appears next to the Fetch All Leads button. Click this to see information about your current session and cookies.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
