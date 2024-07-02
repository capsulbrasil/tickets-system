export * from '../.aeria/out/collections/index.mjs'
// export { user, file, tempFile } from 'aeria'
export {file, tempFile, extendCollection} from 'aeria'
import { extendCollection, user as originalUser} from 'aeria'

export const user = extendCollection(originalUser, {
  description: {
    properties: {
      roles: {
        type: "array",
        items: {
          enum: [
            "root",
            "logistic",
            "producer",
            "commercial",
            "support"
          ]
        }
      }
    }
  }
})
