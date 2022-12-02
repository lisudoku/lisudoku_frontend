import { Routes, Route } from 'react-router-dom'
import BuildPage from './BuildPage'
import GroupCounts from './GroupCounts'
import Overview from './Overview'
import PuzzlesPage from './PuzzlesPage'

const AdminPage = () => (
  <Routes>
    <Route path="/" element={<Overview />} />
    <Route path="group_counts" element={<GroupCounts />} />
    <Route path="puzzles" element={<PuzzlesPage />} />
    <Route path="build/*" element={<BuildPage />} />
  </Routes>
)

export default AdminPage
