import { Router, Request, Response } from 'express';
import { getUsers, removeUserFromGroup, updateUserStatuses } from '../services/user.service';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from '../statusCodes';
import { validateUserStatuses } from '../utils';
import { UserStatusUpdateCommand } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
	const defaultLimit = 10;
	const defaultOffset = 0;
	const limit = parseInt(req.query.limit as string) || defaultLimit;
	const offset = parseInt(req.query.offset as string) || defaultOffset;

	try {
		const { users, total } = await getUsers(limit, offset);

		res.json({
			data: users,
			pagination: { total, limit, offset },
		});
	} catch (error) {
		console.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch users' });
	}
});

router.delete('/:userId/groups/:groupId', async (req: Request, res: Response) => {
	const userId = parseInt(req.params.userId);
	const groupId = parseInt(req.params.groupId);

	if (isNaN(userId) || isNaN(groupId)) {
		return res.status(BAD_REQUEST).json({ error: 'Invalid userId or groupId' });
	}

	try {
		const result = await removeUserFromGroup(userId, groupId);

		res.json({ message: 'User removed from group', groupStatusUpdated: result.updatedGroup });
	} catch (error: any) {
		console.error(error);

		if (error.code === 'P2025') {
			return res.status(NOT_FOUND).json({ error: 'User not found in group' });
		}

		res.status(INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
	}
});

router.put('/statuses', async (req: Request, res: Response) => {
	const updates = req.body as { id: number; status: string }[];

	validateUserStatuses(updates, res);

	try {
		const result = await updateUserStatuses(updates as UserStatusUpdateCommand[]);

		res.json({
			updated: result.length,
			userIds: result.map(({ id }) => id),
		});
	} catch (error: any) {
		console.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to update users' });
	}
});

export default router;
