import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { enqueueSnackbar } from 'notistack';


interface NotificationBarProps {
    children: React.ReactNode | string,
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info',
}

export const notificationBar: (params: NotificationBarProps) => void = ({
    children,
    variant,
}) => {
    if (isNullOrUndefined(variant)) variant = 'default'
    enqueueSnackbar(children, {variant: variant, style: {fontSize: 'var(--ft-body)'}})
};
