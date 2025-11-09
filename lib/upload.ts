import { IncomingMessage } from 'http';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export interface UploadedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

export const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Asegurar que el directorio de uploads existe
export async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

export async function parseForm(req: IncomingMessage): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
}> {
  await ensureUploadDir();

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
    filename: (name, ext, part) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      return `${uniqueSuffix}${ext}`;
    },
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export function getPublicUrl(filepath: string): string {
  const filename = path.basename(filepath);
  return `/uploads/${filename}`;
}

export async function deleteFile(filepath: string): Promise<void> {
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
  }
}
