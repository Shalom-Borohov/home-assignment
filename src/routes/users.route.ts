import { Router, Request, Response } from 'express';
import { getUsers } from '../services/user.service';
import { INTERNAL_SERVER_ERROR } from '../statusCodes';

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

export default router;
