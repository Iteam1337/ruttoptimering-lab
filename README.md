# 🚀 Ruttoptimering Lab

A modern web application for route optimization with interactive map visualization. This application helps optimize vehicle routes by intelligently assigning jobs to vehicles based on proximity and efficiency.

## ✨ Features

- **Interactive Map Visualization**: View vehicles, jobs, and optimized routes on an interactive map
- **Route Optimization**: Advanced algorithm to optimize vehicle routes and job assignments
- **Real-time Management**: Add, edit, and remove vehicles and jobs dynamically
- **Modern UI**: Beautiful, responsive interface with smooth animations
- **Data Persistence**: Save and load optimization data
- **Performance Metrics**: View optimization results with distance and time calculations

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Mapping**: Leaflet.js for interactive maps
- **Styling**: Modern CSS with gradients and animations
- **Icons**: Font Awesome

## 🚀 Quick Start

### Prerequisites

- Node.js (>= 18)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Iteam1337/ruttoptimering-lab.git
cd ruttoptimering-lab
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📖 Usage

### Adding Vehicles

1. Click "Lägg till Fordon" in the sidebar
2. Fill in the vehicle description and coordinates
3. Set start and end locations for the vehicle

### Adding Jobs

1. Click "Lägg till Jobb" in the sidebar
2. Enter job description and location coordinates
3. The job will appear on the map as a red marker

### Optimizing Routes

1. Ensure you have at least one vehicle and one job
2. Click "Optimera Rutter" in the header
3. View the optimized routes on the map and in the results panel

### Managing Data

- **Load Data**: Load existing data from the server
- **Save Data**: Save current vehicles and jobs to the server

## 🗺️ Map Features

- **Vehicle Markers**: Blue truck icons for start locations, green flags for end locations
- **Job Markers**: Red markers for job locations
- **Route Visualization**: Colored polylines showing optimized routes
- **Interactive Popups**: Click markers to see detailed information
- **Auto-centering**: Map automatically fits to show all markers

## 🔧 API Endpoints

- `GET /` - Serve the web application
- `GET /api/health` - Health check endpoint
- `GET /api/data` - Get current vehicles and jobs data
- `POST /api/data` - Save vehicles and jobs data
- `POST /api/optimize` - Optimize routes for given vehicles and jobs

## 📊 Optimization Algorithm

The application uses a nearest-neighbor algorithm with the following features:

- **Distance Calculation**: Haversine formula for accurate geographic distances
- **Proximity Filtering**: Jobs within 50km radius of vehicles
- **Time Estimation**: Rough time calculation based on distance
- **Route Efficiency**: Minimizes total travel distance and time

## 🎨 UI Components

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Styling**: Gradient backgrounds, smooth animations
- **Interactive Elements**: Hover effects, loading states
- **Modal Dialogs**: Clean forms for adding vehicles and jobs
- **Notification System**: Success, error, and warning messages

## 🐳 Docker Support

The application includes Docker configuration:

```bash
docker-compose up
```

## 📁 Project Structure

```
ruttoptimering-lab/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── app.js            # Frontend JavaScript
├── k8s/                   # Kubernetes configurations
├── server.ts              # Express server
├── iteam.json            # Sample data
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue on GitHub.

---

**Happy Route Optimizing! 🚗💨**
