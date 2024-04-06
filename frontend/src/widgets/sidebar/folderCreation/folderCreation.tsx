import { useCreateDirMutation } from '@api/filesApi';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import { Modal } from '@feature/modal/modal';
import React, { FC, useEffect, useState } from 'react';

interface FolderCreationProps {
	onFolderCreation: () => void,
	dirs: string[]
}


export const FolderCreation: FC<FolderCreationProps> = ({
	onFolderCreation,
	dirs
}) => {
	const [isModalOpen, setisModalOpen] = useState(false);
	const [createDir, resp] = useCreateDirMutation();
	const [nameOfFolder, setNameOfFolder] = useState('');

	useEffect(() => {
		if (resp && resp.isSuccess) {
			onFolderCreation()
			setisModalOpen(false)
		}
	}, [resp])
	return (
		<div>
			<Button
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
				<div>
					<p>Название папки</p>
					{resp.isError ? 'Произошла ошибка' : null}
					<Input
						onChange={(e) => {
							setNameOfFolder(e.target.value)
						}}
						disabled={resp.isLoading}
						placeholder={'Название папки'}
						type={'text'}
						value={nameOfFolder} />
					<Button
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
