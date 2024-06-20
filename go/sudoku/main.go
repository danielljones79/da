package main

/*
#cgo CFLAGS: -g -Wall
#cgo LDFLAGS: -L. -lsudoku
#include <stdio.h>
#include <stdbool.h>
#include "sudoku.h"
*/
import "C"
import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
	"unsafe"
)

// SudokuBoard represents a Sudoku board
type SudokuBoard [9][9]C.int

// SolveSudoku solves a Sudoku puzzle
func SolveSudoku(board SudokuBoard) (SudokuBoard, bool) {
	startTime := time.Now()
	solved := C.solve_sudoku((*C.int)(unsafe.Pointer(&board[0][0])))
	elapsedTime := time.Since(startTime)
	log.Printf("Solved Sudoku puzzle in %v ms", elapsedTime.Milliseconds())
	return board, bool(solved)
}

func sudokuHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var board SudokuBoard
		err := json.NewDecoder(r.Body).Decode(&board)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		startTime := time.Now()
		responseBoard, solved := SolveSudoku(board)
		if !solved {
			http.Error(w, "No solution exists", http.StatusBadRequest)
			return
		}
		elapsedTime := time.Since(startTime)
		fmt.Fprintf(w, "Solved Sudoku Puzzle in %d ms:\n", elapsedTime.Milliseconds())
		printBoard(w, responseBoard)
	} else if r.Method == http.MethodGet {
		difficultyStr := r.URL.Query().Get("difficulty")
		difficulty := 5
		if difficultyStr != "" {
			var err error
			difficulty, err = strconv.Atoi(difficultyStr)
			if err != nil || difficulty < 0 || difficulty > 9 {
				http.Error(w, "Invalid difficulty level", http.StatusBadRequest)
				return
			}
		}
		// generate a new puzzle with the given difficulty
		responseBoard := generatePuzzle(difficulty)
		fmt.Fprintf(w, "Generated Sudoku Puzzle with difficulty %d:\n", difficulty)
		printBoard(w, responseBoard)
	} else {
		http.Error(w, "Unsupported request method", http.StatusMethodNotAllowed)
	}
}

func printBoard(w http.ResponseWriter, board SudokuBoard) {
	for i := 0; i < 9; i++ {
		for j := 0; j < 9; j++ {
			fmt.Fprintf(w, "%d ", board[i][j])
			if (j+1)%3 == 0 && j < 8 {
				fmt.Fprintf(w, "| ")
			}
		}
		fmt.Fprintf(w, "\n")
		if (i+1)%3 == 0 && i < 8 {
			fmt.Fprintf(w, "---------------------\n")
		}
	}
}

func generatePuzzle(difficulty int) SudokuBoard {
	// Create an empty Sudoku board
	var board SudokuBoard

	// Set all values to 0
	for i := 0; i < 9; i++ {
		for j := 0; j < 9; j++ {
			board[i][j] = 0
		}
	}

	// Randomly place values 1-9 on the board
	for num := 1; num <= 9; num++ {
		x, y := rand.Intn(9), rand.Intn(9)
		for board[x][y] != 0 {
			x, y = rand.Intn(9), rand.Intn(9)
		}
		board[x][y] = C.int(num)
	}

	// Solve the board to get a completed puzzle
	_, _ = SolveSudoku(board)

	// Save the completed puzzle
	completedPuzzle := board

	// Remove 51 random values from the completed board, this will leave us with 30 filled in values
	for i := 0; i < 51; i++ {
		x, y := rand.Intn(9), rand.Intn(9)
		for board[x][y] == 0 {
			x, y = rand.Intn(9), rand.Intn(9)
		}
		board[x][y] = 0
	}

	// Continue removing values until there's more than one solution
	var cnt int = 1
	var x, y int
	var value_removed C.int
	for cnt <= 1 {
		x, y = rand.Intn(9), rand.Intn(9)
		for board[x][y] == 0 {
			x, y = rand.Intn(9), rand.Intn(9)
		}
		value_removed = board[x][y]
		board[x][y] = 0
		cnt = int(C.count_solutions((*C.int)(unsafe.Pointer(&board[0][0]))))
		log.Printf("Removed value and now cnt is %v ", cnt)
	}
	// now that cnt is greater than one, add back the last value and it should bring it back to 1
	board[x][y] = value_removed
	log.Printf("Adding back last removed value %v ", value_removed)
	// the board should now be pretty difficult

	// Add back values based on the difficulty level
	for i := 0; i < 9-difficulty; i++ {
		x, y := rand.Intn(9), rand.Intn(9)
		for board[x][y] != 0 {
			x, y = rand.Intn(9), rand.Intn(9)
		}
		board[x][y] = completedPuzzle[x][y]
	}

	return board
}

func main() {
	http.HandleFunc("/sudoku", sudokuHandler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
