import { useCreateDirMutation } from '@api/filesApi';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import { Modal } from '@feature/modal/modal';
import { getErrorMessageFromErroResp } from '@helpers/getErrorMessageFromErroResp';
import { Typography } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';

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
		<div className={className} style={{
				borderTop: '1px solid rgba(0, 0, 0, 0.2)',
				paddingLeft:'1.5rem', 
				paddingBottom: '1rem',
				paddingTop: '0.5rem',
				fontSize: 'var(--ft-paragraph)',
				display: 'grid',
				gridTemplateColumns: "minmax(0, 0.5fr) minmax(0, 3fr) minmax(0, 0.25fr)",
				alignItems:'center',
			}}>
				<FolderRoundedIcon fontSize='inherit' sx={{color:"#DB9713", marginBottom: '3px'}}/>
			<Typography
				sx={{cursor: 'pointer', height: 'fit-content'}}
				fontSize='var(--ft-paragraph)'
				onClick={() => {
					setisModalOpen(!isModalOpen)
				}}
				style={{color:'inherit'}}
			>Folder</Typography>
			<Modal
				isOpen={isModalOpen}
				closeModal={() => setisModalOpen(false)}
				className={''} >
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 'var(--big-padding)',
					color: 'inherit',
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
