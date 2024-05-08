export const correctFormats = ".pdf,.mp3,.mp4,image/jpeg, image/png"

export const isCorrectFormat = (format: string): boolean => {
    switch (format) {
        case 'application/pdf':
        case 'image/jpeg':
        case 'image/png':
        case 'audio/mpeg':
        case 'video/mp4':
            return true
        default:
            return false
    }
}