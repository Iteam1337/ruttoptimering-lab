import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.get('/', (_req, res) => {
  res.json({
    message: 'Hej från Ruttoptimering Lab!',
    timestamp: new Date().toISOString(),
  })
})

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`)
})
