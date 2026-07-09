import { Router } from 'express';
import { MediaStorage, Provider } from '../../../models/index.js';
import { apiGateway } from '../../../middleware/gateway.js';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();
router.use(apiGateway);

router.get('/info/:id', async (req, res) => {
  try {
    const media = await MediaStorage.findOne({ _id: req.params.id, userId: (req as any).user?.userId });
    if (!media) throw new Error('Media not found');
    res.success(media);
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const media = await MediaStorage.findOne({ _id: req.params.id, userId: (req as any).user?.userId });
    if (!media) throw new Error('Media not found');
    
    // Attempt delete from provider if it's Cloudinary
    if (media.provider.toLowerCase().includes('cloudinary') && media.publicId) {
        const provider = await Provider.findOne({ name: 'Cloudinary', enabled: true });
        if (provider) {
            cloudinary.config({
              cloud_name: provider.credentials.cloudName,
              api_key: provider.credentials.apiKey,
              api_secret: provider.credentials.apiSecret
            });
            await cloudinary.uploader.destroy(media.publicId);
        }
    }
    
    await MediaStorage.deleteOne({ _id: req.params.id });
    res.success({ deleted: true });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.post('/transform/:id', async (req, res) => {
    try {
        const { width, height, crop } = req.body;
        const media = await MediaStorage.findOne({ _id: req.params.id, userId: (req as any).user?.userId });
        if (!media) throw new Error('Media not found');
        
        if (!media.provider.toLowerCase().includes('cloudinary')) {
            throw new Error('Transformation only supported for Cloudinary media');
        }
        
        // This is a naive implementation; in reality, we'd use the Cloudinary URL builder or publicId
        const transformedUrl = media.url.replace('/upload/', `/upload/w_${width || 'auto'},h_${height || 'auto'},c_${crop || 'scale'}/`);
        
        res.success({ url: transformedUrl });
    } catch(err: any) {
        res.error(500, err.message);
    }
});

export default router;
