import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation, useGetFavouriteMutation } from '@api/filesApi';
import { switchToLoved, switchToShow } from '@store/whatToShow';
import { ShowGlobal } from '../showGlobal';
import { GetShowNoFilesErrorElement } from '@feature/errorElements';
import { removeAddPermission } from '@store/canAdd';

interface ShowLovedFilesProps { }

export const ShowLovedFiles: FC<ShowLovedFilesProps> = () => {
    const [loved, respLoved] = useGetFavouriteMutation({ fixedCacheKey: 'loved' });

    const { isLoved } = useAppSelector(state => state.whatToShow)
    const dispatch = useDispatch();
    const [deleteFile, respDelete] = useDeleteFileMutation();
    const { isCanBeAdd } = useAppSelector(state => state.addPermission)

    if (!isLoved) {
        dispatch(switchToLoved())
    }

    if (isCanBeAdd) {
        dispatch(removeAddPermission())
    }

    useEffect(() => {
        loved(null);
    }, [respDelete.isSuccess])

    return (
        <ShowGlobal
            errorElement={<GetShowNoFilesErrorElement/>}
            breadCrumbsReactions={() => () => {}}
            dirs={[]}
            firstElementInBreadCrumbs='Loved'
            getValue={() => loved(null)}
            openFolder={() => {}}
            switchToWhatShow={() => dispatch(switchToLoved())}
            whatShow={isLoved}
            data={respLoved.data?.body}
            error={respLoved.error}
            isError={respLoved.isError}
            isLoading={respLoved.isLoading}
        />
    );
};
