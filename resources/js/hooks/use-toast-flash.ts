import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export function useToastFlash() {
    const { flash } = usePage().props as any;

    useEffect(() => {
        const messages = flash as FlashMessages;

        if (messages?.success) {
            toast.success(messages.success);
        }

        if (messages?.error) {
            toast.error(messages.error);
        }

        if (messages?.warning) {
            toast.warning(messages.warning);
        }

        if (messages?.info) {
            toast.info(messages.info);
        }
    }, [flash]);
}