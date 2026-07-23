package mqtt

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"bioarc-backend/db"
	"bioarc-backend/models"
	"bioarc-backend/ws"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/google/uuid"
)

type MLPredictionResponse struct {
	PredictedPh float64 `json:"predicted_ph"`
	PredictedDo float64 `json:"predicted_do"`
}

func fetchMLPredictions(payload models.MQTTTelemetryPayload) (float64, float64) {
	defaultPh := 7.2
	defaultDo := 6.8

	if MLServiceURL == "" {
		return defaultPh, defaultDo
	}

	photoperiod := 0
	if payload.Relays.Light {
		photoperiod = 1
	}

	airPump := 0
	if payload.Relays.Air {
		airPump = 1
	}

	reqBody := map[string]interface{}{
		"Water_Temp_C":       payload.WaterTemp,
		"TCS34725_R":         payload.TCS34725_R,
		"TCS34725_G":         payload.TCS34725_G,
		"TCS34725_B":         payload.TCS34725_B,
		"TCS34725_C":         payload.TCS34725_C,
		"Photoperiod_Active": photoperiod,
		"Actuator_AirPump":   airPump,
		"Hour_of_Day":        time.Now().Hour(),
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return defaultPh, defaultDo
	}

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Post(MLServiceURL, "application/json", bytes.NewBuffer(jsonBytes))
	if err != nil {
		log.Printf("ML Service request error: %v", err)
		return defaultPh, defaultDo
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("ML Service returned non-200 status: %d", resp.StatusCode)
		return defaultPh, defaultDo
	}

	var pred MLPredictionResponse
	if err := json.NewDecoder(resp.Body).Decode(&pred); err != nil {
		log.Printf("Failed to decode ML Service response: %v", err)
		return defaultPh, defaultDo
	}

	return pred.PredictedPh, pred.PredictedDo
}

func handleTelemetry(client mqtt.Client, msg mqtt.Message) {
	log.Printf("[MQTT] Received telemetry payload: %s", string(msg.Payload()))

	var payload models.MQTTTelemetryPayload
	if err := json.Unmarshal(msg.Payload(), &payload); err != nil {
		log.Printf("Error parsing telemetry JSON: %v", err)
		return
	}

	// Fetch ML predictions
	predictedPh, predictedDo := fetchMLPredictions(payload)
	log.Printf("[ML Service] Prediction response: ph=%.2f, do=%.2f", predictedPh, predictedDo)

	// Save to DB
	telemetryEntry := models.Telemetry{
		ID:            uuid.NewString(),
		Timestamp:     time.Now(),
		State:         payload.State,
		WaterTemp:     payload.WaterTemp,
		AirTemp:       payload.AirTemp,
		Humidity:      payload.Humidity,
		Pressure:      payload.Pressure,
		LevelCm:       payload.LevelCm,
		PredictedPh:   predictedPh,
		PredictedDo:   predictedDo,
		RelayIntake:   payload.Relays.Intake,
		RelayOuttake:  payload.Relays.Outtake,
		RelayAir:      payload.Relays.Air,
		RelayLight:    payload.Relays.Light,
		RelayAgitator: payload.Relays.Agitator,
	}

	if payload.StoreThis {
		if err := db.DB.Create(&telemetryEntry).Error; err != nil {
			log.Printf("Failed to insert telemetry to DB: %v", err)
		}
	}

	// Broadcast full telemetry entry via WebSocket
	log.Printf("[WebSocket] Broadcasting telemetry to clients...")
	ws.BroadcastMessage("telemetry", telemetryEntry)
}

func handleLog(client mqtt.Client, msg mqtt.Message) {
	var payload models.MQTTLogPayload
	if err := json.Unmarshal(msg.Payload(), &payload); err != nil {
		log.Printf("Error parsing log JSON: %v", err)
		return
	}

	// Broadcast log via WebSocket
	ws.BroadcastMessage("log", payload)

	// Save log to DB
	logEntry := models.SystemLog{
		ID:        uuid.NewString(),
		Timestamp: time.Now(),
		Level:     payload.Level,
		Message:   payload.Msg,
	}

	if err := db.DB.Create(&logEntry).Error; err != nil {
		log.Printf("Failed to insert log to DB: %v", err)
	}
}

func handleStatus(client mqtt.Client, msg mqtt.Message) {
	status := string(msg.Payload())
	log.Printf("Device Status: %s", status)

	// Broadcast status via WebSocket
	ws.BroadcastMessage("status", map[string]string{"status": status})
}
