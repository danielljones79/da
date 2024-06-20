package main

import "scratch/logging"

func main() {
	logging.SetDebugMode(true)
	logging.Debug("Debug Message")
	logging.Info("Info Message")
	logging.Error("Error Message")
}
