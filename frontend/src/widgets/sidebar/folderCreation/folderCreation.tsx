import { useCreateDirMutation } from '@api/filesApi';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import { Modal } from '@feature/modal/modal';
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

	const isFolderErr = resp.isError && resp.error
		&& 'data' in resp.error
		// @ts-expect-error
		// Check on exist at line up
		&& 'status' in resp.error.data
		&& resp.error.data.status === 3

	return (
		<div className={className}>
			<Button
				isFullSize={true}
				fontSize='var(--ft-body)'
				buttonText="Добавить папку"
				variant={'contained'}
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
						!isFolderErr && resp.isError
							? <Typography
								fontSize={'var(--ft-body)'}
							>
								Произошла ошибка
							</Typography>
							: null
					}
					{
						isFolderErr
							? <Typography
								fontSize={'var(--ft-body)'}
							>
								Папка уже существует!
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
