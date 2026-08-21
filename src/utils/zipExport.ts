import JSZip from 'jszip';
import { SpaceProject } from '../types';

export async function exportSpaceAsZip(project: SpaceProject): Promise<void> {
  const zip = new JSZip();

  // Add all files
  for (const file of project.files) {
    zip.file(file.path, file.content);
  }

  // Generate zip file
  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `${project.metadata.title.toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'huggingface-space'}.zip`;

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
