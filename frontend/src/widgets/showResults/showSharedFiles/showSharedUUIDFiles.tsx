import { useAppSelector } from '@store/store';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {useGetShareFolderUUIDMutation, useShowSharedByIDMutation } from '@api/searchApi';
import { switchToShared } from '@store/whatToShow';
import { useNavigate, useParams } from 'react-router-dom';

interface ShowSharedUUIDFilesProps { }

export const ShowSharedUUIDFiles: FC<ShowSharedUUIDFilesProps> = () => {
	const [getFilesOfUUIDFolder, { data, ...searchRespUUID }] = useShowSharedByIDMutation({ fixedCacheKey: 'share' });

	const dispatch = useDispatch();
	const { isShared } = useAppSelector(state => state.whatToShow)

	const {isOpen} = useAppSelector(state => state.searchFilter)

	const navigate = useNavigate()
	const { diruuid } = useParams()
	
	const [requestShareFolder] = useGetShareFolderUUIDMutation()

	useEffect(() => {
		requestShareFolder(diruuid).then(() => {
			dispatch(switchToShared())
			getFilesOfUUIDFolder(String(diruuid))
		})
	},[])

	if (!isShared) {
		dispatch(switchToShared())
	}

	useEffect(() => {
		if (searchRespUUID.isSuccess) {
			navigate(
				`/shared?dir=${data.body.path}`
			)
		}
	})

	return (
		<div className="data-show" style={{filter: isOpen ? 'blur(5px)' : ''}}>
			<div className="data-show__header">
			</div>
		</div>
	);
};
