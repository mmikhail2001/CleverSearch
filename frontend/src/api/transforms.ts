import { SearchParams, ShowParams, fileTypes } from '@models/searchParams';

export const transformToSearchRequestString = (searchReq: SearchParams): string => {
	return [`v2/files/search?smart=${searchReq.smartSearch}`,
	`&query=${searchReq.query}`,
	`&file_type=${searchReq.fileType ? searchReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${searchReq.dir && searchReq.dir.length !== 0 ? ['', ...searchReq.dir].join('/') : '/'}`,
	].join('')
}
