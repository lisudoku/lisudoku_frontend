import { Routes, Route } from 'react-router-dom'
import BuildPage from './BuildPage'
import CollectionsEditPage from './CollectionsEditPage'
import CollectionsPage from './CollectionsPage'
import CompetitionEditPage from './CompetitionEditPage'
import CompetitionsPage from './CompetitionsPage'
import GroupCounts from './GroupCounts'
import Overview from './Overview'
import PuzzleEditPage from './PuzzleEditPage'
import PuzzlesPage from './PuzzlesPage'

const AdminPage = () => (
  <Routes>
    <Route path="/" element={<Overview />} />
    <Route path="group_counts" element={<GroupCounts />} />
    <Route path="puzzles" element={<PuzzlesPage />} />
    <Route path="puzzles/:id/edit" element={<PuzzleEditPage />} />
    <Route path="build/*" element={<BuildPage />} />
    <Route path="collections" element={<CollectionsPage />} />
    <Route path="collections/:id/edit" element={<CollectionsEditPage />} />
    <Route path="competitions" element={<CompetitionsPage />} />
    <Route path="competitions/:id/edit" element={<CompetitionEditPage />} />
  </Routes>
)

export default AdminPage
