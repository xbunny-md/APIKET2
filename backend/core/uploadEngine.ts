import { Provider } from '../models/index.js';
import { v2 as cloudinary } from 'cloudinary';
import FormData from 'form-data';

// Helper to configure cloudinary on the fly
const configureCloudinary = (config: any) => {
  if (!config || !config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error('Cloudinary not configured');
  }
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret
  });
};

export class UploadProviderEngine {
  static async uploadImage(buffer: Buffer, originalName: string) {
    const providers = await Provider.find({ category: 'Upload', status: 'healthy', enabled: true }).sort({ priority: 1 });
    let lastError = null;

    for (const provider of providers) {
      try {
        if (provider.name.toLowerCase().includes('cloudinary')) {
          configureCloudinary(provider.credentials);
          return await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
              if (result) {
                resolve({
                  url: result.secure_url,
                  thumbnail: result.secure_url,
                  size: result.bytes,
                  format: result.format,
                  width: result.width,
                  height: result.height,
                  provider: provider.name
                });
              } else {
                reject(error);
              }
            });
            stream.end(buffer);
          });
        }

        // Public provider via FormData (e.g., Freeimage.host, ImgBB)
        if (provider.config?.baseUrl) {
          const form = new FormData();
          form.append('source', buffer, { filename: originalName });
          if (provider.credentials?.apiKey) {
            form.append('key', provider.credentials.apiKey);
          }
          const res = await fetch(provider.config.baseUrl, {
            method: 'POST',
            body: form as any,
          });
          const data = await res.json();
          if (data && data.image && data.image.url) {
             return {
                url: data.image.url,
                thumbnail: data.image.thumb?.url || data.image.url,
                size: data.image.size,
                format: data.image.extension,
                width: data.image.width,
                height: data.image.height,
                provider: provider.name
             };
          }
          if (data && data.data && data.data.url) { // ImgBB format
             return {
                url: data.data.url,
                thumbnail: data.data.thumb?.url || data.data.url,
                size: data.data.size,
                format: data.data.image?.extension || 'unknown',
                width: data.data.width,
                height: data.data.height,
                provider: provider.name
             };
          }
          throw new Error('Invalid response from public provider');
        }
      } catch (err: any) {
        lastError = err;
        provider.failureCount = (provider.failureCount || 0) + 1;
        if (provider.failureCount > (provider.retryCount || 3)) {
          provider.status = 'degraded';
        }
        await provider.save();
      }
    }
    
    throw new Error(`All upload providers failed. Last error: ${lastError?.message}`);
  }

  static async uploadMedia(buffer: Buffer, originalName: string, type: 'video' | 'audio' | 'auto') {
    // Media uses cloudinary primary
    const provider = await Provider.findOne({ name: 'Cloudinary', enabled: true, status: { $ne: 'offline' } });
    if (!provider) throw new Error('Cloudinary provider not found or not enabled');
    
    try {
        configureCloudinary(provider.credentials);
        return await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: type === 'audio' ? 'video' : type as 'video' | 'auto' }, (error, result) => {
              if (result) {
                resolve({
                  url: result.secure_url,
                  duration: result.duration,
                  size: result.bytes,
                  format: result.format,
                  thumbnail: type === 'video' ? result.secure_url.replace(`.${result.format}`, '.jpg') : null,
                  provider: provider.name
                });
              } else {
                reject(error);
              }
            });
            stream.end(buffer);
        });
    } catch(err: any) {
        throw new Error(`Media upload failed: ${err.message}`);
    }
  }
}
