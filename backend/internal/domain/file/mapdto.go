package file

func (ft SizeType) ToDTO() string {
	return humanReadableSize(int64(ft))
}
