import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useShowSharedMutation } from '@api/searchApi';
import { transfromToSharedRequestParams } from '@api/transforms';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { transformToShowParams } from '@models/searchParams';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { switchToShared } from '@store/whatToShow';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import '../show.scss';
import { useParamsFromURL } from '@helpers/hooks/useParamsFromURL';
import { Typography } from '@mui/material';

interface ShowSharedFilesProps { }


export const ShowSharedFiles: FC<ShowSharedFilesProps> = () => {
	const [showShared, { data, ...searchResp }] = useShowSharedMutation({ fixedCacheKey: 'share' });
	const dispatch = useDispatch();
	const { currentDisk, dirs } = useAppSelector(
		(state) => state.currentDirDisk
	);

	const location = useLocation()
	const { isShared } = useAppSelector(state => state.whatToShow)
	const [valueToShow, setvalueToShow] = useState(data?.body);

	const navigate = useNavigate()
	const urlParams = useParamsFromURL()
	const [params] = useState(transformToShowParams(urlParams))

	useEffect(() => {
		dispatch(changeDir({ dirs: params.dir }))
		dispatch(changeDisk(params.disk))
	}, [])

	useEffect(() => {
		setvalueToShow(data?.body)
	}, [data?.body])

	useEffect(() => {
		dispatch(switchToShared())
		showShared({ limit: 10, offset: 0, disk: currentDisk, dir: dirs })
	}, [])

	useEffect(() => {
		showShared({ limit: 10, offset: 0, disk: currentDisk, dir: dirs })
	}, [location.key, location.hash, location.pathname])

	if (!isShared) {
		dispatch(switchToShared())
	}

	if (valueToShow && !('length' in valueToShow)) {
		setvalueToShow([valueToShow])
	}

	return (
		<div className="data-show" >
			<div className="data-show__header">
				<BreadCrumps
					dirs={['Shared', ...dirs]}
					onClick={() => {
						if (dirs.length !== 0) {
							dispatch(changeDir({ dirs: dirs.slice(0, -1) }))
							navigate(-1)

							return
						}
					}}
					reactOnElements={[]}
				/>
			</div>
			<RenderFields
				data={valueToShow}
				error={searchResp.error}
				isError={searchResp.isError}
				isLoading={searchResp.isLoading}
				dispatch={dispatch}
				deleteFile={() => { }}
				openFolder={(path) => {
					const pathWithValues = path.filter(val => val !== '')

					dispatch(changeDir({ dirs: pathWithValues }))
					dispatch(changeDisk('all'));
					if (!isShared) {
						dispatch(switchToShared());
					}

					const url = transfromToSharedRequestParams({ limit: 10, offset: 0, dir: pathWithValues });
					navigate(`/shared${url}`)
				}}
			/>
		</div>
	);
};
