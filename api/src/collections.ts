export * from '../.aeria/out/collections/index.mjs'
import { extendCollection, user as originalUser, file, tempFile } from 'aeria'

export const user = extendCollection(originalUser, {
  description: {
    properties: {
      roles: {
        type: 'array',
        items: {
          enum: [
            'root',
            'logistic',
            'support',
            'commerce',
            'producer',
            'callcenter'
          ]
        }
      }
    }
  }
})

export {
  file,
  tempFile,
}
