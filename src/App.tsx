import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './screens/HomePage'
import EnsureLogin from './components/EnsureLogin'
import LoginPage from './screens/LoginPage'
import LogoutPage from './screens/LogoutPage'
import RegisterPage from './screens/RegisterPage'
import PageNotFound from './screens/PageNotFound'
import PuzzlePage from './screens/PuzzlePage'
import PlayPage from './screens/PlayPage'

const App = () => {
  return (
    <div className="min-h-screen flex flex-col text-white bg-black">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<EnsureLogin />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/play/:variant" element={<PlayPage />} />
            </Route>
            <Route path="login" element={<LoginPage />} />
            <Route path="logout" element={<LogoutPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
          <Route path="p/:id" element={<PuzzlePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App
