import React, { FC } from 'react';
import { Modal } from '@feature/modal/modal'
import { Shared } from '@feature/shared/shared';
import './sharedModal.scss'

interface SharedModalProps {
	dirPath: string,
	close: () => void,
	isOpen: boolean,
}

export const SharedModal: FC<SharedModalProps> = ({ dirPath, close, isOpen }) => {
	return (
		<Modal
			isFullWidth={false}
			isOpen={isOpen}
			closeModal={close}
			className={'modal-shared'}
			bodyClassName={'modal-body-shared'}
			styleOnBackground={{backgroundColor: 'var(--color-dropdowns)', color:'inherit', borderRadius:'1.5rem'}}
			styleOnModal={{backgroundColor: 'transparent',color:'inherit'}}
		>
			<Shared
				className=''
				dirPath={dirPath}
			></Shared>
		</Modal>
	);
};
