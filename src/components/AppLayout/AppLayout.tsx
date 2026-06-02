import { NavLink, Outlet } from 'react-router-dom'
import BrandLogo from '../BrandLogo/BrandLogo'
import navigationLinks from '../../data/navigationLinks.json'
import './AppLayout.css'

function AppLayout() {
  return (
    <div className="layout">
      <div className="background-layer" aria-hidden="true">
        <span className="geo-shape geo-shape-repeat geo-shape-pos-1" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-2" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-3" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-4" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-5" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-6" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-7" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-8" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-9" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-10" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-11" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-12" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-13" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-14" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-15" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-16" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-17" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-18" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-19" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-20" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-21" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-22" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-23" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-24" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-25" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-26" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-27" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-28" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-29" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-30" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-31" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-32" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-33" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-34" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-35" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-36" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-37" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-38" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-39" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-40" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-41" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-42" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-43" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-44" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-45" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-46" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-47" />
        <span className="geo-shape geo-shape-repeat geo-shape-pos-48" />
      </div>
      <header className="layout-header">
        <div className="layout-header-inner">
          <BrandLogo />
          <p className="layout-helper-text">Un pas clair aujourd’hui vaut mieux qu’un grand plan flou.</p>
        </div>
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
