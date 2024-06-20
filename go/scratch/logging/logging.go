package logging

import (
	"log"
)

var debugMode bool

func SetDebugMode(enabled bool) {
	debugMode = enabled
}

func Debug(message string) {
	if debugMode {
		log.Println("DEBUG: " + message)
	}
}

func Info(message string) {
	log.Println("INFO: " + message)
}

func Error(message string) {
	log.Println("ERROR: " + message)
}

func Fatal(message string) {
	log.Fatal("FATAL: " + message)
}
