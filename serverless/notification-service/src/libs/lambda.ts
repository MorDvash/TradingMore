import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import cors from '@middy/http-cors'

export default handler => middy(handler)
    .use([
      middyJsonBodyParser(),
      cors(),
    ])
