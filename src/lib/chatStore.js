import { create } from 'zustand';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,

    changeChat: (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;

        // Ensure both currentUser and user exist before accessing their 'blocked' fields
        if (user?.blocked && currentUser?.id) {
            // Check if current user is blocked by the receiver (user)
            if (user.blocked.includes(currentUser.id)) {
                return set({
                    chatId,
                    user: null,
                    isCurrentUserBlocked: true,
                    isReceiverBlocked: false,
                });
            }
        }

        if (currentUser?.blocked && user?.id) {
            // Check if the receiver (user) is blocked by the current user
            if (currentUser.blocked.includes(user.id)) {
                return set({
                    chatId,
                    user: user,
                    isCurrentUserBlocked: false,
                    isReceiverBlocked: true,
                });
            }
        }

        // If neither user is blocked, set the chat
        set({
            chatId,
            user,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
        });
    },

    changeBlock: () => {
        set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
    },

    changeBlockStatus: (currentUserBlocked, receiverBlocked) => {
        set({
            isCurrentUserBlocked: currentUserBlocked,
            isReceiverBlocked: receiverBlocked,
        });
    },
}));
