import { Router } from 'express';
import { ApiCatalog, ApiDocumentation, Favorite } from '../../../models/index.js';
import { authenticateToken } from '../../../middleware/auth.js';

const router = Router();

// Get all APIs in catalog
router.get('/', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { category, search } = req.query;
    let query: any = { status: { $ne: 'deprecated' } };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const apis = await ApiCatalog.find(query).sort({ popularity: -1 });
    res.success(apis);
  } catch (error) {
    next(error);
  }
});

// Get API details and docs
router.get('/:id', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const api = await ApiCatalog.findById(req.params.id);
    if (!api) return res.error(404, 'API not found');
    
    const docs = await ApiDocumentation.findOne({ apiId: api._id });
    
    res.success({ api, docs });
  } catch (error) {
    next(error);
  }
});

// Toggle Favorite
router.post('/:id/favorite', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const apiId = req.params.id;
    const userId = req.user.userId;
    
    const existing = await Favorite.findOne({ userId, apiId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.success({ isFavorite: false });
    } else {
      await Favorite.create({ userId, apiId });
      return res.success({ isFavorite: true });
    }
  } catch (error) {
    next(error);
  }
});

// Get Favorites
router.get('/user/favorites', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.userId }).populate('apiId');
    const apis = favorites.map((f: any) => f.apiId).filter(Boolean);
    res.success(apis);
  } catch (error) {
    next(error);
  }
});

export default router;
