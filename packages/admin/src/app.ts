import * as express from 'express'
import * as cors from 'cors'

const app = express()
const PORT = 8000

app.use(cors({
    origin: ['http://localhost:3000']
}))

app.use(express.json())

app.listen(PORT, () => {
    console.log(`Server listening on: http://localhost:${PORT}`)
})
