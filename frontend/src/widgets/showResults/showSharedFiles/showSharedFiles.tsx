import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { switchToShared } from '@store/whatToShow';
import { changeDir, newValues } from '@store/showRequest';
import { useNavigate } from 'react-router-dom';

import { ShowGlobal } from '../showGlobal';
import { useGetSharedFilesMutation } from '@api/filesApi';
import { getSharedURLFront } from '@helpers/transformsToURL';
import { useSharedParams } from '@helpers/hooks/useShowParams';

interface ShowSharedFilesProps { }


export const ShowSharedFiles: FC<ShowSharedFilesProps> = () => {
	const [showShared, { data, ...searchResp }] = useGetSharedFilesMutation({ fixedCacheKey: 'shared' });
	const dispatch = useDispatch();

	useSharedParams()

	const showReq = useAppSelector(state => state.showRequest)
	const { isShared } = useAppSelector(state => state.whatToShow)
	
	const [valueToShow, setvalueToShow] = useState(data?.body);

	const navigate = useNavigate()

	useEffect(() => {
		setvalueToShow(data?.body)
	}, [data?.body])

	useEffect(() => {
		dispatch(switchToShared())
	}, [])

	useEffect(() => {
		showShared(showReq.dir.join('/'))
	}, [showReq, isShared])

	if (!isShared) {
		dispatch(switchToShared())
	}

	if (valueToShow && !('length' in valueToShow)) {
		setvalueToShow([valueToShow])
	}

	return (
		<ShowGlobal
            getValue={() => showShared(showReq.dir.join('/'))} 
            whatShow={isShared} 
            switchToWhatShow={() => dispatch(switchToShared())} 
            firstElementInBreadCrumbs={'Shared'} 
            dirs={[...showReq.dir]} 
            breadCrumbsReactions={(dir, index) => {
					return () => {
						let dirToSet: string[] = []
						if (index !== 0) 
							dirToSet = showReq.dir.slice(0, index)

						const url = getSharedURLFront(dirToSet)
						dispatch(changeDir(dirToSet))
						navigate(url, { replace: true })
					}
				}
			}				
            openFolder={(path, disk) => {
				const pathWithValues = path.filter(val => val !== '')

				dispatch(newValues({...showReq, dir: pathWithValues, disk: disk}))
				if (!isShared) {
					dispatch(switchToShared());
				}
				const url = getSharedURLFront(pathWithValues);

				navigate(url)
			}}
            data={valueToShow}
			error={searchResp.error}
			isError={searchResp.isError}
			isLoading={searchResp.isLoading}
        />
	);
};
