import { useShowMutation } from '@api/searchApi';
import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation, useGetFavouriteMutation } from '@api/filesApi';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { transfromToShowRequestString } from '@api/transforms';
import { useNavigate } from 'react-router-dom';
import { switchToLoved, switchToShow } from '@store/whatToShow';
import '../show.scss'
import { changeDir, newValues } from '@store/showRequest';

interface ShowLovedFilesProps { }

export const ShowLovedFiles: FC<ShowLovedFilesProps> = () => {
    const [loved, respLoved] = useGetFavouriteMutation({ fixedCacheKey: 'loved' });

    const {isOpen} = useAppSelector(state => state.searchFilter)

    const { isLoved } = useAppSelector(state => state.whatToShow)
    const dispatch = useDispatch();
    const [deleteFile, respDelete] = useDeleteFileMutation();

    if (!isLoved) {
        dispatch(switchToLoved())
    }
    useEffect(() => {
        loved(null);
    }, [respDelete.isSuccess])

    console.log(respLoved)

    const mainElement = useRef<HTMLDivElement>(null)
	const [heightToSet, setheightToSet] = useState('100%')
	
	useEffect(() => {
			if (mainElement.current) {
				setheightToSet(`calc(${String(
					mainElement.current.clientHeight
				)}px - 4.8rem)`)
			}
	
		},[mainElement.current])


    return (
        <div className="data-show" style={{filter: isOpen ? 'blur(5px)' : ''}}>
            <RenderFields
                height={heightToSet}
                data={respLoved.data?.body}
                error={respLoved.error}
                isError={respLoved.isError}
                isLoading={respLoved.isLoading}
                deleteFile={
                    (fileName: string): void => {
                        deleteFile([fileName]);
                    }
                }
                openFolder={() => {}}
            />
        </div>
    );
};
