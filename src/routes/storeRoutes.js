import express from 'express';
import { getStoreInfo, updateStoreInfo, getDashboardStats, getStoreTeam, updateMemberRole, removeTeamMember, getStoreAnalytics } from '../controllers/storeController.js';

const router = express.Router();

router.get('/', getStoreInfo);
router.get('/stats', getDashboardStats);
router.patch('/', updateStoreInfo);
router.get('/team', getStoreTeam);
router.patch('/team/:userId/role', updateMemberRole);
router.delete('/team/:userId', removeTeamMember);
router.get('/analytics', getStoreAnalytics);

export default router;
