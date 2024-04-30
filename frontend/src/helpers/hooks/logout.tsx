import { useLogoutMutation } from '@api/userApi';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '@store/userAuth'

export const useLogout = (): () => void => {
    const [logout] = useLogoutMutation()
    const dispatch = useDispatch()
    return () => {
        logout(null); dispatch(logoutAction());
        return
    }
}