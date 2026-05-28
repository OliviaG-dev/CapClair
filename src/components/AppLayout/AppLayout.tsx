import { NavLink, Outlet } from 'react-router-dom'
import BrandLogo from '../BrandLogo/BrandLogo'
import navigationLinks from '../../data/navigationLinks.json'
import './AppLayout.css'

function AppLayout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <BrandLogo />
        <nav className="main-nav" aria-label="Navigation principale">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
