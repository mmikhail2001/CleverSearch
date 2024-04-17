import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useShowSharedMutation } from '@api/searchApi';
import { transfromToSharedRequestParams, transfromToShowRequestString } from '@api/transforms';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { transformToShowParams } from '@models/searchParams';
import { switchToShared } from '@store/whatToShow';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { useLocation, useNavigate } from 'react-router-dom';
import '../show.scss';
import { useParamsFromURL } from '@helpers/hooks/useParamsFromURL';
import { changeDir, newValues } from '@store/showRequest';

interface ShowSharedFilesProps { }


export const ShowSharedFiles: FC<ShowSharedFilesProps> = () => {
	const [showShared, { data, ...searchResp }] = useShowSharedMutation({ fixedCacheKey: 'share' });
	const dispatch = useDispatch();

	const location = useLocation()
	const { isShared } = useAppSelector(state => state.whatToShow)
	const showReq = useAppSelector(state => state.showRequest)
	const [valueToShow, setvalueToShow] = useState(data?.body);

	const navigate = useNavigate()
	const urlParams = useParamsFromURL()
	const [params] = useState(transformToShowParams(urlParams))

	// TODO remove when do useShowParams
	useEffect(() => {
		dispatch(newValues({...showReq, dir: params.dir, disk: params.disk}))
	}, [])

	useEffect(() => {
		setvalueToShow(data?.body)
	}, [data?.body])

	useEffect(() => {
		dispatch(switchToShared())
		showShared({ limit: 10, offset: 0, disk: showReq.disk, dir: showReq.dir })
	}, [])

	useEffect(() => {
		showShared({ limit: 10, offset: 0, disk: showReq.disk, dir: showReq.dir })
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
					dirs={['Shared', ...showReq.dir]}
					onClick={() => {
						if (showReq.dir.length !== 0) {
							dispatch(newValues({...showReq, dir: showReq.dir.slice(0, -1)}))
							navigate(-1)

							return
						}
					}}
					reactOnElements={
						['Shared', ...showReq.dir].map((dir, index) => {
                            return () => {
                                let dirToSet: string[] = []
                                if (index !== 0) 
                                    dirToSet = showReq.dir.slice(0, index)
                                const url = transfromToSharedRequestParams(
                                    {
                                        ...showReq,
                                        dir: dirToSet,
                                    }
                                )
                                dispatch(changeDir(dirToSet))
                                navigate(url, { replace: true })
                            }
                        })
					}
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

					dispatch(newValues({...showReq, dir: pathWithValues, disk: 'all'}))
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
