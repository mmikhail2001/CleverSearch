import React, { FC, useState } from 'react';
import './userProfile.scss';
import { DropDown } from '@entities/dropDown/dropDown';
import { useLogoutMutation } from '@api/userApi';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '@store/userAuth'
import { useLazyProfileQuery } from '@api/userApi'
import { setUserEmail } from '@store/userAuth';

interface UserProfileProps {
	email: string,
}

export const UserProfile: FC<UserProfileProps> = ({ email }) => {
	const [isOpenProfile, setOpen] = useState(false)
	const [logout] = useLogoutMutation()
	const dispatch = useDispatch()

	const [profile, profileResp] = useLazyProfileQuery()

	if (email === '') {
		if (!profileResp.isSuccess && !profileResp.isLoading && !profileResp.isError) {
			profile(null)
		}

		if (profileResp.data && profileResp.data.email) {
			dispatch(setUserEmail({ email: profileResp.data.email }))
		}
	}

	const profileMain = (): React.ReactNode => {
		return <div className='profile'>
			{email}
		</div>
	}



	return (
		<DropDown
			close={() => setOpen(false)}
			isOpen={isOpenProfile}
			mainElement={profileMain()}
			onClick={() => setOpen(true)}
		>
			<div onClick={() => { logout(null); dispatch(logoutAction()) }}>Logout</div>
		</DropDown>
	);
};
