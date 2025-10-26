import * as vscode from 'vscode';
import { OnboardingStep, StepProgress } from './types';

export class OnboardingTreeProvider implements vscode.TreeDataProvider<OnboardingTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<OnboardingTreeItem | undefined | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private steps: OnboardingStep[] = [];
  private progress: Record<string, StepProgress> = {};

  constructor(private context: vscode.ExtensionContext) {
    // Load progress from storage
    this.loadProgress();
  }

  /**
   * Update steps data
   */
  setSteps(steps: OnboardingStep[]) {
    this.steps = steps;
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Get step progress
   */
  getStepProgress(stepId: string): StepProgress {
    return this.progress[stepId] || {
      stepId,
      status: 'not_started',
      timeSpent: 0,
    };
  }

  /**
   * Update step progress
   */
  async updateStepProgress(stepId: string, status: StepProgress['status']) {
    const existing = this.progress[stepId] || {
      stepId,
      status: 'not_started',
      timeSpent: 0,
    };

    const now = Date.now();

    if (status === 'in_progress' && !existing.startedAt) {
      existing.startedAt = now;
    }

    if (status === 'completed' && !existing.completedAt) {
      existing.completedAt = now;
      if (existing.startedAt) {
        existing.timeSpent += now - existing.startedAt;
      }
    }

    existing.status = status;
    this.progress[stepId] = existing;

    await this.saveProgress();
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Load progress from storage
   */
  private async loadProgress() {
    const saved = this.context.globalState.get<Record<string, StepProgress>>('progress');
    if (saved) {
      this.progress = saved;
    }
  }

  /**
   * Save progress to storage
   */
  private async saveProgress() {
    await this.context.globalState.update('progress', this.progress);
  }

  /**
   * Refresh tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Get tree item
   */
  getTreeItem(element: OnboardingTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children
   */
  getChildren(element?: OnboardingTreeItem): Thenable<OnboardingTreeItem[]> {
    if (!element) {
      // Root level - return all steps
      return Promise.resolve(
        this.steps.map((step) => {
          const progress = this.getStepProgress(step.id);
          return new OnboardingTreeItem(step, progress);
        })
      );
    }

    // No nested items
    return Promise.resolve([]);
  }
}

/**
 * Tree item for onboarding step
 */
class OnboardingTreeItem extends vscode.TreeItem {
  constructor(
    public readonly step: OnboardingStep,
    public readonly progress: StepProgress
  ) {
    super(step.title, vscode.TreeItemCollapsibleState.None);

    this.description = `${step.estimated_duration}min`;
    this.tooltip = step.description || step.title;

    // Set icon based on status
    switch (progress.status) {
      case 'completed':
        this.iconPath = new vscode.ThemeIcon(
          'check',
          new vscode.ThemeColor('testing.iconPassed')
        );
        break;
      case 'in_progress':
        this.iconPath = new vscode.ThemeIcon(
          'sync~spin',
          new vscode.ThemeColor('testing.iconQueued')
        );
        break;
      case 'skipped':
        this.iconPath = new vscode.ThemeIcon(
          'debug-step-over',
          new vscode.ThemeColor('testing.iconSkipped')
        );
        break;
      default:
        this.iconPath = new vscode.ThemeIcon('circle-outline');
    }

    // Add context value for menu commands
    this.contextValue = `step-${progress.status}`;

    // Command to show details
    this.command = {
      command: 'devonboard.showStepDetail',
      title: 'Show Step Details',
      arguments: [step, progress],
    };
  }
}
