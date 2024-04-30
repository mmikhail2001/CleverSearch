import { useCreateDirMutation } from '@api/filesApi';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import { Modal } from '@feature/modal/modal';
import { getErrorMessageFromErroResp } from '@helpers/getErrorMessageFromErroResp';
import { Typography } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';

interface FolderCreationProps {
	onFolderCreation: () => void,
	dirs: string[],
	className?: string,
}


export const FolderCreation: FC<FolderCreationProps> = ({
	onFolderCreation,
	dirs,
	className,
}) => {
	const [isModalOpen, setisModalOpen] = useState(false);
	const [createDir, resp] = useCreateDirMutation();
	const [nameOfFolder, setNameOfFolder] = useState('');
	const [isErrorExist, setError] = useState<boolean>(false)

	useEffect(() => {
		if (resp && resp.isSuccess) {
			onFolderCreation()
			setisModalOpen(false)
		}
		setError(resp.isError)
	}, [resp])

	const errorMessage = getErrorMessageFromErroResp(resp.error)

	return (
		<div className={className}>
			<Button
				isFullSize={true}
				fontSize='var(--ft-body)'
				buttonText="Folder"
				variant={'text'}
				clickHandler={() => {
					setisModalOpen(!isModalOpen)
				}}
			/>
			<Modal
				isOpen={isModalOpen}
				closeModal={() => setisModalOpen(false)}
				className={''} >
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 'var(--big-padding)'
				}}>
					<Typography fontSize={'var(--ft-body)'}>Название папки</Typography>
					{
						resp.isError
						? <Typography
							fontSize={'var(--ft-body)'}
						>
							{errorMessage}
						</Typography>
						: null
					}
					<Input
						isError={isErrorExist}
						style={{ background: isErrorExist ? 'var(--sub-color-100)' : null }}
						fontSize={'var(--ft-body)'}
						onChange={(e) => {
							setNameOfFolder(e.target.value)
						}}
						onKeyDown={() => setError(false)}
						disabled={resp.isLoading}
						placeholder={'Название папки'}
						type={'text'}
						value={nameOfFolder} />
					<Button
						fontSize={'var(--ft-body)'}
						buttonText="Создать"
						variant={'contained'}
						clickHandler={() => {
							createDir(dirs.concat(nameOfFolder))
						}}
					/>
				</div>
			</Modal>
		</div>
	)
};
