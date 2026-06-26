export type Mode = 'base' | 'npm' | 'git';

export class ModeManager {
  private static currentMode: Mode = 'base';

  static getCurrentMode(): Mode {
    return this.currentMode;
  }

  static setMode(mode: Mode): void {
    if (this.isValidMode(mode)) {
      this.currentMode = mode;
    } else {
      throw new Error(`Invalid mode: ${mode}. Valid modes: ${this.modes.join(', ')}`);
    }
  }

  static get modes(): Mode[] {
    return ['base', 'npm', 'git'];
  }

  static getPrompt(mode?: Mode): string {
    const currentMode = mode || this.currentMode;
    switch (currentMode) {
      case 'npm': return 'npm> ';
      case 'git': return 'git> ';
      default: return '> ';
    }
  }

  static isValidMode(mode: string): mode is Mode {
    return this.modes.includes(mode as Mode);
  }

  static reset(): void {
    this.currentMode = 'base';
  }
}