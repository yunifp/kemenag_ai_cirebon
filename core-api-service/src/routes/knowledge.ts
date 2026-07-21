import { Router } from 'express';
import multer from 'multer';
import { getDocuments, uploadDocument, uploadManualText, deleteDocument } from '../controllers/knowledgeController';

// Use memory storage so we can pass the buffer directly to pdf-parse and pinecone
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.get('/', getDocuments);
router.post('/upload', upload.single('file') as any, uploadDocument);
router.post('/manual', uploadManualText);
router.delete('/:id', deleteDocument);

export default router;
