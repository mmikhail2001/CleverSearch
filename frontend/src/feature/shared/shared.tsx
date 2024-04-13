import React, { FC, useState } from 'react';
import { Input } from '@entities/input/input';
import { Button } from '@entities/button/button'
import { useGetShareUrlMutation } from '@api/filesApi';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { AccessRights } from '@models/searchParams';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import './shared.scss'
import { Typography } from '@mui/material';
import {Option} from '@models/additional'

interface SharedProps {
    dirPath: string,
    className: string;
}

const getValFromOption = (newVal: string[]): string => {
    if ('length' in newVal) {
        return newVal.map((val) => val).join('');
    }
    if (newVal) return newVal;
    return 'reader';
}

const getOptionFromVal = (val: string): Option => {
    switch(val) {
        case 'writer':
            return  { label: 'Редактор', value: 'writer' } as Option
        case 'reader':
            return { label: 'Читатель', value: 'reader' } as Option
        default:
            return { label: 'Редактор', value: 'writer' } as Option
    }
}

const useCopyState = (): [boolean, () => void] => {
    const [isCopied, setCopied] = useState(false)

    return [isCopied, (): void => {
        setTimeout(() => setCopied(false), 200)
        setCopied(true)
    }]
}

export const Shared: FC<SharedProps> = ({
    dirPath,
    className,
}) => {
    const [currentEmail, setCurrentEmail] = useState<string>('')
    const [emails, setEmail] = useState([] as string[])
    const [accessType, setAccessType] = useState<AccessRights>('writer' as AccessRights)
    const [share, resp] = useGetShareUrlMutation()
    const [isCopied, setCopied] = useCopyState()

    return (
        <div className={['shared-modal', className].join(' ')} >
            <Input
                fontSize='var(--ft-body)'
                disabled={resp.isSuccess}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key.toLowerCase() === 'enter') {
                        setEmail([...emails, currentEmail])
                        setCurrentEmail('')
                    }
                }}
                placeholder={'Почты для доступа'}
                type={'email'}
                value={currentEmail}
            ></Input>
            <div style={{ width: '100%' }}>
                {emails?.length > 0
                    ?
                    <>
                        <Typography fontSize={'var(--ft-body)'}>Доступ дан:</Typography>
                        <TextareaAutosize
                            style={{
                                background: 'var(--main-color-50)',
                                outlineStyle: 'none',
                                fontSize: 'var(--ft-body)',
                                width: '100%',
                            }}
                            disabled
                            maxRows={3}
                            aria-label="maximum height"
                            value={emails.join('\n')}
                        />
                    </>
                    : null
                }
            </div>
            {resp.data ? <div>
                <p>Ссылка:</p>
                <p onClick={() => {
                    setCopied()
                    navigator.clipboard
                        .writeText(`${process.env.protocol}://${process.env.adress}` +
                            resp.data.body.share_link)
                }}>
                    {resp.data.body.share_link}
                </p>
                {isCopied ? <div style={{ position: 'absolute' }}>Copied!</div> : null}
            </div>
                : null}
            <SelectorMulti
                fontSize='var(--ft-body)'
                isMulti={false}
                options={[
                    { label: 'Редактор', value: 'writer' },
                    { label: 'Читатель', value: 'reader' }
                ]}
                defaultValue={[getOptionFromVal(accessType)]}
                onChange={(newValue: string[]) => {
                    switch (getValFromOption(newValue)) {
                        case 'writer':
                            setAccessType('writer');
                            break;
                        default:
                            setAccessType('reader');
                    }
                }
                }
            />
            <Button
                fontSize='var(--ft-body)'
                buttonText='Поделиться'
                variant={'contained'}
                disabled={resp.isLoading}
                clickHandler={(event) => {
                    event.stopPropagation();
                    share({
                        access_type: accessType,
                        by_emails: emails.length > 0 ? true : false,
                        dir: dirPath,
                        emails: emails,
                    })
                }}
            />

        </div >
    );
};
