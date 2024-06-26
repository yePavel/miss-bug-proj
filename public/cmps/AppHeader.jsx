import { userService } from '../services/user.service.js'
import { LoginSignup } from './LoginSignup.jsx'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

const { Link, NavLink } = ReactRouterDOM
const { useState } = React
const { useNavigate } = ReactRouter

export function AppHeader() {
  const navigate = useNavigate()
  const [user, setUser] = useState(userService.getLoggedInUser())

  function onLogout() {
    userService.logout()
      .then(() => {
        showSuccessMsg('You have logged out successfully')
        onSetUser(null)
      })
      .catch((err) => {
        showErrorMsg('oops try again')
      })
  }

  function onSetUser(user) {
    setUser(user)
    navigate('/')
  }

  return (
    <header>
      <nav>
        <NavLink to="/">Home</NavLink> | <NavLink to="/bug">Bugs</NavLink> |
        <NavLink to="/about">About</NavLink>

        {user ? (
          < section >
            <Link to={`/user/${user._id}`}>Hello {user.fullname}</Link>
            <button onClick={onLogout}>Logout</button>
          </ section >
        ) : (
          <section>
            <LoginSignup onSetUser={onSetUser} />
          </section>
        )}

      </nav>
      <h1>Bugs are Forever</h1>
    </header>
  )
}
