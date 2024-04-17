import React, { FC, useState } from 'react';
import { Input } from '@entities/input/input';
import { Button } from '@entities/button/button'
import { useGetShareUrlMutation } from '@api/filesApi';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { AccessRights } from '@models/searchParams';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import { Typography } from '@mui/material';
import {Option} from '@models/additional'

import CloseIcon from '@mui/icons-material/Close';

import './shared.scss'

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

    const generatedLinkField = (setCopied: () => void, navigator: Navigator, link:string): React.ReactNode => {
        return (
            <div>
                <p>Ссылка:</p>
                <p onClick={() => {
                    setCopied()
                    navigator.clipboard
                        .writeText(`${process.env.protocol}://${process.env.adress}` +
                        link)
                }}>
                    {link}
                </p>
                {isCopied ? <div style={{ position: 'absolute' }}>Ссылка скопирована в ваш буфер!</div> : null}
            </div>)
    }

    let accessShowOut = ''

    if (resp.isSuccess ) {
        accessShowOut = accessType === 'writer' ? 'Редактор' : 'Читатель'
    }

    return (
        <div className={['shared-modal', className].join(' ')} >
            {
            resp.isSuccess 
            ? null 
            : 
            <Input
                disabled={false}
                fontSize='var(--ft-body)'
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
            }
           
            <div style={{ width: '100%' }}>
                {emails?.length > 0
                    ?
                    <>
                        {accessShowOut === '' 
                        ? null
                        : <Typography fontSize={'var(--ft-body)'}>
                            Роль выдана: {accessShowOut}
                            </Typography>
                        }
                        <Typography fontSize={'var(--ft-body)'}>
                            Доступ дан:
                        </Typography>
                        <List 
                            marker={'disc'}
                            style={{
                                maxHeight: 'calc(3 * calc(var(--ft-body) + 0.2rem))',
                                overflowY: 'auto',
                            }}
                        >
                            {emails.map(val => (
                                <ListItem 
                                    sx={{
                                        fontSize: 'var(--ft-body)',
                                        width: '100%',
                                    }}
                                >
                                    <div style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        {val}
                                        {resp.isSuccess 
                                        ? null 
                                        :
                                        <CloseIcon 
                                            onClick={() => {
                                                if (resp.isSuccess) return
                                                setEmail(emails.filter(emailVal => emailVal !== val))
                                            }}
                                        />
                                        }
                                    </div>
                                </ListItem>
                            ))}
                        </List>
                    </>
                    : null
                }
            </div>
            {resp.data 
                ? generatedLinkField(setCopied, navigator, resp.data.body.share_link)
                : null
            }
            {
            resp.isSuccess
            ? null
            :
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
            }
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
