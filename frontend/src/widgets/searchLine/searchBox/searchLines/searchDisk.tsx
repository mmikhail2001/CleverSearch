import React, { FC, useEffect, useState } from 'react';
import { SearchParamsLocal } from '@models/searchParams';
import {
	SelectorWithImg,
} from '@entities/selectors/selectorOptionWIthImg/selectorOptionWithImg';

import { getDisksToOptions, diskVal, diskValueToOption, diskTypes } from '@models/disk'
import { Typography } from '@mui/material';
import { Option } from '@models/additional';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { useAppSelector } from '@store/store';
import { ConnectedClouds } from '@models/user';

export interface SearchDiskLineProps {
	changeState: React.Dispatch<
		React.SetStateAction<SearchParamsLocal>
	>;
	state: SearchParamsLocal;
	fontSize?: string,
}

export const SearchDiskLine: FC<SearchDiskLineProps> = ({
	changeState,
	state,
	fontSize,
}) => {
	const [selectedDisk, setSelectedDisk] = useState<diskTypes[]>(null)
	const [selectedEmail, setSelectedEmail] = useState<string[]>(null)
	const disks = useAppSelector(state => state.disks)

	let defaultValueDisk: diskTypes;
	let defaultValueEmail = ''
	if (state?.disk) {
		if (typeof state.disk[0] === 'string') {
			defaultValueEmail = ''
			defaultValueDisk = state.disk[0]
		} else {
			defaultValueDisk = state.disk[0].disk
			if (state.disk[0].cloud_email) {
				defaultValueEmail = state.disk[0].cloud_email
			} else {
				const emails = disks.clouds.filter(val => val.disk === defaultValueDisk)
				defaultValueEmail = emails.length > 1 ? '' : emails[0].cloud_email
			}
		}
	}else {
		defaultValueDisk = 'all'
	}

	useEffect(()=> {
		if (defaultValueDisk)
			setSelectedDisk([defaultValueDisk])
	},[])

	const emailToOption = (email:string):Option => {
		return {
			label: email,
			value: email,
		}
	}
	return (
		<div className="line">
			<Typography fontSize={'var(--ft-body)'}>Диск</Typography>
			<SelectorWithImg
				fontSize={fontSize}
				options={getDisksToOptions()}
				isMulti={false}
				onChange={
					(newVal) => {
						setSelectedDisk(diskVal(newVal))
					}
				}
				defaultValue={state.disk && selectedDisk === null ? diskValueToOption(defaultValueDisk) : null}
			/>
			<div style={{paddingTop: 'var(--big-padding)'}}>
				{selectedDisk && !selectedDisk.find(val => val === 'all') ? 
				<SelectorMulti
				fontSize={fontSize}
				options={disks.clouds.filter(val => selectedDisk
					.find(diskVal => diskVal === val.disk))
					.map(val => emailToOption(val.cloud_email))
				}
				isMulti={false}
				onChange={
					(newVal) => {
						setSelectedEmail(newVal)
						changeState({...state, disk: disks.clouds.filter(val => val.cloud_email === newVal[0]) as ConnectedClouds[]})
					}
				}
				defaultValue={selectedEmail ? null : [emailToOption(defaultValueEmail)]}
			/>
				: null
			}
			</div>
		</div>
	);
};
