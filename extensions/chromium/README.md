# Databuddy Opt-Out Chrome Extension

A Chrome extension that allows users to opt out of Databuddy analytics tracking by setting localStorage flags.

## Features

- **Simple Toggle**: Easy-to-use switch to enable/disable Databuddy tracking
- **Persistent Settings**: Settings are synced across Chrome sessions
- **Immediate Effect**: Works on current tab and future page loads
- **Dashboard Design**: Matches the Databuddy dashboard design system
- **Privacy Focused**: Only sets localStorage flags, no data collection

## Installation

### From Source

1. Clone or download this extension
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extensions/chromium` folder
5. The extension will appear in your toolbar

## Usage

1. Click the Databuddy Opt-Out extension icon in your toolbar
2. Toggle the "Block Databuddy Tracking" switch
3. The status will update to show whether tracking is blocked or active
4. Changes take effect immediately on the current tab and all future page loads

## How It Works

The extension works by:

1. Setting `databuddy_opt_out` and `databuddy_disabled` flags in localStorage
2. Setting global window variables that the tracking script can check
3. Overriding the Databuddy object methods to prevent tracking
4. Running before page scripts load to ensure maximum effectiveness

## Technical Details

- **Manifest Version**: 3
- **Permissions**: `storage`, `activeTab`
- **Content Script**: Runs at `document_start` for maximum effectiveness
- **Storage**: Uses Chrome's sync storage to persist settings across devices

## Design System

The extension uses the same design tokens as the Databuddy dashboard:

- **Colors**: Matches dashboard light/dark theme
- **Typography**: Uses Geist font family
- **Components**: Switch component styled like dashboard UI
- **Spacing**: Consistent with dashboard layout system

## Privacy

This extension:
- ✅ Only sets localStorage flags to opt out of tracking
- ✅ Does not collect or transmit any user data
- ✅ Settings are stored locally in Chrome sync storage
- ✅ No external network requests

## Support

If you encounter any issues or have questions, please check the main Databuddy documentation or contact support. 