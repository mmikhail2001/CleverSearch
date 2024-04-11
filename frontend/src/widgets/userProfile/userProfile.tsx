import React, { FC, useState } from 'react';
import './userProfile.scss';
import { DropDown } from '@entities/dropDown/dropDown';
import { useDispatch } from 'react-redux';
import { useLazyProfileQuery } from '@api/userApi'
import { setUserEmail } from '@store/userAuth';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { useLogout } from '@helpers/hooks/logout';
import { Typography } from '@mui/material';
import { useMobile } from 'src/mobileProvider';
import { useNavigate } from 'react-router-dom';

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
	const { whatDisplay } = useMobile()

	const navigate = useNavigate()

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
			<Typography
				className='profile'
				fontSize={'var(--ft-body)'}
				sx={{ borderRadius: 'var( --big-radius)' }}
			>
				{email}
			</Typography>
		)
	}
	const renderDropDown = (): React.ReactNode => {
		return (<DropDown
			styleOnMain={{ height: '100%', cursor: whatDisplay === 3 ? 'default' : 'pointer' }}
			variants='down-center'
			open={isOpenProfile}
			toggleOpen={setOpen}
			mainElement={profileMain()}
			children={[
				<div onClick={() => navigate('/settings')}>Настройки</div>,
				<div onClick={logout}>Выйти</div>,
			]}
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
