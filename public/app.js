// Application State
let map
let vehicles = []
let jobs = []
let optimizationResults = null

// Map markers
let vehicleMarkers = []
let jobMarkers = []
let routePolylines = []

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
  initializeMap()
  setupEventListeners()
  loadInitialData()
})

// Initialize Leaflet map
function initializeMap() {
  // Default to Stockholm area
  map = L.map('map').setView([59.3293, 18.0686], 10)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)
}

// Setup event listeners
function setupEventListeners() {
  // Header buttons
  document
    .getElementById('optimizeBtn')
    .addEventListener('click', optimizeRoutes)
  document.getElementById('loadDataBtn').addEventListener('click', loadData)
  document.getElementById('saveDataBtn').addEventListener('click', saveData)

  // Add buttons
  document
    .getElementById('addVehicleBtn')
    .addEventListener('click', () => openModal('vehicleModal'))
  document
    .getElementById('addJobBtn')
    .addEventListener('click', () => openModal('jobModal'))

  // Map controls
  document.getElementById('centerMapBtn').addEventListener('click', centerMap)

  // Modal events
  setupModalEvents()

  // Form submissions
  document
    .getElementById('vehicleForm')
    .addEventListener('submit', handleVehicleSubmit)
  document.getElementById('jobForm').addEventListener('submit', handleJobSubmit)
}

// Setup modal events
function setupModalEvents() {
  const modals = document.querySelectorAll('.modal')
  const closeButtons = document.querySelectorAll('.modal-close')

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeAllModals)
  })

  modals.forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals()
      }
    })
  })

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals()
    }
  })
}

// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden')
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.classList.add('hidden')
  })
  clearForms()
}

function clearForms() {
  document.getElementById('vehicleForm').reset()
  document.getElementById('jobForm').reset()
}

// Form handlers
function handleVehicleSubmit(e) {
  e.preventDefault()

  const vehicle = {
    id: Date.now(),
    description: document.getElementById('vehicleDescription').value,
    start: [
      parseFloat(document.getElementById('vehicleStartLng').value),
      parseFloat(document.getElementById('vehicleStartLat').value),
    ],
    end: [
      parseFloat(document.getElementById('vehicleEndLng').value),
      parseFloat(document.getElementById('vehicleEndLat').value),
    ],
  }

  vehicles.push(vehicle)
  updateVehiclesList()
  updateMap()
  closeAllModals()
}

function handleJobSubmit(e) {
  e.preventDefault()

  const job = {
    id: Date.now(),
    description: document.getElementById('jobDescription').value,
    location: [
      parseFloat(document.getElementById('jobLng').value),
      parseFloat(document.getElementById('jobLat').value),
    ],
  }

  jobs.push(job)
  updateJobsList()
  updateMap()
  closeAllModals()
}

// Load initial data
async function loadInitialData() {
  try {
    const response = await fetch('/api/data')
    if (response.ok) {
      const data = await response.json()
      vehicles = data.vehicles || []
      jobs = data.jobs || []
      updateVehiclesList()
      updateJobsList()
      updateMap()
    }
  } catch (error) {
    console.error('Failed to load initial data:', error)
  }
}

// Load data from server
async function loadData() {
  try {
    showLoading(true)
    const response = await fetch('/api/data')
    if (response.ok) {
      const data = await response.json()
      vehicles = data.vehicles || []
      jobs = data.jobs || []
      updateVehiclesList()
      updateJobsList()
      updateMap()
      showNotification('Data laddad framgångsrikt!', 'success')
    } else {
      throw new Error('Failed to load data')
    }
  } catch (error) {
    console.error('Error loading data:', error)
    showNotification('Fel vid laddning av data', 'error')
  } finally {
    showLoading(false)
  }
}

// Save data to server
async function saveData() {
  try {
    showLoading(true)
    const data = { vehicles, jobs }
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      showNotification('Data sparad framgångsrikt!', 'success')
    } else {
      throw new Error('Failed to save data')
    }
  } catch (error) {
    console.error('Error saving data:', error)
    showNotification('Fel vid sparande av data', 'error')
  } finally {
    showLoading(false)
  }
}

// Optimize routes
async function optimizeRoutes() {
  if (vehicles.length === 0 || jobs.length === 0) {
    showNotification('Lägg till fordon och jobb först!', 'warning')
    return
  }

  try {
    showLoading(true)
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vehicles, jobs }),
    })
    console.log(response)

    if (response.ok) {
      optimizationResults = await response.json()
      displayResults()
      updateMapWithRoutes()
      showNotification('Rutter optimerade framgångsrikt!', 'success')
    } else {
      throw new Error('Optimization failed')
    }
  } catch (error) {
    console.error('Error optimizing routes:', error)
    showNotification('Fel vid optimering av rutter', 'error')
  } finally {
    showLoading(false)
  }
}

// Update vehicles list
function updateVehiclesList() {
  const container = document.getElementById('vehiclesList')
  container.innerHTML = ''

  vehicles.forEach((vehicle) => {
    const item = document.createElement('div')
    item.className = 'list-item'
    item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${vehicle.description}</div>
                <div class="list-item-subtitle">
                    Start: ${vehicle.start[1].toFixed(
                      4
                    )}, ${vehicle.start[0].toFixed(4)}
                </div>
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="removeVehicle(${
                  vehicle.id
                })" title="Ta bort">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
    container.appendChild(item)
  })
}

// Update jobs list
function updateJobsList() {
  const container = document.getElementById('jobsList')
  container.innerHTML = ''

  jobs.forEach((job) => {
    const item = document.createElement('div')
    item.className = 'list-item'
    item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${job.description}</div>
                <div class="list-item-subtitle">
                    ${job.location[1].toFixed(4)}, ${job.location[0].toFixed(4)}
                </div>
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="removeJob(${
                  job.id
                })" title="Ta bort">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
    container.appendChild(item)
  })
}

// Remove vehicle
function removeVehicle(id) {
  vehicles = vehicles.filter((v) => v.id !== id)
  updateVehiclesList()
  updateMap()
}

// Remove job
function removeJob(id) {
  jobs = jobs.filter((j) => j.id !== id)
  updateJobsList()
  updateMap()
}

// Update map with current data
function updateMap() {
  // Clear existing markers
  vehicleMarkers.forEach((marker) => map.removeLayer(marker))
  jobMarkers.forEach((marker) => map.removeLayer(marker))
  routePolylines.forEach((polyline) => map.removeLayer(polyline))

  vehicleMarkers = []
  jobMarkers = []
  routePolylines = []

  // Add vehicle markers
  vehicles.forEach((vehicle) => {
    const startMarker = L.marker([vehicle.start[1], vehicle.start[0]], {
      icon: L.divIcon({
        className: 'vehicle-marker',
        html: '<i class="fas fa-truck" style="color: #4facfe; font-size: 20px;"></i>',
        iconSize: [20, 20],
      }),
    }).bindPopup(`
            <strong>${vehicle.description}</strong><br>
            Start: ${vehicle.start[1].toFixed(4)}, ${vehicle.start[0].toFixed(
      4
    )}
        `)

    const endMarker = L.marker([vehicle.end[1], vehicle.end[0]], {
      icon: L.divIcon({
        className: 'vehicle-marker',
        html: '<i class="fas fa-flag-checkered" style="color: #28a745; font-size: 20px;"></i>',
        iconSize: [20, 20],
      }),
    }).bindPopup(`
            <strong>${vehicle.description}</strong><br>
            Slut: ${vehicle.end[1].toFixed(4)}, ${vehicle.end[0].toFixed(4)}
        `)

    vehicleMarkers.push(startMarker, endMarker)
    startMarker.addTo(map)
    endMarker.addTo(map)
  })

  // Add job markers
  jobs.forEach((job) => {
    const marker = L.marker([job.location[1], job.location[0]], {
      icon: L.divIcon({
        className: 'job-marker',
        html: '<i class="fas fa-map-marker-alt" style="color: #dc3545; font-size: 20px;"></i>',
        iconSize: [20, 20],
      }),
    }).bindPopup(`
            <strong>${job.description}</strong><br>
            ${job.location[1].toFixed(4)}, ${job.location[0].toFixed(4)}
        `)

    jobMarkers.push(marker)
    marker.addTo(map)
  })

  // Fit map to show all markers
  if (vehicles.length > 0 || jobs.length > 0) {
    const group = new L.featureGroup([...vehicleMarkers, ...jobMarkers])
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

// Update map with optimized routes
function updateMapWithRoutes() {
  if (!optimizationResults) return

  // Clear existing route polylines
  routePolylines.forEach((polyline) => map.removeLayer(polyline))
  routePolylines = []

  const colors = [
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#38f9d7',
    '#ffecd2',
    '#fcb69f',
  ]

  optimizationResults.routes.forEach((route, index) => {
    const color = colors[index % colors.length]
    const coordinates = []

    // Add vehicle start
    const vehicle = vehicles.find((v) => v.id === route.vehicleId)
    if (vehicle) {
      coordinates.push([vehicle.start[1], vehicle.start[0]])
    }

    // Add job locations
    route.steps.forEach((job) => {
      coordinates.push([job.location[1], job.location[0]])
    })

    // Add vehicle end
    if (vehicle) {
      coordinates.push([vehicle.end[1], vehicle.end[0]])
    }

    // Create polyline
    const polyline = L.polyline(coordinates, {
      color: color,
      weight: 4,
      opacity: 0.8,
    }).bindPopup(`
            <strong>${route.vehicleDescription}</strong><br>
            Jobb: ${route.steps.length}<br>
            Distans: ${route.duration.toFixed(2)} km<br>
            Tid: ${route.duration.toFixed(1)} min
        `)

    routePolylines.push(polyline)
    polyline.addTo(map)
  })
}

// Display optimization results
function displayResults() {
  if (!optimizationResults) return

  const panel = document.getElementById('resultsPanel')
  const content = document.getElementById('resultsContent')

  content.innerHTML = `
        <div class="optimization-summary">
            <p><strong>Optimeringstid:</strong> ${optimizationResults.optimizationTime}ms</p>
        </div>
    `

  optimizationResults.routes.forEach((route, index) => {
    const routeCard = document.createElement('div')
    routeCard.className = 'route-card'
    routeCard.innerHTML = `
            <div class="route-header">
                <div class="route-title">${route.vehicleDescription}</div>
                <div class="route-stats">
                    ${route.steps.length} jobb • ${route.duration.toFixed(
      2
    )} km • ${route.duration.toFixed(1)} min
                </div>
            </div>
            <div class="route-jobs">
                ${route.steps
                  .map(
                    (job) => `
                    <div class="job-item">
                        <span>${job.jobDescription}</span>
                        <span class="job-location">${job.duration.toFixed(
                          1
                        )} min</span>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `
    content.appendChild(routeCard)
  })

  panel.classList.remove('hidden')
}

// Center map on all markers
function centerMap() {
  if (vehicleMarkers.length > 0 || jobMarkers.length > 0) {
    const group = new L.featureGroup([...vehicleMarkers, ...jobMarkers])
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

// Show/hide loading overlay
function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay')
  if (show) {
    overlay.classList.remove('hidden')
  } else {
    overlay.classList.add('hidden')
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <i class="fas fa-${
          type === 'success'
            ? 'check-circle'
            : type === 'error'
            ? 'exclamation-circle'
            : type === 'warning'
            ? 'exclamation-triangle'
            : 'info-circle'
        }"></i>
        <span>${message}</span>
    `

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === 'success'
            ? '#28a745'
            : type === 'error'
            ? '#dc3545'
            : type === 'warning'
            ? '#ffc107'
            : '#17a2b8'
        };
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `

  document.body.appendChild(notification)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Add CSS animations for notifications
const style = document.createElement('style')
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)
