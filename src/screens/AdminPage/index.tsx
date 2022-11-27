import { Routes, Route } from 'react-router-dom'
import GroupCounts from './GroupCounts'
import Overview from './Overview'

const AdminPage = () => (
  <Routes>
    <Route path="/" element={<Overview />} />
    <Route path="group_counts" element={<GroupCounts />} />
  </Routes>
)

export default AdminPage
