# Devonboard AI - VS Code Extension

AI-powered developer onboarding extension that provides interactive checklists and contextual help directly in your IDE.

## Features

- **Interactive Onboarding Checklist**: View and track onboarding steps in a dedicated sidebar
- **Step Details Panel**: Click any step to see detailed instructions, code examples, and commands
- **Progress Tracking**: Automatically tracks time spent and completion status for each step
- **One-Click Commands**: Run setup commands directly from the step details panel
- **Real-time Sync**: Automatically syncs with the Devonboard backend

## Development

### Prerequisites

- Node.js 16+
- VS Code 1.80+
- Running Devonboard backend (see [../backend/README.md](../backend/README.md))

### Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch
```

### Testing the Extension

1. Open this folder in VS Code
2. Press `F5` to launch Extension Development Host
3. In the new window, you'll see "Devonboard AI" in the Activity Bar
4. Click the icon to open the onboarding sidebar

### Configuration

The extension can be configured via VS Code settings:

```json
{
  "devonboard.apiUrl": "http://localhost:3003",
  "devonboard.planId": "your-plan-uuid-here"
}
```

Or use the command palette:
- `Devonboard: Set Plan ID` - Configure your onboarding plan
- `Devonboard: Refresh` - Reload steps from the backend

### Building

```bash
# Package extension as .vsix
npx vsce package
```

## Architecture

```
src/
├── extension.ts    # Main entry point, activation logic
├── treeview.ts     # Tree view provider for checklist
├── webview.ts      # Webview panel for step details
├── api.ts          # Backend API client
└── types.ts        # Type definitions

resources/
└── icon.svg        # Extension icon
```

## Commands

- `devonboard.refresh` - Refresh onboarding steps
- `devonboard.setPlan` - Set plan ID
- `devonboard.showStepDetail` - Show step details (triggered by clicking)
- `devonboard.markComplete` - Mark step as complete
- `devonboard.markInProgress` - Start a step
- `devonboard.skip` - Skip a step

## Troubleshooting

**Extension not loading steps:**
- Ensure backend is running on the configured URL
- Check that plan ID is set correctly
- Run "Devonboard: Refresh" command

**Changes not reflected:**
- Run `npm run compile` to rebuild
- Reload the Extension Development Host (`Cmd+R` / `Ctrl+R`)

**API connection errors:**
- Verify backend health: `curl http://localhost:3003/api/health`
- Check VS Code Developer Console (Help > Toggle Developer Tools)
