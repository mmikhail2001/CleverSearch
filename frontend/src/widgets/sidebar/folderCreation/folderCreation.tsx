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
	onClose?: () => void,
}

export const FolderCreation: FC<FolderCreationProps> = ({
	onFolderCreation,
	dirs,
	className,
	onClose,
}) => {
	const [isModalOpen, setisModalOpen] = useState(false);
	const [createDir, resp] = useCreateDirMutation();
	const [nameOfFolder, setNameOfFolder] = useState('');
	const [isErrorExist, setError] = useState<boolean>(false)

	const handleClose = () => {
		setisModalOpen(false)
		onClose()
	}
	
	useEffect(() => {
		if (resp && resp.isSuccess) {
			onFolderCreation()
			setisModalOpen(false)
		}
		setError(resp.isError)
	}, [resp])

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
				closeModal={handleClose}
				className={''} 
				styleOnModal={{
                    background: 'var(--color-dropdowns)',
                    borderRadius:'15px',
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color:'inherit',
                }}
                stylesOnContentBackground={{
                    overflow:'hidden',
                }}
			>
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 'var(--big-padding)',
					color: 'inherit',
				}}>
					<Typography fontSize={'var(--ft-body)'}>Folder name</Typography>
					{
						resp.isError
						? <Typography
							fontSize={'var(--ft-body)'}
							sx={{color:"var(--color-error)"}}
						>
							Folder with this name already exist
						</Typography>
						: null
					}
					<Input
						style={{
							backgroundColor:isErrorExist ? 'var(--sub-color-800)' : null,
						}}
						specificRadius='small-radius'
						specificPaddingInside='small-padding'
						isError={isErrorExist}
						fontSize={'var(--ft-body)'}
						onChange={(e) => {
							setNameOfFolder(e.target.value)
						}}
						onKeyDown={() => setError(false)}
						disabled={resp.isLoading}
						placeholder={'Folder name'}
						type={'text'}
						value={nameOfFolder} />
					<Button
						style={{height: '35px'}}
						fontSize={'var(--ft-body)'}
						buttonText="Create"
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
