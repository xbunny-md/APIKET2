import { Router } from 'express';
import authRouter from './routes/auth/index.js';
import adminRouter from './routes/admin/index.js';
import systemRouter from './routes/system/index.js';
import apikeysRouter from './routes/apikeys/index.js';
import catalogRouter from './routes/catalog/index.js';
import analyticsRouter from './routes/analytics/index.js';
import projectsRouter from './routes/projects/index.js';

import tiktokRouter from './routes/media/tiktok.js';
import youtubeRouter from './routes/media/youtube.js';
import animeRouter from './routes/media/anime.js';
import stickersRouter from './routes/media/stickers.js';
import memesRouter from './routes/media/memes.js';
import imagesRouter from './routes/media/images.js';
import mediaMgmtRouter from './routes/media/management.js';

import googleRouter from './routes/google/index.js';
import uploadRouter from './routes/upload/index.js';
import storageRouter from './routes/storage/index.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/system', systemRouter);
router.use('/apikeys', apikeysRouter);
router.use('/catalog', catalogRouter);
router.use('/analytics', analyticsRouter);
router.use('/projects', projectsRouter);

// Media Endpoints
router.use('/tiktok', tiktokRouter);
router.use('/youtube', youtubeRouter);
router.use('/anime', animeRouter);
router.use('/stickers', stickersRouter);
router.use('/memes', memesRouter);
router.use('/images', imagesRouter);
router.use('/media', mediaMgmtRouter);

// New Services
router.use('/google', googleRouter);
router.use('/upload', uploadRouter);
router.use('/storage', storageRouter);

export default router;
