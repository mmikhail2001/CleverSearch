export const correctFormats = '.doc,.docx,.odt,.ppt,.pptx,.odp,.txt,.md,.pdf,.mp3,.mp4,.jpeg,.jpg,.png'

export const isCorrectFormat = (format: string): boolean => {
    switch (format) {
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/vnd.oasis.opendocument.text':
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        case 'application/vnd.oasis.opendocument.presentation':
        case 'text/plain':
        case 'text/markdown':
        case 'application/pdf':
        case 'audio/mpeg':
        case 'video/mp4':
        case 'image/jpeg':
        case 'image/png':
            return true
        default:
            return false
    }
}