import { prisma } from '../lib/prisma';
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
				data: { status: 'Empty' },
			});
		}

		return { removed: true, updatedGroup: remaining === 0 };
	});
};
