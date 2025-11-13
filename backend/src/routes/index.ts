import express from 'express';
import { register, login, changePassword } from '../controllers/authController';
import { getAllUsers, getUser, approveUser, updateUser, deleteUser, createUser, importUsersFromCSV } from '../controllers/userController';
import { createPractice, getAllPractices, getPractice, updatePractice, deletePractice, importPracticesFromText } from '../controllers/practiceController';
import { createParticipation, getParticipationsByPractice, getMyParticipations, deleteParticipation, getParticipationStats } from '../controllers/participationController';
import { createBallBag, getAllBallBags, recordBallBagTakeaway, getBallBagHistory, getBallBagHolders, getBallBagStats, autoAssignBallBagHolders } from '../controllers/ballBagController';
import { recordCourtFee, getCourtFee, getUserCourtFeeStats, getAllUsersCourtFeeStats } from '../controllers/courtFeeController';
import { getAllSettings, getSetting, updateSetting } from '../controllers/settingsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Auth routes (public)
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/change-password', authenticate, changePassword);

// User routes
router.post('/users', authenticate, requireAdmin, createUser);
router.post('/users/import', authenticate, requireAdmin, importUsersFromCSV);
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.get('/users/:id', authenticate, getUser);
router.put('/users/:id/approve', authenticate, requireAdmin, approveUser);
router.put('/users/:id', authenticate, updateUser);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

// Practice routes
router.post('/practices', authenticate, requireAdmin, createPractice);
router.post('/practices/import', authenticate, requireAdmin, importPracticesFromText);
router.get('/practices', authenticate, getAllPractices);
router.get('/practices/:id', authenticate, getPractice);
router.put('/practices/:id', authenticate, requireAdmin, updatePractice);
router.delete('/practices/:id', authenticate, requireAdmin, deletePractice);

// Participation routes
router.post('/participations', authenticate, createParticipation);
router.get('/participations/practice/:practice_id', authenticate, getParticipationsByPractice);
router.get('/participations/my', authenticate, getMyParticipations);
router.get('/participations/stats/:practice_id', authenticate, getParticipationStats);
router.delete('/participations/:id', authenticate, deleteParticipation);

// Ball bag routes
router.post('/ball-bags', authenticate, requireAdmin, createBallBag);
router.get('/ball-bags', authenticate, getAllBallBags);
router.post('/ball-bags/takeaway', authenticate, requireAdmin, recordBallBagTakeaway);
router.post('/ball-bags/auto-assign', authenticate, requireAdmin, autoAssignBallBagHolders);
router.get('/ball-bags/:ball_bag_id/history', authenticate, getBallBagHistory);
router.get('/ball-bags/holders/:practice_id', authenticate, getBallBagHolders);
router.get('/ball-bags/stats', authenticate, getBallBagStats);

// Court fee routes
router.post('/court-fees', authenticate, requireAdmin, recordCourtFee);
router.get('/court-fees/practice/:practice_id', authenticate, getCourtFee);
router.get('/court-fees/user/:user_id', authenticate, getUserCourtFeeStats);
router.get('/court-fees/stats', authenticate, getAllUsersCourtFeeStats);

// Settings routes
router.get('/settings', authenticate, getAllSettings);
router.get('/settings/:key', authenticate, getSetting);
router.put('/settings/:key', authenticate, requireAdmin, updateSetting);

export default router;
