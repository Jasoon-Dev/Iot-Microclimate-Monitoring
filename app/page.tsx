"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CloudRain,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  AlertTriangle,
  Clock,
  BarChart3,
  Download,
  FileText,
  Wifi,
  WifiOff,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface SensorReading {
  id: string
  name: string
  value: number | null
  unit: string
  status: "optimal" | "warning" | "critical" | "normal" | "no-data"
  threshold: { min: number; max: number }
  lastUpdated: Date | null
  icon: React.ReactNode
}

interface HistoricalData {
  timestamp: Date
  temperature: number | null
  humidity: number | null
  soilMoisture: number | null
  lightIntensity: number | null
  windSpeed: number | null
  rainfall: number | null
}

export default function AuthPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)

  const handleLogin = (email: string, password: string) => {
    if (email && password) {
      setUser({ email, name: email.split("@")[0] })
      setIsLoggedIn(true)
    }
  }

  const handleRegister = (name: string, email: string, password: string) => {
    if (name && email && password) {
      setUser({ email, name })
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  if (isLoggedIn && user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <CloudRain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">IoT Microclimate</h1>
          </div>
          <p className="text-gray-600">Environmental Monitoring System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Access your environmental monitoring dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm onLogin={handleLogin} />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm onRegister={handleRegister} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  )
}

function RegisterForm({ onRegister }: { onRegister: (name: string, email: string, password: string) => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRegister(name, email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  )
}

function Dashboard({ user, onLogout }: { user: { email: string; name: string }; onLogout: () => void }) {
  const [sensors, setSensors] = useState<SensorReading[]>([
    {
      id: "soil-moisture",
      name: "Soil Moisture",
      value: null,
      unit: "%",
      status: "no-data",
      threshold: { min: 40, max: 80 },
      lastUpdated: null,
      icon: <Droplets className="h-6 w-6" />,
    },
    {
      id: "temperature",
      name: "Temperature (DHT22)",
      value: null,
      unit: "°C",
      status: "no-data",
      threshold: { min: 15, max: 35 },
      lastUpdated: null,
      icon: <Thermometer className="h-6 w-6" />,
    },
    {
      id: "humidity",
      name: "Humidity (DHT22)",
      value: null,
      unit: "%",
      status: "no-data",
      threshold: { min: 30, max: 70 },
      lastUpdated: null,
      icon: <CloudRain className="h-6 w-6" />,
    },
    {
      id: "light-intensity",
      name: "Light Intensity (LDR)",
      value: null,
      unit: "lux",
      status: "no-data",
      threshold: { min: 200, max: 1000 },
      lastUpdated: null,
      icon: <Sun className="h-6 w-6" />,
    },
    {
      id: "wind-speed",
      name: "Wind Speed",
      value: null,
      unit: "km/h",
      status: "no-data",
      threshold: { min: 0, max: 50 },
      lastUpdated: null,
      icon: <Wind className="h-6 w-6" />,
    },
    {
      id: "rainfall",
      name: "Rainfall Intensity",
      value: null,
      unit: "mm/h",
      status: "no-data",
      threshold: { min: 0, max: 10 },
      lastUpdated: null,
      icon: <CloudRain className="h-6 w-6" />,
    },
  ])

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [systemStatus, setSystemStatus] = useState<"online" | "offline" | "waiting">("waiting")
  const [chartTimeRange, setChartTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("1h")

  const fetchSensorData = async () => {
    try {
      // Replace this URL with your Raspberry Pi's IP address and endpoint
      const response = await fetch("/api/sensors")
      if (response.ok) {
        const data = await response.json()
        updateSensorsFromData(data)
        setSystemStatus("online")
      } else {
        setSystemStatus("offline")
      }
    } catch (error) {
      console.error("Failed to fetch sensor data:", error)
      setSystemStatus("offline")
    }
  }

  const updateSensorsFromData = (data: any) => {
    setSensors((prevSensors) =>
      prevSensors.map((sensor) => {
        const newValue = data[sensor.id]
        if (newValue !== undefined && newValue !== null) {
          let status: "optimal" | "warning" | "critical" | "normal" = "normal"

          if (sensor.id === "soil-moisture") {
            if (newValue >= 50 && newValue <= 75) status = "optimal"
            else if (newValue < 30 || newValue > 85) status = "critical"
            else if (newValue < 40 || newValue > 80) status = "warning"
          } else {
            if (newValue < sensor.threshold.min || newValue > sensor.threshold.max) {
              status = "warning"
            }
            if (newValue < sensor.threshold.min * 0.8 || newValue > sensor.threshold.max * 1.2) {
              status = "critical"
            }
          }

          return {
            ...sensor,
            value: newValue,
            status,
            lastUpdated: new Date(),
          }
        }
        return sensor
      }),
    )

    if (data && Object.keys(data).length > 0) {
      setHistoricalData((prev) => {
        const newEntry: HistoricalData = {
          timestamp: new Date(),
          temperature: data.temperature || null,
          humidity: data.humidity || null,
          soilMoisture: data["soil-moisture"] || null,
          lightIntensity: data["light-intensity"] || null,
          windSpeed: data["wind-speed"] || null,
          rainfall: data.rainfall || null,
        }
        return [...prev.slice(-100), newEntry]
      })
    }
  }

  useEffect(() => {
    fetchSensorData() // Initial fetch
    const interval = setInterval(fetchSensorData, 60000)
    return () => clearInterval(interval)
  }, [])

  const criticalAlerts = sensors.filter((s) => s.status === "critical").length
  const warningAlerts = sensors.filter((s) => s.status === "warning").length
  const noDataSensors = sensors.filter((s) => s.status === "no-data").length

  const getChartData = () => {
    return historicalData.slice(-20).map((data, index) => ({
      ...data,
      time: data.timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      formattedTime: data.timestamp.toLocaleTimeString(),
    }))
  }

  const exportToCSV = () => {
    if (historicalData.length === 0) return

    const headers = [
      "Timestamp",
      "Temperature (°C)",
      "Humidity (%)",
      "Soil Moisture (%)",
      "Light Intensity (lux)",
      "Wind Speed (km/h)",
      "Rainfall (mm/h)",
    ]
    const csvContent = [
      headers.join(","),
      ...historicalData.map((data) =>
        [
          data.timestamp.toISOString(),
          data.temperature ?? "",
          data.humidity ?? "",
          data.soilMoisture ?? "",
          data.lightIntensity ?? "",
          data.windSpeed ?? "",
          data.rainfall ?? "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `iot-microclimate-data-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    if (historicalData.length === 0) return

    const reportContent = `
      IoT Microclimate System Report
      Generated: ${new Date().toLocaleString()}
      User: ${user.name}
      
      CURRENT SENSOR STATUS:
      ${sensors
        .map(
          (sensor) =>
            `${sensor.name}: ${sensor.value !== null ? `${sensor.value}${sensor.unit}` : "No Data"} (${sensor.status.toUpperCase()})`,
        )
        .join("\n      ")}
      
      SYSTEM ALERTS:
      Critical Alerts: ${criticalAlerts}
      Warning Alerts: ${warningAlerts}
      Sensors with No Data: ${noDataSensors}
      System Status: ${systemStatus.toUpperCase()}
      
      RECENT DATA (Last ${historicalData.length} readings):
      ${historicalData
        .slice(-10)
        .map(
          (data) =>
            `${data.timestamp.toLocaleString()} - Temp: ${data.temperature ?? "N/A"}°C, Humidity: ${data.humidity ?? "N/A"}%, Soil: ${data.soilMoisture ?? "N/A"}%, Light: ${data.lightIntensity ?? "N/A"}lux, Wind: ${data.windSpeed ?? "N/A"}km/h, Rain: ${data.rainfall ?? "N/A"}mm/h`,
        )
        .join("\n      ")}
      
      SENSOR THRESHOLDS:
      ${sensors
        .map((sensor) => `${sensor.name}: ${sensor.threshold.min}-${sensor.threshold.max}${sensor.unit}`)
        .join("\n      ")}
    `

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `iot-microclimate-report-${new Date().toISOString().split("T")[0]}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <CloudRain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">IoT Microclimate System</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {systemStatus === "online" && <Wifi className="w-4 h-4 text-green-500" />}
                {systemStatus === "offline" && <WifiOff className="w-4 h-4 text-red-500" />}
                {systemStatus === "waiting" && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                <span className="text-sm text-gray-600 capitalize">
                  {systemStatus === "waiting" ? "Waiting for sensors" : systemStatus}
                </span>
              </div>
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(criticalAlerts > 0 || warningAlerts > 0 || noDataSensors > 0) && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    System Status: {criticalAlerts} Critical, {warningAlerts} Warning
                    {noDataSensors > 0 && `, ${noDataSensors} sensors waiting for data`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {systemStatus === "waiting" && noDataSensors === sensors.length && (
          <div className="mb-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wifi className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Waiting for Sensor Data</h3>
                  <p className="text-blue-700 mb-4">
                    Connect your Arduino and Raspberry Pi to start receiving sensor data.
                  </p>
                  <div className="text-sm text-blue-600 bg-white rounded-lg p-4 text-left">
                    <p className="font-medium mb-2">To connect your sensors:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Ensure your Raspberry Pi is connected to the network</li>
                      <li>
                        Configure your Pi to send data to:{" "}
                        <code className="bg-blue-100 px-1 rounded">/api/sensors</code>
                      </li>
                      <li>Send POST requests with sensor data in JSON format</li>
                      <li>Data will appear here automatically once received</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sensors.map((sensor) => (
            <EnhancedSensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>

        {historicalData.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Data Visualization</h2>
              </div>
              <Select
                value={chartTimeRange}
                onValueChange={(value: "1h" | "6h" | "24h" | "7d") => setChartTimeRange(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ... existing chart components ... */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    Temperature & Humidity Trends
                  </CardTitle>
                  <CardDescription>Real-time DHT22 sensor readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value: number, name: string) => [
                          `${value}${name === "temperature" ? "°C" : "%"}`,
                          name === "temperature" ? "Temperature" : "Humidity",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                        name="Temperature"
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                        name="Humidity"
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Soil Moisture Levels
                  </CardTitle>
                  <CardDescription>Soil moisture monitoring over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value: number) => [`${value}%`, "Soil Moisture"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="soilMoisture"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        connectNulls={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    Light Intensity & Wind Speed
                  </CardTitle>
                  <CardDescription>Environmental conditions monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value: number, name: string) => [
                          `${value}${name === "lightIntensity" ? " lux" : " km/h"}`,
                          name === "lightIntensity" ? "Light Intensity" : "Wind Speed",
                        ]}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="lightIntensity"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
                        name="Light Intensity"
                        connectNulls={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="windSpeed"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                        name="Wind Speed"
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudRain className="h-5 w-5 text-blue-600" />
                    Rainfall Intensity
                  </CardTitle>
                  <CardDescription>Precipitation monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value: number) => [`${value} mm/h`, "Rainfall"]}
                      />
                      <Bar dataKey="rainfall" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {historicalData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Readings</CardTitle>
                <CardDescription>Latest sensor data from the past few minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicalData
                    .slice(-5)
                    .reverse()
                    .map((data, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{data.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-blue-600">{data.temperature ?? "N/A"}°C</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-green-600">{data.humidity ?? "N/A"}%</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-orange-600">{data.soilMoisture ?? "N/A"}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Export
              </CardTitle>
              <CardDescription>Download your sensor data in multiple formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={exportToCSV}
                disabled={historicalData.length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download CSV Report
              </Button>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={exportToPDF}
                disabled={historicalData.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF Report
              </Button>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">Total readings: {historicalData.length}</p>
                {historicalData.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Last updated: {historicalData[historicalData.length - 1]?.timestamp.toLocaleTimeString()}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {historicalData.length === 0
                    ? "No data available for export. Connect your sensors to start collecting data."
                    : "Export includes all historical sensor data with timestamps"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function EnhancedSensorCard({ sensor }: { sensor: SensorReading }) {
  const statusConfig = {
    optimal: { color: "text-green-600", bg: "bg-green-50", badge: "bg-green-100 text-green-800" },
    normal: { color: "text-blue-600", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-800" },
    warning: { color: "text-orange-600", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-800" },
    critical: { color: "text-red-600", bg: "bg-red-50", badge: "bg-red-100 text-red-800" },
    "no-data": { color: "text-gray-600", bg: "bg-gray-50", badge: "bg-gray-100 text-gray-800" },
  }

  const config = statusConfig[sensor.status]

  const range = sensor.threshold.max - sensor.threshold.min
  const progress =
    sensor.value !== null ? Math.min(100, Math.max(0, ((sensor.value - sensor.threshold.min) / range) * 100)) : 0

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-600">{sensor.name}</p>
              <Badge className={`text-xs ${config.badge}`}>
                {sensor.status === "no-data" ? "No Data" : sensor.status}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {sensor.value !== null ? `${sensor.value}${sensor.unit}` : "No Data"}
            </p>
          </div>
          <div className={`p-3 rounded-full ${config.bg} ${config.color}`}>{sensor.icon}</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {sensor.threshold.min}
              {sensor.unit}
            </span>
            <span>
              {sensor.threshold.max}
              {sensor.unit}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500">
            {sensor.lastUpdated ? `Updated: ${sensor.lastUpdated.toLocaleTimeString()}` : "Waiting for data..."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
