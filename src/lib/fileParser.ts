// Parses .txt and .md files into TipTap JSON format
// Supported: Headings (#, ##, ###), Paragraphs
// Note: Inline formatting (bold, italic) in .md is not parsed to keep scope tight.

export function parseFileToTipTap(text: string, filename: string): { json: any; title: string } {
  const isMarkdown = filename.endsWith('.md');
  const lines = text.split('\n');
  const content: any[] = [];
  
  // Extract title from first non-empty line
  let title = filename.replace(/\.(txt|md)$/, '');
  const firstLine = lines.find(l => l.trim() !== '');
  if (firstLine) {
    // Remove markdown heading symbols for the title
    title = firstLine.replace(/^#+\s*/, '').substring(0, 100);
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (isMarkdown && line.startsWith('### ')) {
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: line.substring(4) }],
      });
      i++;
    } else if (isMarkdown && line.startsWith('## ')) {
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: line.substring(3) }],
      });
      i++;
    } else if (isMarkdown && line.startsWith('# ')) {
      content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: line.substring(2) }],
      });
      i++;
    } else if (line.trim() === '') {
      i++; // Skip empty lines
    } else {
      // Group consecutive non-empty lines into a single paragraph
      let paragraphText = line;
      i++;
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('# ')) {
        paragraphText += '\n' + lines[i];
        i++;
      }
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: paragraphText }],
      });
    }
  }

  return {
    title,
    json: {
      type: 'doc',
      content: content.length > 0 ? content : [{ type: 'paragraph' }],
    },
  };
}

export const ALLOWED_EXTENSIONS = ['.txt', '.md'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type (${ext}). Please upload .txt or .md files.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File is too large. Maximum size is 5MB.';
  }
  if (file.size === 0) {
    return 'File is empty.';
  }
  return null; // No error
}