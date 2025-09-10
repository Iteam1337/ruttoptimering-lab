import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hej från Ruttoptimering Lab!',
    timestamp: new Date().toISOString()
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() })
})

app.listen(port, () => {
  console.log(`Server körs på http://localhost:${port}`)
})
