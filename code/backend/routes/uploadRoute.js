import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { processCandidateFromRawText } from '../services/processCandidate.js';

const router = Router();
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    const isPdf =
      file?.mimetype === 'application/pdf' ||
      String(file?.originalname || '').toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      const error = new Error('Seuls les fichiers PDF sont acceptés.');
      error.code = 'INVALID_FILE_TYPE';
      callback(error);
      return;
    }

    callback(null, true);
  },
});

router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, error => {
    if (error) {
      return handleUploadError(error, res);
    }
    return next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier PDF reçu.' });
  }

  try {
    const pdf = await pdfParse(req.file.buffer);
    const rawText = typeof pdf.text === 'string' ? pdf.text.trim() : '';

    if (!rawText) {
      return res.status(400).json({ error: 'PDF illisible ou vide.' });
    }

    const candidate = await processCandidateFromRawText(rawText);
    return res.status(201).json(candidate);
  } catch (error) {
    console.error('PDF upload error:', error.message);
    return res.status(400).json({ error: 'PDF illisible ou non exploitable.' });
  }
});

export default router;

function handleUploadError(error, res) {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Le fichier dépasse la taille maximale de 2 Mo.' });
  }

  if (error?.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: error.message });
  }

  return res.status(400).json({ error: 'Impossible de téléverser ce fichier PDF.' });
}
