import { BackupSnapshot } from '../types';

export class BackupManager {
  private static backups: BackupSnapshot[] = [];

  static createBackup(code: string, filePath?: string): BackupSnapshot {
    const backup: BackupSnapshot = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      originalCode: code,
      filePath,
      metadata: {
        codeLength: code.length,
        lineCount: code.split('\n').length,
        layers: []
      }
    };

    this.backups.push(backup);
    
    // Keep only the last 10 backups to avoid memory issues
    if (this.backups.length > 10) {
      this.backups = this.backups.slice(-10);
    }

    return backup;
  }

  static restoreBackup(backupId: string): string | null {
    const backup = this.backups.find(b => b.id === backupId);
    return backup ? backup.originalCode : null;
  }

  static listBackups(): BackupSnapshot[] {
    return [...this.backups];
  }

  static clearBackups(): void {
    this.backups = [];
  }
}
