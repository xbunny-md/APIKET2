import { Router } from 'express';
import multer from 'multer';
import { UploadProviderEngine } from '../../../core/uploadEngine.js';
import { MediaStorage } from '../../../models/index.js';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

router.use(apiGateway);

router.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file provided');
    const result: any = await UploadProviderEngine.uploadImage(req.file.buffer, req.file.originalname);
    
    const media = await MediaStorage.create({
      userId: (req as any).user?.userId,
      url: result.url,
      type: 'image',
      provider: result.provider,
      metadata: result
    });
    
    res.success(media);
  } catch (error: any) {
    res.error(500, error.message);
  }
});

router.post('/video', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file provided');
    const result: any = await UploadProviderEngine.uploadMedia(req.file.buffer, req.file.originalname, 'video');
    
    const media = await MediaStorage.create({
      userId: (req as any).user?.userId,
      url: result.url,
      type: 'video',
      provider: result.provider,
      metadata: result
    });
    
    res.success(media);
  } catch (error: any) {
    res.error(500, error.message);
  }
});

router.post('/audio', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file provided');
    const result: any = await UploadProviderEngine.uploadMedia(req.file.buffer, req.file.originalname, 'audio');
    
    const media = await MediaStorage.create({
      userId: (req as any).user?.userId,
      url: result.url,
      type: 'audio',
      provider: result.provider,
      metadata: result
    });
    
    res.success(media);
  } catch (error: any) {
    res.error(500, error.message);
  }
});

router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file provided');
    // Using auto resource type for generic files on Cloudinary
    const result: any = await UploadProviderEngine.uploadMedia(req.file.buffer, req.file.originalname, 'auto');
    
    const media = await MediaStorage.create({
      userId: (req as any).user?.userId,
      url: result.url,
      type: 'file',
      provider: result.provider,
      metadata: result
    });
    
    res.success(media);
  } catch (error: any) {
    res.error(500, error.message);
  }
});

export default router;
