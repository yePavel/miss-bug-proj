const Router = ReactRouterDOM.HashRouter
const { Route, Routes } = ReactRouterDOM

import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'
import { Home } from './pages/Home.jsx'
import { BugIndex } from './pages/BugIndex.jsx'
import { BugDetails } from './pages/BugDetails.jsx'
import { AboutUs } from './pages/AboutUs.jsx'
import { UserMsg } from './cmps/UserMsg.jsx'
import { UserDetails } from './pages/UserDetails.jsx'
import { AdminDashboard } from './pages/AdminDashboard.jsx'

export function App() {
  return (
    <Router>
      <div>
        <AppHeader />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bug" element={<BugIndex />} />
            <Route path="/bug/:bugId" element={<BugDetails />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user/:userId" element={<UserDetails />} />
          </Routes>
        </main>
        <AppFooter />
      </div>
      <UserMsg />
    </Router>
  )
}
