import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { FileCategorizer } from './file-categorizer';
import { Session } from '../types';

export class OrganizerService {
  private categorizer = new FileCategorizer();

  async preview(enabledCategories: string[]): Promise<{ moves: Array<{ from: string; to: string; category: string }> }> {
    const desktopPath = this.getDesktopPath();
    const entries = await fs.readdir(desktopPath, { withFileTypes: true });
    
    const moves: Array<{ from: string; to: string; category: string }> = [];
    
    // Get all category names to avoid moving category folders
    const allCategories = this.categorizer.getAllCategories();

    for (const entry of entries) {
      const fullPath = path.join(desktopPath, entry.name);
      
      // Skip hidden files and the app's own files
      if (entry.name.startsWith('.')) continue;

      // IMPORTANT: Skip folders that are category folders themselves
      // This prevents moving "Shortcuts" folder into "Folders/Shortcuts"
      if (entry.isDirectory() && allCategories.includes(entry.name)) {
        continue;
      }

      let category: string;
      if (entry.isDirectory()) {
        category = 'Folders';
      } else {
        category = this.categorizer.getCategory(entry.name);
      }

      // Only include enabled categories
      if (!enabledCategories.includes(category)) {
        continue;
      }

      const destFolder = path.join(desktopPath, category);
      const destPath = path.join(destFolder, entry.name);

      // Only add if it's actually moving (not already in the right place)
      // Also ensure we're not trying to move a folder into itself
      if (fullPath !== destPath && !fullPath.startsWith(destFolder + path.sep)) {
        moves.push({
          from: fullPath,
          to: destPath,
          category,
        });
      }
    }

    return { moves };
  }

  async execute(enabledCategories: string[]): Promise<Session> {
    const preview = await this.preview(enabledCategories);
    const desktopPath = this.getDesktopPath();
    const moves: Array<{ from: string; to: string }> = [];

    // Group moves by category to create folders efficiently
    const movesByCategory = new Map<string, typeof preview.moves>();
    for (const move of preview.moves) {
      // Security check: Ensure all paths are within desktop directory
      const normalizedFrom = path.normalize(move.from);
      const normalizedTo = path.normalize(move.to);
      const normalizedDesktop = path.normalize(desktopPath);
      
      if (!normalizedFrom.startsWith(normalizedDesktop) || !normalizedTo.startsWith(normalizedDesktop)) {
        console.warn(`Skipping move outside desktop: ${move.from} -> ${move.to}`);
        continue;
      }

      if (!movesByCategory.has(move.category)) {
        movesByCategory.set(move.category, []);
      }
      movesByCategory.get(move.category)!.push(move);
    }

    // Create folders and move files
    for (const [category, categoryMoves] of movesByCategory) {
      const categoryFolder = path.join(desktopPath, category);
      
      // Skip if category folder already exists as a file (shouldn't happen, but safety check)
      try {
        const existingStat = await fs.stat(categoryFolder);
        if (!existingStat.isDirectory()) {
          console.warn(`Category folder ${category} exists but is not a directory, skipping`);
          continue;
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Folder doesn't exist, create it
          try {
            await fs.mkdir(categoryFolder, { recursive: true });
          } catch (mkdirError: any) {
            if (mkdirError.code !== 'EEXIST') {
              throw new Error(`Failed to create folder ${category}: ${mkdirError.message}`);
            }
          }
        } else {
          throw error;
        }
      }

      for (const move of categoryMoves) {
        try {
          // Verify source still exists before moving
          try {
            await fs.access(move.from);
          } catch (error: any) {
            if (error.code === 'ENOENT') {
              console.warn(`Source file no longer exists: ${move.from}`);
              continue;
            }
            throw error;
          }

          // Handle filename conflicts
          const finalDest = await this.resolveConflict(move.to);
          await fs.rename(move.from, finalDest);
          moves.push({
            from: move.from,
            to: finalDest,
          });
        } catch (error: any) {
          console.error(`Failed to move ${move.from}:`, error);
          // Continue with other files even if one fails
        }
      }
    }

    return {
      id: this.generateSessionId(),
      createdAt: new Date(),
      moves,
    };
  }

  async rollback(session: Session): Promise<void> {
    const desktopPath = this.getDesktopPath();
    const failedRollbacks: Array<{ path: string; reason: string }> = [];
    
    // Validate session before proceeding
    if (!session || !session.moves || !Array.isArray(session.moves)) {
      throw new Error('Invalid session data');
    }

    for (const move of session.moves) {
      try {
        // Security check: Ensure all paths are within desktop directory
        const normalizedFrom = path.normalize(move.from);
        const normalizedTo = path.normalize(move.to);
        const normalizedDesktop = path.normalize(desktopPath);
        
        if (!normalizedFrom.startsWith(normalizedDesktop) || !normalizedTo.startsWith(normalizedDesktop)) {
          failedRollbacks.push({
            path: move.to,
            reason: 'Path outside desktop directory - security violation'
          });
          continue;
        }

        // Check if destination file/directory exists
        let destStats;
        try {
          destStats = await fs.stat(move.to);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            failedRollbacks.push({
              path: move.to,
              reason: 'Destination file no longer exists'
            });
            continue;
          }
          throw error;
        }

        // Verify it's the same type (file vs directory)
        let sourceStats;
        try {
          sourceStats = await fs.stat(move.from);
          // If source exists and is different type, skip to avoid data corruption
          if (sourceStats.isDirectory() !== destStats.isDirectory()) {
            failedRollbacks.push({
              path: move.to,
              reason: 'Source exists but is different type (file vs directory)'
            });
            continue;
          }
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
          // Source doesn't exist, safe to proceed
        }

        // Check if source location is available (no conflict)
        try {
          await fs.access(move.from);
          // Source exists, need to handle conflict safely
          const conflictPath = await this.resolveConflict(move.from);
          await fs.rename(move.to, conflictPath);
          console.log(`Rolled back with conflict resolution: ${move.to} -> ${conflictPath}`);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            // Source doesn't exist, safe to move back
            await fs.rename(move.to, move.from);
            console.log(`Rolled back: ${move.to} -> ${move.from}`);
          } else {
            throw error;
          }
        }
      } catch (error: any) {
        failedRollbacks.push({
          path: move.to,
          reason: error.message || 'Unknown error'
        });
        console.error(`Failed to rollback ${move.to}:`, error);
        // Continue with other files
      }
    }

    // If there were failures, log them but don't throw (partial success is acceptable)
    if (failedRollbacks.length > 0) {
      console.warn(`Rollback completed with ${failedRollbacks.length} failures:`);
      failedRollbacks.forEach(failure => {
        console.warn(`  - ${failure.path}: ${failure.reason}`);
      });
    }
  }

  private async resolveConflict(filePath: string): Promise<string> {
    let finalPath = filePath;
    let counter = 1;
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);

    // Safety limit to prevent infinite loops
    const maxAttempts = 1000;

    while (counter < maxAttempts) {
      try {
        await fs.access(finalPath);
        // Path exists, try with counter
        // Handle both files and directories
        if (ext) {
          // Has extension, treat as file
          finalPath = path.join(dir, `${base} (${counter})${ext}`);
        } else {
          // No extension, could be directory or file without extension
          finalPath = path.join(dir, `${basename} (${counter})`);
        }
        counter++;
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Path doesn't exist, we can use this path
          return finalPath;
        }
        // Some other error, rethrow
        throw error;
      }
    }

    throw new Error(`Could not resolve conflict for ${filePath} after ${maxAttempts} attempts`);
  }

  private getDesktopPath(): string {
    return path.join(os.homedir(), 'Desktop');
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

