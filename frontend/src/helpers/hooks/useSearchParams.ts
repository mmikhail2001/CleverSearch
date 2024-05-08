import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { diskTypes } from '@models/disk';
import { fileTypes } from '@models/searchParams';
import { ConnectedClouds } from '@models/user';
import { useEffect } from 'react';
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';
import { newSearchValues } from '@store/searchRequest';
import { useParamsFromURL } from './useParamsFromURL';
import { transformToSearchParams } from '@models/getParams';
import { compareArrays } from './useShowParams';

export interface searchStateValue {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string[];
}

export const useSearchParams = () => {
    const searchParams = useAppSelector(state => state.searchRequest)
    
    const searchState = {} as {
        smartSearch: boolean;
        fileType: fileTypes[];
        query: string;
        dir: string[];
        disk: diskTypes[] | ConnectedClouds[];
    }

    const urlParams = useParamsFromURL()
    const params = transformToSearchParams(urlParams)

    const dispatch = useDispatch()

    let settedDir: string[];
    if (params.dir.length === 0) {
        settedDir = []
    } else {
        settedDir = params.dir
    }

    searchState.dir = settedDir
    searchState.fileType = params.fileType
    searchState.query = params.query
    searchState.smartSearch = params.smartSearch

    useEffect(() => {
        if (
            searchParams.query !== searchState.query
            || !compareArrays(searchParams.dir, searchState.dir)
            || !compareArrays(searchParams.fileType, searchState.fileType)
            || searchParams.smartSearch !== searchState.smartSearch
        ) {
            dispatch(newSearchValues({
                query: searchState.query,
                smartSearch: searchState.smartSearch,
                dir: searchState.dir,
                fileType: params.fileType,
            }))    
        }
        
    }, [])

    return { searchState }
}