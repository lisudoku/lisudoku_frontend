import { Routes, Route } from 'react-router-dom'
import PuzzleBuilder from 'src/components/PuzzleBuilder'

const BuildPage = () => (
  <Routes>
    <Route path="/" element={<PuzzleBuilder admin />} />
    <Route path=":gridSize" element={<PuzzleBuilder admin />} />
  </Routes>
)

export default BuildPage
