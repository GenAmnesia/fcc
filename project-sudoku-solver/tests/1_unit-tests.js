const chai = require('chai');
const chaiHttp = require('chai-http');

const { assert } = chai;
const SudokuSolver = require('../controllers/sudoku-solver');
const examples = require('../controllers/puzzle-strings');

const solver = new SudokuSolver();

chai.use(chaiHttp);

suite('Functional Tests', () => {
  test('Validate puzzle string of 81 characters', () => {
    examples.forEach((v) => {
      const isValid = solver.validate(v[0]).valid;
      assert.isTrue(isValid);
    });
  });
  test('Validate puzzle string with invalid characters (not 1-9 or .)', () => {
    const isValid = solver.validate('5..91abc.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3');
    assert.isNotTrue(isValid.valid);
    assert.equal(isValid.message, 'Invalid characters in puzzle');
  });
  test('Validate puzzle string that is not 81 characters in length', () => {
    [
      '5..91.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3',
      '',
      '................................12..3....4.........567',
    ].forEach((puzzleString) => {
      const isValid = solver.validate(puzzleString);
      assert.isNotTrue(isValid.valid);
      assert.equal(isValid.message, 'Expected puzzle to be 81 characters long');
    });
  });
  test('Handle a valid row placement', () => {
    [[1, 2, '3'], [4, 1, '6'], [5, 2, '1']].forEach((valuesSet) => {
      const isValueValid = solver.checkRowPlacement(
        examples[0][0],
        valuesSet[0],
        valuesSet[1],
        valuesSet[2],
      );
      assert.isTrue(isValueValid);
    });
  });
  test('Handle an invalid row placement', () => {
    [[1, 2, '5'], [4, 1, '9'], [5, 2, '7']].forEach((valuesSet) => {
      const isValueValid = solver.checkRowPlacement(
        examples[0][0],
        valuesSet[0],
        valuesSet[1],
        valuesSet[2],
      );
      assert.isNotTrue(isValueValid);
    });
  });
  test('Handle a valid column placement', () => {
    [[1, 2, '3'], [4, 1, '6'], [5, 2, '1']].forEach((valuesSet) => {
      const isValueValid = solver.checkColPlacement(
        examples[0][0],
        valuesSet[0],
        valuesSet[1],
        valuesSet[2],
      );
      assert.isTrue(isValueValid);
    });
  });
  test('Handle an invalid column placement', () => {
    [[1, 2, '7'], [4, 1, '2'], [5, 2, '7']].forEach((valuesSet) => {
      const isValueValid = solver.checkColPlacement(
        examples[0][0],
        valuesSet[0],
        valuesSet[1],
        valuesSet[2],
      );
      assert.isNotTrue(isValueValid);
    });
  });
  test('Handle a valid region placement', () => {
    [[1, 2, '3'], [4, 1, '6'], [5, 2, '1']].forEach((valuesSet) => {
      const isValueValid = solver.checkRegionPlacement(
        examples[0][0],
        valuesSet[0],
        valuesSet[1],
        valuesSet[2],
      );
      assert.isTrue(isValueValid);
    });
  });
  test('Handle an invalid region placement', () => {
    [[1, 2, '6'], [4, 1, '7'], [5, 2, '3']].forEach((valuesSet) => {
      const isValueValid = solver.checkRegionPlacement(
        examples[0][0],
        valuesSet[0],
        valuesSet[1],
        valuesSet[2],
      );
      assert.isNotTrue(isValueValid);
    });
  });
  test('Valid puzzle strings pass the solver', () => {
    const puzzleString = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    assert.isTrue(
      solver.solve(puzzleString).solved,
    );
  });
  test('Invalid puzzle strings fail the solver', () => {
    const puzzleString = '1.5..2.84..63.12.7.2..5.ab..9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    assert.isNotTrue(
      solver.solve(puzzleString).solved,
    );
  });
  test('Solver returns the expected solution for an incomplete puzzle', () => {
    examples.forEach((puzzle) => {
      const solution = solver.solve(puzzle[0]);
      assert.isTrue(solution.solved);
      assert.equal(solution.string, puzzle[1]);
    });
  });
});
