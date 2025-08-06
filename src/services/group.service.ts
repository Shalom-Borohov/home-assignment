import { prisma } from '../lib/prisma';

export const getGroups = async (limit: number, offset: number) => {
	const groups = await prisma.group.findMany({
		skip: offset,
		take: limit,
		include: {
			users: {
				include: { user: true },
			},
		},
	});

	const total = await prisma.group.count();

	return {
		groups: groups.map((group) => ({
			...group,
			users: group.users.map(({ user }) => user),
		})),
		total,
	};
};
