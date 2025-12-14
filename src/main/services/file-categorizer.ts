import * as path from 'path';

export class FileCategorizer {
  private categoryMap: Map<string, string> = new Map([
    // Images
    ['jpg', 'Images'],
    ['jpeg', 'Images'],
    ['png', 'Images'],
    ['gif', 'Images'],
    ['svg', 'Images'],
    ['webp', 'Images'],
    ['bmp', 'Images'],
    ['ico', 'Images'],
    
    // Documents
    ['pdf', 'Documents'],
    ['doc', 'Documents'],
    ['docx', 'Documents'],
    ['txt', 'Documents'],
    ['xlsx', 'Documents'],
    ['xls', 'Documents'],
    ['ppt', 'Documents'],
    ['pptx', 'Documents'],
    ['odt', 'Documents'],
    ['rtf', 'Documents'],
    
    // Videos
    ['mp4', 'Videos'],
    ['avi', 'Videos'],
    ['mov', 'Videos'],
    ['mkv', 'Videos'],
    ['wmv', 'Videos'],
    ['flv', 'Videos'],
    
    // Audio
    ['mp3', 'Audio'],
    ['wav', 'Audio'],
    ['flac', 'Audio'],
    ['ogg', 'Audio'],
    ['m4a', 'Audio'],
    
    // Archives
    ['zip', 'Archives'],
    ['rar', 'Archives'],
    ['7z', 'Archives'],
    ['tar', 'Archives'],
    ['gz', 'Archives'],
    
    // Code
    ['js', 'Code'],
    ['ts', 'Code'],
    ['py', 'Code'],
    ['html', 'Code'],
    ['css', 'Code'],
    ['json', 'Code'],
    ['xml', 'Code'],
    ['java', 'Code'],
    ['cpp', 'Code'],
    ['c', 'Code'],
    ['cs', 'Code'],
    ['php', 'Code'],
    ['rb', 'Code'],
    ['go', 'Code'],
    ['rs', 'Code'],
    
    // Shortcuts
    ['lnk', 'Shortcuts'],
    ['url', 'Shortcuts'],
    ['desktop', 'Shortcuts'],
    
    // Executables
    ['exe', 'Executables'],
    ['msi', 'Executables'],
    ['app', 'Executables'],
    ['deb', 'Executables'],
    ['rpm', 'Executables'],
    
    // Fonts
    ['ttf', 'Fonts'],
    ['otf', 'Fonts'],
    ['woff', 'Fonts'],
    ['woff2', 'Fonts'],
  ]);

  private defaultCategories = [
    'Images',
    'Documents',
    'Videos',
    'Audio',
    'Archives',
    'Code',
    'Shortcuts',
    'Executables',
    'Fonts',
    'Folders',
    'Other',
  ];

  getCategory(filename: string): string {
    const ext = path.extname(filename).toLowerCase().slice(1);
    return this.categoryMap.get(ext) || 'Other';
  }

  getAllCategories(): string[] {
    return this.defaultCategories;
  }
}

