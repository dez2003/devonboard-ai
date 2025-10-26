import * as vscode from 'vscode';
import { OnboardingStep, StepProgress } from './types';

/**
 * Manages the webview panel for displaying step details
 */
export class StepDetailPanel {
  public static currentPanel: StepDetailPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    step: OnboardingStep,
    progress: StepProgress,
    onStatusChange: (stepId: string, status: StepProgress['status']) => void
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (StepDetailPanel.currentPanel) {
      StepDetailPanel.currentPanel._panel.reveal(column);
      StepDetailPanel.currentPanel._update(step, progress);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      'stepDetail',
      step.title,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
      }
    );

    StepDetailPanel.currentPanel = new StepDetailPanel(
      panel,
      extensionUri,
      step,
      progress,
      onStatusChange
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    step: OnboardingStep,
    progress: StepProgress,
    onStatusChange: (stepId: string, status: StepProgress['status']) => void
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update(step, progress);

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'startStep':
            onStatusChange(step.id, 'in_progress');
            vscode.window.showInformationMessage(`Started: ${step.title}`);
            return;
          case 'completeStep':
            onStatusChange(step.id, 'completed');
            vscode.window.showInformationMessage(`Completed: ${step.title}`);
            return;
          case 'skipStep':
            onStatusChange(step.id, 'skipped');
            vscode.window.showInformationMessage(`Skipped: ${step.title}`);
            return;
          case 'runCommand':
            this._runCommand(message.command_text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  private async _runCommand(command: string) {
    const terminal = vscode.window.createTerminal('Devonboard');
    terminal.show();
    terminal.sendText(command);
  }

  private _update(step: OnboardingStep, progress: StepProgress) {
    this._panel.title = step.title;
    this._panel.webview.html = this._getHtmlForWebview(step, progress);
  }

  public dispose() {
    StepDetailPanel.currentPanel = undefined;

    // Clean up resources
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getHtmlForWebview(step: OnboardingStep, progress: StepProgress): string {
    const statusBadge = this._getStatusBadge(progress.status);
    const timeSpent = progress.timeSpent
      ? `${Math.round(progress.timeSpent / 1000 / 60)} min`
      : 'Not started';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${step.title}</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    h1 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .header {
      border-bottom: 1px solid var(--vscode-panel-border);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
      margin-top: 8px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.completed {
      background-color: var(--vscode-testing-iconPassed);
      color: white;
    }
    .badge.in-progress {
      background-color: var(--vscode-testing-iconQueued);
      color: white;
    }
    .badge.skipped {
      background-color: var(--vscode-testing-iconSkipped);
      color: white;
    }
    .badge.not-started {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .section {
      margin-bottom: 24px;
    }
    .section h2 {
      font-size: 16px;
      margin-bottom: 12px;
      color: var(--vscode-foreground);
    }
    .instructions {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 12px;
      border-radius: 4px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .command {
      background-color: var(--vscode-terminal-background);
      color: var(--vscode-terminal-foreground);
      padding: 8px 12px;
      border-radius: 4px;
      font-family: var(--vscode-editor-font-family);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .command code {
      flex: 1;
    }
    .command button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      padding: 4px 8px;
      border-radius: 2px;
      cursor: pointer;
      font-size: 11px;
    }
    .command button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 2px;
      cursor: pointer;
      font-size: 13px;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    ul {
      list-style-type: disc;
      padding-left: 20px;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${step.title}</h1>
    <div class="meta">
      ${statusBadge}
      <span>Type: ${step.step_type}</span>
      <span>Duration: ${step.estimated_duration} min</span>
      <span>Time spent: ${timeSpent}</span>
    </div>
  </div>

  ${step.description ? `
  <div class="section">
    <h2>Description</h2>
    <p>${step.description}</p>
  </div>
  ` : ''}

  <div class="section">
    <h2>Instructions</h2>
    <div class="instructions">${step.content.instructions}</div>
  </div>

  ${step.content.code ? `
  <div class="section">
    <h2>Code Example</h2>
    <div class="instructions"><code>${this._escapeHtml(step.content.code)}</code></div>
  </div>
  ` : ''}

  ${step.content.commands && step.content.commands.length > 0 ? `
  <div class="section">
    <h2>Commands to Run</h2>
    ${step.content.commands.map(cmd => `
      <div class="command">
        <code>${cmd}</code>
        <button onclick="runCommand('${this._escapeHtml(cmd)}')">Run</button>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${step.content.verificationSteps && step.content.verificationSteps.length > 0 ? `
  <div class="section">
    <h2>Verification Steps</h2>
    <ul>
      ${step.content.verificationSteps.map(v => `<li>${v}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="actions">
    ${progress.status === 'not_started' ? `
      <button onclick="startStep()">Start Step</button>
    ` : ''}
    ${progress.status === 'in_progress' ? `
      <button onclick="completeStep()">Mark Complete</button>
      <button class="secondary" onclick="skipStep()">Skip</button>
    ` : ''}
    ${progress.status === 'completed' ? `
      <button class="secondary" onclick="startStep()">Restart</button>
    ` : ''}
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function startStep() {
      vscode.postMessage({ command: 'startStep' });
    }

    function completeStep() {
      vscode.postMessage({ command: 'completeStep' });
    }

    function skipStep() {
      vscode.postMessage({ command: 'skipStep' });
    }

    function runCommand(cmd) {
      vscode.postMessage({ command: 'runCommand', command_text: cmd });
    }
  </script>
</body>
</html>`;
  }

  private _getStatusBadge(status: StepProgress['status']): string {
    const statusText = status.replace('_', ' ');
    return `<span class="badge ${status}">${statusText}</span>`;
  }

  private _escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
