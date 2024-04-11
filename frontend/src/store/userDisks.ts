import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ConnectedClouds } from '@models/user';
import { diskTypes } from '@models/disk';
import { selectClasses } from '@mui/material';

export interface disksStore {
    clouds: ConnectedClouds[],
    selectedClouds: ConnectedClouds[]
}

const userDiskSlice = createSlice({
    name: 'whatToShow',
    initialState: {
        clouds: [],
        selectedClouds: [],
    } as disksStore,
    reducers: {
        addDisk(state, action: PayloadAction<ConnectedClouds>) {
            const val = action.payload

            if (state.clouds.find(cloudVal =>
                cloudVal.cloud_email === val.cloud_email
                && cloudVal.disk === val.disk)
            )
                return { ...state }

            return {
                ...state,
                clouds: [...state.clouds, val],
            };
        },
        removeDisk(state, action: PayloadAction<ConnectedClouds>) {
            const val = action.payload

            const resultClouds: ConnectedClouds[] = state.clouds.map(
                stateVal =>
                    stateVal.cloud_email === val.cloud_email
                        && stateVal.disk === val.disk
                        ? null
                        : stateVal
            )
            return {
                selectedClouds: state.selectedClouds,
                clouds: [...resultClouds],
            }
        },
        selectCloud(state, action: PayloadAction<ConnectedClouds>) {
            return {
                clouds: state.clouds,
                selectedClouds: [action.payload]
            }
        },
        unselectCloud(state, action: PayloadAction<{
            disk: diskTypes,
            email: string,
        }>) {
            return {
                clouds: state.clouds,
                selectedClouds: state.selectedClouds
                    .filter(
                        val =>
                            !(val.cloud_email === action.payload.email
                                && val.disk === action.payload.disk)
                    )
            }
        },
    },
});

export const { actions, reducer } = userDiskSlice;
export const {
    addDisk,
    removeDisk,
    selectCloud,
    unselectCloud,
} = actions;
