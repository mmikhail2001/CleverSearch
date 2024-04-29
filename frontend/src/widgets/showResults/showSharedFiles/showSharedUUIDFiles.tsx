import { useAppSelector } from '@store/store';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useShowSharedByIDMutation } from '@api/searchApi';
import { transfromToSharedRequestParams } from '@api/transforms';
import { switchToShared } from '@store/whatToShow';
import { useNavigate, useParams } from 'react-router-dom';

interface ShowSharedUUIDFilesProps { }

export const ShowSharedUUIDFiles: FC<ShowSharedUUIDFilesProps> = () => {
	const [shareByUUID, { data, ...searchRespUUID }] = useShowSharedByIDMutation({ fixedCacheKey: 'share' });

	const dispatch = useDispatch();
	const { isShared } = useAppSelector(state => state.whatToShow)

	const {isOpen} = useAppSelector(state => state.searchFilter)

	const navigate = useNavigate()
	const { diruuid } = useParams()

	useEffect(() => {
		dispatch(switchToShared())
		shareByUUID(String(diruuid))
	}, [])

	if (!isShared) {
		dispatch(switchToShared())
	}

	useEffect(() => {
		if (searchRespUUID.isSuccess) {
			navigate(
				`/shared/${transfromToSharedRequestParams(
					{
						limit: 10,
						offset: 0,
						disk: 'all',
						dir: data.body.path.split('/')
					})}`)
		}
	})

	return (
		<div className="data-show" style={{filter: isOpen ? 'blur(5px)' : ''}}>
			<div className="data-show__header">
			</div>
		</div>
	);
};
