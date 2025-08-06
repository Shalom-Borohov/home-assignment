import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

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
