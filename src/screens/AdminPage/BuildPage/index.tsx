import { Routes, Route } from 'react-router-dom'
import PuzzleBuilder from './PuzzleBuilder'

const BuildPage = () => (
  <Routes>
    <Route path="/" element={<PuzzleBuilder />} />
    <Route path=":gridSize" element={<PuzzleBuilder />} />
  </Routes>
)

export default BuildPage
