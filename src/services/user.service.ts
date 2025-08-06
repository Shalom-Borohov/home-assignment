import { prisma } from '../lib/prisma';

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
