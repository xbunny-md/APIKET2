import { Router } from 'express';
import { Project, ApiKey } from '../../../models/index.js';
import { authenticateToken } from '../../../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const projects = await Project.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.success(projects);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      userId: req.user.userId,
      name: name || 'New Project',
      description
    });
    res.success(project);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!project) return res.error(404, 'Project not found');
    
    // Unlink API keys
    await ApiKey.updateMany({ projectId: req.params.id }, { $unset: { projectId: 1 } });
    
    res.success({}, 'Project deleted');
  } catch (error) {
    next(error);
  }
});

export default router;
