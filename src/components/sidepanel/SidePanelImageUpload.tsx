import * as React from 'react'
import { useCallback, useState } from 'react'
import { SidePanel } from './SidePanel'
import { useDropzone } from 'react-dropzone'
import { SidePanelImageUploadForm } from './SidePanelImageUploadForm'
import { resizeImage } from '../../utils/images/resizeImage'
import { uploadImage } from '../../utils/images/uploadImage'
import { Event } from '../../types'
import { useController } from 'react-hook-form'
import { useNotification } from '../../hooks/notificationHook'

export type SidePanelImageUploadProps = {
    event: Event
    isOpen: boolean
    onClose: () => void
    title: string
    fieldName: string
}
export const SidePanelImageUpload = ({ event, isOpen, onClose, title, fieldName }: SidePanelImageUploadProps) => {
    const { field } = useController({ name: fieldName })
    const { createNotification } = useNotification()
    const [upload, setUpload] = useState<{
        file: File
        preview: any
    } | null>(null)
    const [uploading, setUploading] = useState(false)

    const onSave = async () => {
        setUploading(true)

        try {
            if (upload) {
                const resizedImage = await resizeImage(upload.file)
                const imagePath = await uploadImage(event, resizedImage)
                field.onChange(imagePath)
            }

            onClose()
        } catch (error) {
            createNotification('Error while resizing image or uploading it (check JS console?)', { type: 'error' })
            console.log(error)
        }

        setUploading(false)
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setUpload({
                file: acceptedFiles[0],
                preview: URL.createObjectURL(acceptedFiles[0]),
            })
        }
    }, [])

    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        noClick: true,
        noKeyboard: true,
        accept: {
            'image/jpeg': ['.png', '.jpg', '.jpeg'],
            'image/png': ['.png', '.jpg', '.jpeg'],
        },
        maxSize: 1024 * 1024,
    })

    return (
        <SidePanel onClose={onClose} isOpen={isOpen} title={title} containerProps={getRootProps()}>
            <SidePanelImageUploadForm
                uploading={uploading}
                isDragActive={isDragActive}
                file={upload}
                getInputProps={getInputProps}
                fieldName={fieldName}
                onInputClick={open}
                onSaveClick={onSave}
                helpText="PNG or JPEG image, will be resized in the browser."
            />
        </SidePanel>
    )
}
