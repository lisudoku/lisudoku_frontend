import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './screens/HomePage'
import PlayPage from './screens/PlayPage'
import LoginPage from './screens/LoginPage'
import LogoutPage from './screens/LogoutPage'
import RegisterPage from './screens/RegisterPage'
import PuzzlePage from './screens/PuzzlePage'
import ExternalPuzzlePage from './screens/ExternalPuzzlePage'
import TvPage from './screens/TvPage'
import AboutPage from './screens/AboutPage'
import CollectionPage from './screens/CollectionPage'
import TrainerPage from './screens/TrainerPage'
import LearnPage from './screens/LearnPage'
import SolverPage from './screens/SolverPage'
import OfflinePage from './screens/OfflinePage'
import FeedbackPage from './screens/FeedbackPage'
import PageNotFound from './screens/PageNotFound'
import EnsureAdmin from './components/EnsureAdmin'

const AdminPage = lazy(() => import('./screens/AdminPage'))

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Layout padding={false} />}>
      <Route path="/" element={<HomePage />} />
    </Route>
    <Route path="/" element={<Layout />}>
      <Route path="/play/:variant/:difficulty" element={<PlayPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="logout" element={<LogoutPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="p/:id" element={<PuzzlePage />} />
      <Route path="e" element={<ExternalPuzzlePage />} />
      <Route path="tv" element={<TvPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="collections/:id" element={<CollectionPage />} />
      <Route path="trainer" element={<TrainerPage />} />
      <Route path="learn" element={<LearnPage />} />
      <Route path="solver" element={<SolverPage />} />
      <Route path="offline" element={<OfflinePage/>} />
      <Route path="feedback" element={<FeedbackPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Route>
    <Route path="/" element={<Layout admin />}>
      <Route path="/" element={<EnsureAdmin />}>
        <Route path="admin/*" element={<AdminPage />} />
      </Route>
    </Route>
  </Routes>
)

export default AppRoutes
