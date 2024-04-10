package file

func (ft FileType) ToDTO() string {
	return string(ft)
}

func (ft *FileType) FromDTO(dto string) {
	*ft = FileType(dto)
}

func (st StatusType) ToDTO() string {
	return string(st)
}

func (st *StatusType) FromDTO(dto string) {
	*st = StatusType(dto)
}

func (at AccessType) ToDTO() string {
	return string(at)
}

func (at *AccessType) FromDTO(dto string) {
	*at = AccessType(dto)
}
