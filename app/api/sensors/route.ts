import { type NextRequest, NextResponse } from "next/server"

let latestSensorData: any = null
let sensorHistory: any[] = []

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Log received data for debugging
    console.log("Received sensor data:", data)

    // Validate that we have sensor data
    const expectedSensors = ["soil-moisture", "temperature", "humidity", "light-intensity", "wind-speed", "rainfall"]

    // Check if at least one sensor value is provided
    const hasValidData = expectedSensors.some((sensor) => data[sensor] !== undefined && data[sensor] !== null)

    if (!hasValidData) {
      return NextResponse.json({ error: "No valid sensor data provided" }, { status: 400 })
    }

    const timestampedData = {
      ...data,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    }

    latestSensorData = timestampedData

    sensorHistory.push(timestampedData)
    if (sensorHistory.length > 100) {
      sensorHistory = sensorHistory.slice(-100)
    }

    return NextResponse.json({
      success: true,
      message: "Sensor data received successfully",
      receivedData: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing sensor data:", error)
    return NextResponse.json({ error: "Failed to process sensor data" }, { status: 500 })
  }
}

export async function GET() {
  if (latestSensorData) {
    return NextResponse.json({
      success: true,
      data: latestSensorData,
      history: sensorHistory.slice(-20), // Last 20 readings
      lastUpdated: latestSensorData.timestamp,
      totalReadings: sensorHistory.length,
    })
  }

  // Return status when no data is available yet
  return NextResponse.json({
    status: "waiting",
    message: "No sensor data received yet. Send POST requests with sensor data to this endpoint",
    expectedFormat: {
      "soil-moisture": "number (0-100)",
      temperature: "number (celsius)",
      humidity: "number (0-100)",
      "light-intensity": "number (lux)",
      "wind-speed": "number (km/h)",
      rainfall: "number (mm/h)",
    },
  })
}
