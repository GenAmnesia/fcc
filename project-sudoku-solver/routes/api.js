const SudokuSolver = require('../controllers/sudoku-solver');

module.exports = function (app) {
  const solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const rowLetters = {};
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach((l, i) => {
        rowLetters[l] = i + 1;
      });
      const { coordinate, value, puzzle } = req.body;
      if (!coordinate || !value || !puzzle) {
        return res.send({ error: 'Required field(s) missing' });
      }
      if (puzzle && !solver.validate(puzzle).valid) {
        return res.send({ error: solver.validate(puzzle).message });
      }
      if (coordinate && !coordinate.match(/^[A-Ia-i][1-9]$/g)) {
        return res.send({ error: 'Invalid coordinate' });
      }
      if (value && (!Number(value) || Number(value) > 9 || Number(value) < 1)) {
        return res.send({ error: 'Invalid value' });
      }

      const row = Number(rowLetters[coordinate.toUpperCase().split('')[0]]);
      const col = Number(coordinate.split('')[1]);
      const isDuplicate = puzzle.charAt(((row - 1) * 9) + (col - 1)) === value;
      let isValid = solver.isValueValid(puzzle, row, col, value);
      let isRowValid = solver.checkRowPlacement(puzzle, row, col, value);
      let isColValid = solver.checkColPlacement(puzzle, row, col, value);
      let isRegionValid = solver.checkRegionPlacement(puzzle, row, col, value);

      if (isDuplicate) {
        let newPuzzle = `${puzzle}`.split('');
        newPuzzle.splice(((row - 1) * 9) + (col - 1), 1, '.');
        newPuzzle = newPuzzle.join('');
        isValid = solver.isValueValid(newPuzzle, row, col, value);
        isRowValid = solver.checkRowPlacement(newPuzzle, row, col, value);
        isColValid = solver.checkColPlacement(newPuzzle, row, col, value);
        isRegionValid = solver.checkRegionPlacement(newPuzzle, row, col, value);
      }

      const conflict = [];
      if (!isRowValid) conflict.push('row');
      if (!isColValid) conflict.push('column');
      if (!isRegionValid) conflict.push('region');

      if (isValid) return res.send({ valid: true });
      return res.send({ valid: false, conflict });
    });

  app.route('/api/solve')
    .post((req, res) => {
      const puzzleString = req.body.puzzle;
      if (!puzzleString) {
        return res.send({ error: 'Required field missing' });
      }
      const solution = solver.solve(puzzleString);
      if (!solution.solved) {
        return res.send({ error: solution.string });
      }
      return res.send({ solution: solution.string });
    });
};
