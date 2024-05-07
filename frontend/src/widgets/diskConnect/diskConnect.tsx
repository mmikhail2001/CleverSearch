import { DiskType, diskTypes, isDiskType } from '@models/disk';
import React, { FC, useEffect, useState } from 'react';
import { useDiskLinkConnectMutation } from '@api/diskApi';
import { GetTextWithImg } from '@feature/getTextWithImg/getTextWithImg';
import { notificationBar } from '@helpers/notificationBar';

interface DiskConnectProps {
	disk: DiskType,
    classname?: string,
}

export const DiskConnect: FC<DiskConnectProps> = ({disk, classname}) => {
	const [connect, resp] = useDiskLinkConnectMutation()
	const [diskToConnect, setDiskToConnect] = useState<diskTypes>('internal')

	useEffect(() => {
		if (diskToConnect !== 'internal' && !resp.isLoading) {
			window.location.href = resp.data.redirect;
		}
	}, [resp])

    return <GetTextWithImg
        className={classname}
        selected={false}
        image={disk.src}
        name={disk.diskName}
        altText={disk.altText}
        onClick={(diskName) => {
            if (isDiskType(diskName)) {
                connect(diskName)
                setDiskToConnect(diskName)
            }
        }}
    />
};
