const getRow = (index) => Math.floor(index / 9) + 1;
const getCol = (index) => (index % 9) + 1;
const getRegion = (row, col) => Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;

class SudokuSolver {
  validate(puzzleString) {
    if (puzzleString.length !== 81) {
      return Promise.reject(
        new Error('Expected puzzle to be 81 characters long'),
      );
    }

    for (let i = 0; i < puzzleString.length; i++) {
      if (Number(puzzleString[i]) || puzzleString[i] === '.') {
        if (Number(puzzleString[i])) {
          const row = Math.floor(i / 9) + 1;
          const col = (i % 9) + 1;
          if (
            !this.checkRowPlacement(puzzleString, row, col, puzzleString[i])
            || !this.checkColPlacement(puzzleString, row, col, puzzleString[i])
            || !this.checkRegionPlacement(puzzleString, row, col, puzzleString[i])
          ) { return Promise.reject(new Error('Puzzle cannot be solved')); }
        }
        // "." char is always valid.
      } else return Promise.reject(new Error('Invalid characters in puzzle'));
      // if the analyzed char is not a number or a ".", the string is invalid
    }
    return Promise.resolve(puzzleString);
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

  solve(puzzleString) {
    const isValid = (string, row, col, val) => {
      if (
        this.checkRowPlacement(string, row, col, val)
        && this.checkColPlacement(string, row, col, val)
        && this.checkRegionPlacement(string, row, col, val)
      ) {
        return true;
      }
      return false;
    };
    const puzzleArr = puzzleString.split('');
    let index;
    let isSolved = true;

    if (puzzleArr.indexOf('.') > -1) {
      isSolved = false;
      index = puzzleArr.indexOf('.');
    }

    if (isSolved) {
      return { solved: true, string: puzzleArr.join('') };
    }

    for (let num = 1; num <= 9; num++) {
      if (
        isValid(
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
    return { solved: false };
  }
}

module.exports = SudokuSolver;
