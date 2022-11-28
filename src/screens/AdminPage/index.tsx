import { Routes, Route } from 'react-router-dom'
import BuildPage from './BuildPage'
import GroupCounts from './GroupCounts'
import Overview from './Overview'

const AdminPage = () => (
  <Routes>
    <Route path="/" element={<Overview />} />
    <Route path="group_counts" element={<GroupCounts />} />
    <Route path="build/*" element={<BuildPage />} />
  </Routes>
)

export default AdminPage
