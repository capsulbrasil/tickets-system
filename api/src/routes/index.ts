import { createRouter, Result } from 'aeria'

export const router = createRouter()

router.GET('/test', async (context) => {
  const { error, result: people } = await context.collections.person.functions.getAll()

  if( error ) {
    return Result.error(error)
  }

  return Result.result({
    message: 'Hello, world!',
    people,
  })
})

