import React, { FC, useState } from 'react';
import './userProfile.scss';
import { DropDown } from '@entities/dropDown/dropDown';
import { useDispatch } from 'react-redux';
import { useLazyProfileQuery } from '@api/userApi'
import { setUserEmail } from '@store/userAuth';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { useLogout } from '@helpers/hooks/logout';

interface UserProfileProps {
	email: string;
	isDropdownExist?: boolean;
}

export const UserProfile: FC<UserProfileProps> = ({
	email,
	isDropdownExist,
}): React.ReactNode => {
	const [isOpenProfile, setOpen] = useState(false)
	const dispatch = useDispatch()
	const logout = useLogout()

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
		return (
			<div className='profile'>
				{email}
			</div>
		)
	}

	const renderDropDown = (): React.ReactNode => {
		return (<DropDown
			mainElement={profileMain()}
			children={[<div onClick={logout}>Logout</div>]}
		>
		</DropDown >)
	}

	const isShowDropDown = isNullOrUndefined(isDropdownExist) || isDropdownExist
	return (
		<>
			{isShowDropDown ? renderDropDown() : profileMain()}
		</>
	)
};
