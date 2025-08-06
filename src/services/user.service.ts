import { prisma } from '../lib/prisma';
import { UserStatusUpdateCommand } from '../types';
import { deleteUserFromGroup } from '../utils';

export const getUsers = async (limit: number, offset: number) => {
	const users = await prisma.user.findMany({
		skip: offset,
		take: limit,
		include: {
			groups: {
				include: { group: true },
			},
		},
	});

	const total = await prisma.user.count();

	return {
		users: users.map((user) => ({
			...user,
			groups: user.groups.map(({ group }) => group),
		})),
		total,
	};
};

export const removeUserFromGroup = async (userId: number, groupId: number) => {
	return await prisma.$transaction(async (transaction) => {
		await deleteUserFromGroup(userId, groupId, transaction);

		const remaining = await transaction.userGroup.count({ where: { group_id: groupId } });

		if (remaining === 0) {
			await transaction.group.update({
				where: { id: groupId },
				data: { status: 'empty' },
			});
		}

		return { removed: true, updatedGroup: remaining === 0 };
	});
};

export const updateUserStatuses = async (updates: UserStatusUpdateCommand[]) => {
	const maxUpdates = 500;
	if (updates.length > maxUpdates) {
		throw new Error(`Too many updates at once. Limit is ${maxUpdates}.`);
	}

	return await prisma.$transaction(
		updates.map((update) =>
			prisma.user.update({
				where: { id: update.id },
				data: { status: update.status },
			})
		)
	);
};
