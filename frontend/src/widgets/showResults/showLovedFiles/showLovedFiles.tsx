import { useShowMutation } from '@api/searchApi';
import { useAppSelector } from '@store/store';
import React, { FC, useEffect } from 'react';
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

    return (
        <div className="data-show">
            <RenderFields
                data={respLoved.data?.body}
                error={respLoved.error}
                isError={respLoved.isError}
                isLoading={respLoved.isLoading}
                dispatch={dispatch}
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
