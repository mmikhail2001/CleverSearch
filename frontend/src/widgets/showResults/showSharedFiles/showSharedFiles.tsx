import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';
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
import { useShowParams } from '@helpers/hooks/useShowParams';

interface ShowSharedFilesProps { }


export const ShowSharedFiles: FC<ShowSharedFilesProps> = () => {
	const [showShared, { data, ...searchResp }] = useShowSharedMutation({ fixedCacheKey: 'shared' });
	const dispatch = useDispatch();

	const showReq = useAppSelector(state => state.showRequest)
	const { isShared } = useAppSelector(state => state.whatToShow)
	
	const {isOpen} = useAppSelector(state => state.searchFilter)

	const [valueToShow, setvalueToShow] = useState(data?.body);

	const navigate = useNavigate()

	useEffect(() => {
		setvalueToShow(data?.body)
	}, [data?.body])

	useEffect(() => {
		dispatch(switchToShared())
	}, [])

	useEffect(() => {
		showShared({ ...showReq})
	}, [showReq, isShared])

	if (!isShared) {
		dispatch(switchToShared())
	}

	if (valueToShow && !('length' in valueToShow)) {
		setvalueToShow([valueToShow])
	}

	const mainElement = useRef<HTMLDivElement>(null)
    const headerElement = useRef<HTMLDivElement>(null)
	const [heightToSet, setheightToSet] = useState('100%')
	
	useEffect(() => {
			if (mainElement.current && 
				headerElement.current 
			) {
				setheightToSet(`calc(${String(
					mainElement.current.clientHeight - headerElement.current.clientHeight
				)}px - 4.8rem)`)
			}
	
		},[mainElement.current, headerElement.current])

	return (
		<div className="data-show" ref={mainElement} style={{filter: isOpen ? 'blur(5px)' : ''}}>
			<div className="data-show__header" ref={headerElement}>
				<BreadCrumps
					dirs={['Shared', ...showReq.dir]}
					onClick={() => {
						if (showReq.dir.length !== 0) {
							dispatch(newValues({...showReq, dir: showReq.dir.slice(0, -1), disk: 'all'}))
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
				height={heightToSet}
				data={valueToShow}
				error={searchResp.error}
				isError={searchResp.isError}
				isLoading={searchResp.isLoading}
				deleteFile={() => { }}
				openFolder={(path, disk) => {
					const pathWithValues = path.filter(val => val !== '')

					dispatch(newValues({...showReq, dir: pathWithValues, disk: disk}))
					if (!isShared) {
						dispatch(switchToShared());
					}
					const url = transfromToSharedRequestParams({ ...showReq, dir: pathWithValues, disk: disk });

					navigate(`/shared${url}`)
				}}
			/>
		</div>
	);
};
