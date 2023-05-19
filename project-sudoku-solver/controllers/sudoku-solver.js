/* eslint-disable class-methods-use-this */
const getRow = (index) => Math.floor(index / 9) + 1;
const getCol = (index) => (index % 9) + 1;
const getRegion = (row, col) => Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;

class SudokuSolver {
  validate(puzzleString) {
    if (!puzzleString || puzzleString.length !== 81) {
      return { valid: false, message: 'Expected puzzle to be 81 characters long' };
    }
    for (let i = 0; i < puzzleString.length; i += 1) {
      if (!puzzleString[i].match(/[1-9.]/)) {
        return { valid: false, message: 'Invalid characters in puzzle' };
      }
    }
    return { valid: true, message: puzzleString };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const rowArr = puzzleString.split('').filter((_, i) => getRow(i) === row);
    if (rowArr.filter((v) => v === value).length) return false;
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const colArr = puzzleString
      .split('')
      .filter((_, i) => getCol(i) === column);
    if (colArr.filter((v) => v === value).length) return false;
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const regionArr = puzzleString
      .split('')
      .filter(
        (_, i) => getRegion(getRow(i), getCol(i)) === getRegion(row, column),
      );
    if (regionArr.filter((v) => v === value).length) return false;
    return true;
  }

  /**
  * Checks if a value 1-9 is a possible solution for a cell in the sudoku
  * @param {String} string The puzzle string
  * @param {Number} row Row number [1-9]
  * @param {Number} col Column number [1-9]
  * @param {String} val Number [1-9] to check
  * @returns {Boolean}
  */
  isValueValid(string, row, col, val) {
    return (this.checkRowPlacement(string, row, col, val)
        && this.checkColPlacement(string, row, col, val)
        && this.checkRegionPlacement(string, row, col, val));
  }

  solve(puzzleString) {
    // If the puzzle string to solve is invalid, return an error message.
    const validatePuzzle = this.validate(puzzleString);
    if (!validatePuzzle.valid) return { solved: false, string: validatePuzzle.message };

    const puzzleArr = puzzleString.split('');
    let index;
    let isSolved = true;

    // If there is at least a "." in the puzzle, we need to try and find a solution for it.
    if (puzzleArr.indexOf('.') > -1) {
      isSolved = false;
      index = puzzleArr.indexOf('.');
    }

    // If there are no more "." in the string, the puzzle is solved.
    if (isSolved) {
      return { solved: true, string: puzzleArr.join('') };
    }

    /**
     * Check if a number from 1 to 9 is placeable in the position of the current "."
     * if it's placeable, try to solve the puzzle with its value. If the
     * puzzle cannot be solved, put the "." again and try the next placeable value.
     * This is a backtrack strategy.
     *  */
    for (let num = 1; num <= 9; num += 1) {
      if (
        this.isValueValid(
          puzzleArr.join(''),
          getRow(index),
          getCol(index),
          num.toString(),
        )
      ) {
        puzzleArr.splice(index, 1, String(num));
        const result = this.solve(puzzleArr.join(''));
        if (result.solved) {
          return { solved: true, string: result.string };
        }
        puzzleArr.splice(index, 1, '.');
      }
    }

    // If the cicle above didn't returned yet, the puzzle isn't solvable.
    return { solved: false, string: 'Puzzle cannot be solved' };
  }
}

module.exports = SudokuSolver;
