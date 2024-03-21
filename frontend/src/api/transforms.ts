import { SearchParams, ShowParams, fileTypes } from '@models/searchParams';

export const transfromToShowRequestString = (showReq: ShowParams): string => {
	return [`/files?limit=${showReq.limit}`,
	`&offset=${showReq.offset}`,
	`&disk=${showReq.disk ? showReq.disk : 'all'}`,
	`&file_type=${showReq.fileType ? showReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${showReq.dir && showReq.dir.length !== 0 ? ['', ...showReq.dir].join('/') : '/'}`].join('')
}

export const transformToSearchRequestString = (searchReq: SearchParams): string => {
	return [`files/search?is_smart_search=${searchReq.smartSearch}`,
	`&query=${searchReq.query}`,
	`&disk=${searchReq.disk ? searchReq.disk : 'all'}`,
	`&file_type=${searchReq.fileType ? searchReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${searchReq.dir && searchReq.dir.length !== 0 ? ['', ...searchReq.dir].join('/') : '/'}`,
	`&limit=${searchReq.limit ? searchReq.limit : 10}`,
	`&offset=${searchReq.offset ? searchReq.offset : 0}`].join('')
}