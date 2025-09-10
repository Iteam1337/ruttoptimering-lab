import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))

// Types
interface Vehicle {
  id: number
  description: string
  start: [number, number]
  end: [number, number]
}

interface Job {
  id: number
  description: string
  location: [number, number]
}

interface RouteOptimizationRequest {
  vehicles: Vehicle[]
  jobs: Job[]
}

interface RouteOptimizationResponse {
  routes: Array<{
    vehicleId: number
    vehicleDescription: string
    jobs: Array<{
      jobId: number
      jobDescription: string
      location: [number, number]
      estimatedTime: number
    }>
    totalDistance: number
    totalTime: number
  }>
  unassignedJobs: Job[]
  optimizationTime: number
}

// Routes
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.get('/api/health', (_req, res) => {
  res.json({
    message: 'Ruttoptimering Lab API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

app.get('/api/data', (_req, res) => {
  try {
    const dataPath = path.join(__dirname, './iteam.json')
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data file' })
  }
})

app.post('/api/optimize', async (req, res) => {
  try {
    const { vehicles, jobs }: RouteOptimizationRequest = req.body

    if (!vehicles || !jobs) {
      return res.status(400).json({ error: 'Vehicles and jobs are required' })
    }

    const vroomResponse = await sendToVroom(vehicles, jobs)
    res.json(vroomResponse)
  } catch (error) {
    res.status(500).json({ error: 'Optimization failed' })
  }
})

app.post('/api/data', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../iteam.json')
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 4))
    res.json({ message: 'Data saved successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' })
  }
})

async function sendToVroom(vehicles: Vehicle[], jobs: Job[]) {
  const vroomUrl = 'https://vroom.telge.iteam.pub/'
  const requestBody = {
    vehicles,
    jobs,
  }

  try {
    const response = await fetch(vroomUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('VROOM API error response:', errorText)
      throw new Error(
        `VROOM API request failed with status ${response.status}: ${errorText}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending request to VROOM:', error)
    throw error
  }
}

// Simple route optimization algorithm
function optimizeRoutes(
  vehicles: Vehicle[],
  jobs: Job[]
): RouteOptimizationResponse {
  const startTime = Date.now()
  const routes: RouteOptimizationResponse['routes'] = []
  const unassignedJobs: Job[] = [...jobs]

  vehicles.forEach((vehicle) => {
    const vehicleJobs: RouteOptimizationResponse['routes'][0]['jobs'] = []
    let currentLocation = vehicle.start
    let totalDistance = 0
    let totalTime = 0

    // Find nearest jobs to current vehicle
    const availableJobs = unassignedJobs.filter(
      (job) => calculateDistance(currentLocation, job.location) < 50 // 50km radius
    )

    while (availableJobs.length > 0) {
      // Find nearest job
      let nearestJob = availableJobs[0]
      let nearestDistance = calculateDistance(
        currentLocation,
        nearestJob.location
      )

      for (const job of availableJobs) {
        const distance = calculateDistance(currentLocation, job.location)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestJob = job
        }
      }

      // Add job to route
      const estimatedTime = nearestDistance * 0.5 // Rough estimate: 0.5 minutes per km
      vehicleJobs.push({
        jobId: nearestJob.id,
        jobDescription: nearestJob.description,
        location: nearestJob.location,
        estimatedTime,
      })

      totalDistance += nearestDistance
      totalTime += estimatedTime
      currentLocation = nearestJob.location

      // Remove job from available jobs
      const jobIndex = unassignedJobs.findIndex(
        (job) => job.id === nearestJob.id
      )
      if (jobIndex !== -1) {
        unassignedJobs.splice(jobIndex, 1)
      }

      // Update available jobs for this vehicle
      const newAvailableJobs = unassignedJobs.filter(
        (job) => calculateDistance(currentLocation, job.location) < 50
      )
      availableJobs.length = 0
      availableJobs.push(...newAvailableJobs)
    }

    routes.push({
      vehicleId: vehicle.id,
      vehicleDescription: vehicle.description,
      jobs: vehicleJobs,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalTime: Math.round(totalTime * 100) / 100,
    })
  })

  const optimizationTime = Date.now() - startTime

  return {
    routes,
    unassignedJobs,
    optimizationTime,
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[1] * Math.PI) / 180) *
      Math.cos((coord2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

app.listen(port, () => {
  console.log(`🚀 Ruttoptimering Lab running on http://localhost:${port}`)
  console.log(`📊 API available at http://localhost:${port}/api`)
})
