import Sudoku from "./components/Sudoku"
import { SudokuConstraints } from "./types/constraints";

const App = () => {
  const gridSize = 4
  const fixedNumbers = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  fixedNumbers[1][1] = 4
  fixedNumbers[1][3] = 2
  fixedNumbers[2][0] = 1
  fixedNumbers[2][2] = 3
  const constraints: SudokuConstraints = {
    fixedNumbers,
  }
  return (
    <div className="App">
      <Sudoku gridSize={gridSize} constraints={constraints} />
    </div>
  );
}

export default App
