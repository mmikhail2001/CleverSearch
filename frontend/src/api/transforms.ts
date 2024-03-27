import { SearchParams, ShowParams, fileTypes } from '@models/searchParams';

export const transfromToShowRequestString = (showReq: ShowParams): string => {
	return [`/files?limit=${showReq.limit}`,
	`&offset=${showReq.offset}`,
	`&disk=${showReq.disk ? showReq.disk : 'all'}`,
	`&file_type=${showReq.fileType ? showReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${showReq.dir && showReq.dir.length !== 0 ? ['', ...showReq.dir].join('/') : '/'}`,
	`&first_nesting=${showReq.nestingReq === undefined ? true : showReq.nestingReq}`,
	`&dirs_required=${showReq.dirsReq === undefined ? true : showReq.dirsReq}`,
	`&files_required=${showReq.filesReq === undefined ? true : showReq.filesReq}`,
	`&shared_required=${showReq.sharedReq === undefined ? true : showReq.sharedReq}`,
	`&personal_required=${showReq.personalReq === undefined ? true : showReq.personalReq}`].join('')
}

export const transformToSearchRequestString = (searchReq: SearchParams): string => {
	return [`files/search?is_smart_search=${searchReq.smartSearch}`,
	`&query=${searchReq.query}`,
	`&disk=${searchReq.disk ? searchReq.disk : 'all'}`,
	`&file_type=${searchReq.fileType ? searchReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${searchReq.dir && searchReq.dir.length !== 0 ? ['', ...searchReq.dir].join('/') : '/'}`,
	`&limit=${searchReq.limit ? searchReq.limit : 10}`,
	`&offset=${searchReq.offset ? searchReq.offset : 0}`,
	`&first_nesting=${searchReq.nestingReq === undefined ? false : searchReq.nestingReq}`,
	`&dirs_required=${searchReq.dirsReq === undefined ? true : searchReq.dirsReq}`,
	`&files_required=${searchReq.filesReq === undefined ? true : searchReq.filesReq}`,
	`&shared_required=${searchReq.sharedReq === undefined ? true : searchReq.sharedReq}`,
	`&personal_required=${searchReq.personalReq === undefined ? true : searchReq.personalReq}`
	].join('')
}

export const transfromToSharedRequestParams = (showReq: ShowParams): string => {
	return [`?limit=${showReq.limit}`,
	`&offset=${showReq.offset}`,
	`&disk=${showReq.disk ? showReq.disk : 'all'}`,
	`&file_type=${showReq.fileType ? showReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${showReq.dir && showReq.dir.length !== 0 ? ['', ...showReq.dir].join('/') : '/'}`,
	`&first_nesting=${showReq.nestingReq === undefined ? true : showReq.nestingReq}`,
	`&dirs_required=${showReq.dirsReq === undefined ? true : showReq.dirsReq}`,
	`&files_required=${showReq.filesReq === undefined ? true : showReq.filesReq}`,
		'&shared_required=true',
		'&personal_required=false'].join('')
}