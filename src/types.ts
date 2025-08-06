export interface UserStatusUpdateCommand {
	id: number;
	status: 'pending' | 'active' | 'blocked';
}
