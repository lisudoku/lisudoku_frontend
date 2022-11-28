import { Routes, Route } from 'react-router-dom'
import BuildOptions from './BuildOptions'
import PuzzleBuilder from './PuzzleBuilder'

const BuildPage = () => (
  <Routes>
    <Route path="/" element={<BuildOptions />} />
    <Route path=":gridSize" element={<PuzzleBuilder />} />
  </Routes>
)

export default BuildPage
