import * as vscode from 'vscode';
import { OnboardingTreeProvider } from './treeview';
import { StepDetailPanel } from './webview';
import { DevonboardAPI } from './api';
import { OnboardingStep, StepProgress } from './types';

let treeDataProvider: OnboardingTreeProvider;
let api: DevonboardAPI;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Devonboard AI extension is now active');

  // Initialize API client
  const config = vscode.workspace.getConfiguration('devonboard');
  const apiUrl = config.get<string>('apiUrl') || 'http://localhost:3003';
  api = new DevonboardAPI(apiUrl);

  // Initialize tree data provider
  treeDataProvider = new OnboardingTreeProvider(context);

  // Register tree view
  const treeView = vscode.window.createTreeView('devonboard-checklist', {
    treeDataProvider,
    showCollapseAll: false,
  });

  context.subscriptions.push(treeView);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.refresh', async () => {
      await refreshSteps();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.setPlan', async () => {
      await setPlanId();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devonboard.showStepDetail',
      async (step: OnboardingStep, progress: StepProgress) => {
        StepDetailPanel.createOrShow(
          context.extensionUri,
          step,
          progress,
          async (stepId, status) => {
            await treeDataProvider.updateStepProgress(stepId, status);
            treeDataProvider.refresh();
          }
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.markComplete', async (step: OnboardingStep) => {
      await treeDataProvider.updateStepProgress(step.id, 'completed');
      vscode.window.showInformationMessage(`Marked as complete: ${step.title}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.markInProgress', async (step: OnboardingStep) => {
      await treeDataProvider.updateStepProgress(step.id, 'in_progress');
      vscode.window.showInformationMessage(`Started: ${step.title}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.skip', async (step: OnboardingStep) => {
      await treeDataProvider.updateStepProgress(step.id, 'skipped');
      vscode.window.showInformationMessage(`Skipped: ${step.title}`);
    })
  );

  // Auto-load steps if plan ID is configured
  const planId = config.get<string>('planId');
  if (planId) {
    await loadSteps(planId);
  } else {
    vscode.window
      .showInformationMessage(
        'Welcome to Devonboard AI! Set your plan ID to get started.',
        'Set Plan ID'
      )
      .then((selection) => {
        if (selection === 'Set Plan ID') {
          vscode.commands.executeCommand('devonboard.setPlan');
        }
      });
  }

  // Check API health on activation
  try {
    const health = await api.healthCheck();
    console.log('API health check:', health);

    if (health.status === 'ok') {
      vscode.window.showInformationMessage(
        `Devonboard AI connected to ${apiUrl}`
      );
    }
  } catch (error) {
    vscode.window.showWarningMessage(
      `Could not connect to Devonboard API at ${apiUrl}. Please check your configuration.`
    );
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('Devonboard AI extension is now deactivated');
}

/**
 * Load steps from API
 */
async function loadSteps(planId: string) {
  try {
    const steps = await api.getSteps(planId);
    treeDataProvider.setSteps(steps);
    vscode.window.showInformationMessage(
      `Loaded ${steps.length} onboarding steps`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to load steps: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Refresh steps from API
 */
async function refreshSteps() {
  const config = vscode.workspace.getConfiguration('devonboard');
  const planId = config.get<string>('planId');

  if (!planId) {
    vscode.window.showWarningMessage('No plan ID configured. Please set a plan ID first.');
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Refreshing onboarding steps...',
      cancellable: false,
    },
    async () => {
      await loadSteps(planId);
    }
  );
}

/**
 * Set plan ID
 */
async function setPlanId() {
  const config = vscode.workspace.getConfiguration('devonboard');
  const currentPlanId = config.get<string>('planId');

  const planId = await vscode.window.showInputBox({
    prompt: 'Enter your Devonboard plan ID',
    placeHolder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
    value: currentPlanId,
    validateInput: (value) => {
      if (!value) {
        return 'Plan ID is required';
      }
      // Basic UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        return 'Please enter a valid UUID';
      }
      return null;
    },
  });

  if (planId) {
    await config.update('planId', planId, vscode.ConfigurationTarget.Workspace);
    vscode.window.showInformationMessage(`Plan ID set to: ${planId}`);

    // Load steps for the new plan
    await loadSteps(planId);
  }
}
