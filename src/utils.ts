import { Prisma, PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { BAD_REQUEST } from './statusCodes';

type Transaction = Omit<
	PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
	'$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export const deleteUserFromGroup = async (
	userId: number,
	groupId: number,
	transaction: Transaction
) =>
	transaction.userGroup.delete({
		where: {
			user_id_group_id: {
				user_id: userId,
				group_id: groupId,
			},
		},
	});

export const validateUserStatuses = (updates: { id: number; status: string }[], res: Response) => {
	if (!Array.isArray(updates)) {
		return res.status(BAD_REQUEST).json({ error: 'Request body must be an array' });
	}

	const validStatuses = ['pending', 'active', 'blocked'];

	for (const update of updates) {
		if (typeof update.id !== 'number' || !validStatuses.includes(update.status)) {
			return res.status(BAD_REQUEST).json({
				error: 'Each update must include a valid user id and status',
			});
		}
	}
};
