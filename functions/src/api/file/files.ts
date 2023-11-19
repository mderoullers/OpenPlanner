import { FastifyInstance } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { apiKeyPlugin } from '../apiKeyPlugin'
import { extractMultipartFormData } from './parseMultipartFiles'
import { v4 as uuidv4 } from 'uuid'
import firebase from 'firebase-admin'
import FileType from 'file-type'
import { defineString } from 'firebase-functions/params'

export const NewFile = Type.Any()

export type NewFileType = Static<typeof NewFile>

export const filesRoutes = (fastify: FastifyInstance, options: any, done: () => any) => {
    fastify
        .register(apiKeyPlugin)
        .post<{ Body: NewFileType; Reply: void }>('/v1/:eventId/files', async (request, reply) => {
            const { eventId } = request.params as { eventId: string }
            const result = await extractMultipartFormData(request.raw)

            if (!result || !result.uploads || Object.keys(result.uploads).length === 0) {
                return reply.status(400).send('Missing file(s)')
            }

            const storageBucketParam = defineString('BUCKET', {
                input: { resource: { resource: { type: 'storage.googleapis.com/Bucket' } } },
                description:
                    'This will automatically populate the selector field with the deploying Cloud Project’s  storage buckets',
            })
            const storageBucket = storageBucketParam.value()

            const fileUploads = result.uploads

            const output = []

            for (const file in fileUploads) {
                const buffer = fileUploads[file]

                const fileType = await FileType.fromBuffer(buffer)

                if (!fileType) {
                    return reply.status(400).send('Invalid file type')
                }

                const { mime, ext } = fileType

                const bucket = firebase.storage().bucket(storageBucket)
                const path = `events/${eventId}/${uuidv4()}_${file}.${ext}`
                const bucketFile = bucket.file(path)

                await bucketFile.save(buffer, {
                    contentType: mime,
                    predefinedAcl: 'publicRead',
                })
                await bucketFile.makePublic()

                const publicFileUrl = `https://${bucketFile.bucket.name}.storage.googleapis.com/${bucketFile.name}`

                output.push({
                    originalName: file,
                    publicFileUrl,
                })
            }

            reply.status(201).send(output)
        })
    done()
}
