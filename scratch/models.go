package models

import "time"

// Database Models

// Telemetry maps to the "Telemetry" table in PostgreSQL
type Telemetry struct {
	ID            string    `gorm:"column:id;primaryKey" json:"id"`
	Timestamp     time.Time `gorm:"column:timestamp;not null" json:"timestamp"`
	State         string    `gorm:"column:state;not null" json:"state"`
	WaterTemp     float64   `gorm:"column:waterTemp;not null" json:"waterTemp"`
	AirTemp       float64   `gorm:"column:airTemp;not null" json:"airTemp"`
	Humidity      float64   `gorm:"column:humidity;not null" json:"humidity"`
	Pressure      float64   `gorm:"column:pressure;not null" json:"pressure"`
	LevelCm       int       `gorm:"column:levelCm;not null" json:"levelCm"`
	PredictedPh   float64   `gorm:"column:predictedPh" json:"predictedPh"`
	PredictedDo   float64   `gorm:"column:predictedDo" json:"predictedDo"`
	RelayIntake   bool      `gorm:"column:relayIntake;not null" json:"relayIntake"`
	RelayOuttake  bool      `gorm:"column:relayOuttake;not null" json:"relayOuttake"`
	RelayAir      bool      `gorm:"column:relayAir;not null" json:"relayAir"`
	RelayLight    bool      `gorm:"column:relayLight;not null" json:"relayLight"`
	RelayAgitator bool      `gorm:"column:relayAgitator;not null" json:"relayAgitator"`
}

func (Telemetry) TableName() string {
	return "Telemetry"
}

// SystemLog maps to the "SystemLog" table
type SystemLog struct {
	ID        string    `gorm:"column:id;primaryKey" json:"id"`
	Timestamp time.Time `gorm:"column:timestamp;not null" json:"timestamp"`
	Level     string    `gorm:"column:level;not null" json:"level"`
	Message   string    `gorm:"column:message;not null" json:"message"`
}

func (SystemLog) TableName() string {
	return "SystemLog"
}

// DeviceConfig maps to the "DeviceConfig" table
type DeviceConfig struct {
	ID             string    `gorm:"column:id;primaryKey" json:"id"`
	UpdatedAt      time.Time `gorm:"column:updatedAt;not null" json:"updatedAt"`
	LightOnHr      int       `gorm:"column:lightOnHr;not null" json:"lightOnHr"`
	LightOffHr     int       `gorm:"column:lightOffHr;not null" json:"lightOffHr"`
	EnableLights   bool      `gorm:"column:enableLights;not null" json:"enableLights"`
	EnableAir      bool      `gorm:"column:enableAir;not null" json:"enableAir"`
	EnableAgitator bool      `gorm:"column:enableAgitator;not null" json:"enableAgitator"`
	EnableRefill   bool      `gorm:"column:enableRefill;not null" json:"enableRefill"`
}

func (DeviceConfig) TableName() string {
	return "DeviceConfig"
}

// MQTT Payload Models

type MQTTTelemetryPayload struct {
	State     string  `json:"state"`
	WaterTemp float64 `json:"water_temp"`
	AirTemp   float64 `json:"air_temp"`
	Humidity  float64 `json:"humidity"`
	Pressure  float64 `json:"pressure"`
	LevelCm   int     `json:"level_cm"`
	Relays    struct {
		Intake   bool `json:"intake"`
		Outtake  bool `json:"outtake"`
		Air      bool `json:"air"`
		Light    bool `json:"light"`
		Agitator bool `json:"agitator"`
	} `json:"relays"`
	TCS34725_R int `json:"tcs_r,omitempty"`
	TCS34725_G int `json:"tcs_g,omitempty"`
	TCS34725_B int `json:"tcs_b,omitempty"`
	TCS34725_C int `json:"tcs_c,omitempty"`
	StoreThis  bool `json:"store_this"`
}

type MQTTLogPayload struct {
	Level string `json:"level"`
	Msg   string `json:"msg"`
}
