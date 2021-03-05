import { callbacks } from '../../../../../app/callbacks/server';
import { settings } from '../../../../../app/settings/server';
import { AutoCloseOnHoldScheduler } from '../lib/AutoCloseOnHoldScheduler';

const DEFAULT_CLOSED_MESSAGE = 'Chat is closed because of inactivity';

let autoCloseOnHoldChatTimeout = 0;
let customCloseMessage = DEFAULT_CLOSED_MESSAGE;

const handleAfterOnHold = async (room: any = {}): Promise<any> => {
	const { _id: rid } = room;
	if (!rid) {
		return;
	}

	if (!autoCloseOnHoldChatTimeout || autoCloseOnHoldChatTimeout <= 0) {
		return;
	}

	await AutoCloseOnHoldScheduler.scheduleRoom(room._id, autoCloseOnHoldChatTimeout, customCloseMessage);
	console.log('-auto close job scheduled');
};

settings.get('Livechat_auto_close_on_hold_chats_timeout', (_, value) => {
	console.log('---setting Livechat_auto_close_on_hold_chats_timeout called', value);
	autoCloseOnHoldChatTimeout = value as number;
	if (!value || value <= 0) {
		callbacks.remove('livechat:afterOnHold', 'livechat-auto-close-on-hold');
	}
	console.log('--adding callback');
	callbacks.add('livechat:afterOnHold', handleAfterOnHold, callbacks.priority.HIGH, 'livechat-auto-close-on-hold');
});

settings.get('Livechat_auto_close_on_hold_chats_custom_message', (_, value) => {
	console.log('---setting Livechat_auto_close_on_hold_chats_custom_message called', value);
	customCloseMessage = value as string || DEFAULT_CLOSED_MESSAGE;
});
