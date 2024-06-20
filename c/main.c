#include <stdio.h>
#include <stdbool.h>

bool is_valid(int board[9][9], int row, int col, int num) {
    // Check if we find the same num in the similar row
    for (int x = 0; x < 9; x++) {
        if (board[row][x] == num) {
            return false;
        }
    }

    // Check if we find the same num in the similar column
    for (int x = 0; x < 9; x++) {
        if (board[x][col] == num) {
            return false;
        }
    }

    // Check if we find the same num in the particular 3*3 matrix
    int start_row = row - row % 3;
    int start_col = col - col % 3;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (board[i + start_row][j + start_col] == num) {
                return false;
            }
        }
    }
    return true;
}

void fill_naked_singles(int board[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (board[i][j] == 0) {
                int possible_values[9] = {0};
                int count = 0;
                for (int num = 1; num <= 9; num++) {
                    if (is_valid(board, i, j, num)) {
                        possible_values[count] = num;
                        count++;
                    }
                }
                if (count == 1) {
                    printf("Found Naked Single %d,%d = %d\n", i, j, possible_values[0]);
                    board[i][j] = possible_values[0];
                }
            }
        }
    }
}
void fill_unique_candidates(int board[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (board[i][j] == 0) {
                for (int num = 1; num <= 9; num++) {
                    if (is_valid(board, i, j, num)) {
                        // Check rows
                        int row_count = 0;
                        for (int k = 0; k < 9; k++) {
                            if (is_valid(board, i, k, num)) {
                                row_count++;
                            }
                        }
                        if (row_count == 1) {
                            board[i][j] = num;
                            break;
                        }

                        // Check columns
                        int col_count = 0;
                        for (int k = 0; k < 9; k++) {
                            if (is_valid(board, k, j, num)) {
                                col_count++;
                            }
                        }
                        if (col_count == 1) {
                            board[i][j] = num;
                            break;
                        }

                        // Check 3x3 boxes
                        int start_row = i - i % 3;
                        int start_col = j - j % 3;
                        int box_count = 0;
                        for (int k = 0; k < 3; k++) {
                            for (int l = 0; l < 3; l++) {
                                if (is_valid(board, start_row + k, start_col + l, num)) {
                                    box_count++;
                                }
                            }
                        }
                        if (box_count == 1) {
                            board[i][j] = num;
                            break;
                        }
                    }
                }
            }
        }
    }
}
    
bool solve_sudoku_recursive(int board[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (board[i][j] == 0) {
                for (int num = 1; num <= 9; num++) {
                    if (is_valid(board, i, j, num)) {
                        board[i][j] = num;
                        if (solve_sudoku_recursive(board)) {
                            return true;
                        }
                        board[i][j] = 0;
                    }
                }
                return false;
            }
        }
    }

    return true;
}

bool solve_sudoku(int board[9][9]) {
    fill_naked_singles(board);
    fill_unique_candidates(board);
    return solve_sudoku_recursive(board);

}

int count_solutions_recursive(int board[9][9]) {
    int count = 0;
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (board[i][j] == 0) {
                for (int num = 1; num <= 9; num++) {
                    if (is_valid(board, i, j, num)) {
                        board[i][j] = num;
                        count += count_solutions_recursive(board);
                        board[i][j] = 0;
                    }
                }
                return count;
            }
        }
    }
    return 1; // if we reach this point, it means we've found a valid solution
}

void print_board(int board[9][9]) {
  printf("\n");
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            printf("%d ", board[i][j]);
        }
        printf("\n");
    }
}

int main() {

  printf("Test Board: Testee\n");
    int board_testee[9][9] = {
        {0, 3, 0, 0, 7, 0, 0, 0, 0},
        {0, 0, 0, 1, 0, 5, 0, 0, 0},
        {0, 9, 8, 0, 0, 0, 0, 6, 0},
        {0, 0, 0, 0, 6, 0, 0, 0, 3},
        {4, 0, 0, 0, 0, 3, 0, 0, 1},
        {7, 0, 0, 0, 0, 0, 0, 0, 6},
        {0, 6, 0, 0, 0, 0, 2, 8, 0},
        {0, 0, 0, 4, 1, 9, 0, 0, 5},
        {0, 0, 0, 0, 0, 0, 0, 7, 9}
    };

    int solutions = count_solutions_recursive(board_testee);
    printf("Testee Solutions: %d\n", solutions);
    return 99;

    printf("Test Board: Fresh Fish\n");
    int board_fresh_fish[9][9] = {
        {5, 3, 0, 0, 7, 0, 0, 0, 0},
        {6, 0, 0, 1, 9, 5, 0, 0, 0},
        {0, 9, 8, 0, 0, 0, 0, 6, 0},
        {8, 0, 0, 0, 6, 0, 0, 0, 3},
        {4, 0, 0, 8, 0, 3, 0, 0, 1},
        {7, 0, 0, 0, 2, 0, 0, 0, 6},
        {0, 6, 0, 0, 0, 0, 2, 8, 0},
        {0, 0, 0, 4, 1, 9, 0, 0, 5},
        {0, 0, 0, 0, 8, 0, 0, 7, 9}
    };
    
    if (solve_sudoku(board_fresh_fish)) {
        printf("Solved! \n");
        print_board(board_fresh_fish);
    } else {
        printf("No solution exists\n");
    }

    printf("\nTest Board: Souther Love\n");
    int board_southern_love[9][9] = {
      {0, 8, 0, 2, 0, 0, 0, 0, 9},
      {0, 0, 0, 3, 0, 0, 0, 0, 6},
      {9, 6, 0, 0, 7, 0, 0, 0, 1},
      {0, 0, 0, 0, 0, 0, 0, 0, 0},
      {0, 9, 0, 7, 0, 0, 2, 0, 0},
      {0, 4, 0, 0, 0, 1, 0, 0, 8},
      {0, 7, 0, 4, 0, 0, 5, 0, 0},
      {0, 0, 4, 0, 3, 0, 8, 0, 0},
      {3, 0, 6, 0, 0, 0, 0, 0, 0}
    };

    if (solve_sudoku(board_southern_love)) {
        printf("Solved! \n");
        print_board(board_southern_love);
    } else {
        printf("No solution exists\n");
    }

    printf("\nTest Board: Fresh Drama\n");
    int board_fresh_drama[9][9] = {
        {8, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 3, 6, 0, 0, 0, 0, 0},
        {0, 7, 0, 0, 9, 0, 2, 0, 0},
        {0, 5, 0, 0, 0, 7, 0, 0, 0},
        {0, 0, 0, 0, 4, 5, 7, 0, 0},
        {0, 0, 0, 1, 0, 0, 0, 3, 0},
        {0, 0, 1, 0, 0, 0, 0, 6, 8},
        {0, 0, 8, 5, 0, 0, 0, 1, 0},
        {0, 9, 0, 0, 0, 0, 4, 0, 0}
    };

    if (solve_sudoku(board_fresh_drama)) {
        printf("Solved! \n");
        print_board(board_fresh_drama);
    } else {
        printf("No solution exists\n");
    }

    printf("\nTest Board: Burnt Oak\n");
    int board_burnt_oak[9][9] = {
        {8, 6, 0, 7, 9, 5, 1, 0, 4},
        {4, 5, 0, 0, 0, 0, 0, 9, 0},
        {3, 7, 0, 1, 8, 0, 6, 5, 2},
        {0, 8, 0, 0, 0, 0, 3, 0, 1},
        {0, 0, 0, 9, 0, 1, 2, 8, 0},
        {0, 0, 5, 0, 3, 0, 0, 0, 0},
        {0, 0, 8, 5, 0, 3, 0, 0, 6},
        {0, 9, 6, 4, 1, 0, 0, 0, 0},
        {0, 1, 0, 0, 0, 0, 0, 2, 0}
    };

    if (solve_sudoku(board_burnt_oak)) {
        printf("Solved! \n");
        print_board(board_burnt_oak);
    } else {
        printf("No solution exists\n");
    }

    return 0;
}

