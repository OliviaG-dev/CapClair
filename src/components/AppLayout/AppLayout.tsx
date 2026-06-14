import { useEffect, useId, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import BrandLogo from '../BrandLogo/BrandLogo'
import MonCapBanner from '../MonCapBanner/MonCapBanner'
import navigationLinks from '../../data/navigationLinks.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import './AppLayout.css'

type NavigationLink = {
  to: string
  label: string
  requiresIncompleteOnboarding?: boolean
}

const THEME_STORAGE_KEY = 'capclair-theme'
const MOBILE_MENU_BREAKPOINT = 720

const resolveInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function SunIcon() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        d="M12 2.2v2.5M12 19.3v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.2 12h2.5M19.3 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon({ gradientId }: { gradientId: string }) {
  return (
    <svg className="theme-toggle-icon theme-toggle-icon-moon" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-success)" />
        </linearGradient>
      </defs>
      <path
        d="M18.8 14.9a7.4 7.4 0 0 1-9.7-9.7 7.6 7.6 0 1 0 9.7 9.7Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  )
}

type ThemeToggleButtonProps = {
  className?: string
  theme: 'light' | 'dark'
  onToggle: () => void
}

function ThemeToggleButton({ className, theme, onToggle }: ThemeToggleButtonProps) {
  const moonGradientId = `theme-moon-gradient-${useId().replace(/:/g, '')}`

  return (
    <button
      type="button"
      className={['theme-toggle-btn', className].filter(Boolean).join(' ')}
      onClick={onToggle}
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon gradientId={moonGradientId} />}
    </button>
  )
}

function AppLayout() {
  const { state } = useCapClairState()
  const location = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolveInitialTheme())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const showMonCapBanner =
    state.synthesis != null &&
    state.handoffCompleted &&
    location.pathname !== '/onboarding' &&
    location.pathname !== '/handoff'
  const visibleNavigationLinks = useMemo(
    () =>
      (navigationLinks as NavigationLink[]).filter((link) => {
        if (link.requiresIncompleteOnboarding && state.synthesis) {
          return false
        }

        return true
      }),
    [state.synthesis],
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_MENU_BREAKPOINT}px)`)

    const handleViewportChange = () => {
      if (!mediaQuery.matches) {
        setIsMobileMenuOpen(false)
      }
    }

    mediaQuery.addEventListener('change', handleViewportChange)
    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

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
          {showMonCapBanner ? null : (
            <p className="layout-helper-text">Un pas clair aujourd’hui vaut mieux qu’un grand plan flou.</p>
          )}
          <div className="layout-header-actions">
            <ThemeToggleButton
              className="theme-toggle-btn-mobile"
              theme={theme}
              onToggle={toggleTheme}
            />
            <button
              type="button"
              className={`mobile-menu-btn ${isMobileMenuOpen ? 'mobile-menu-btn-open' : ''}`}
              aria-expanded={isMobileMenuOpen}
              aria-controls="main-navigation"
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            >
              <span className="burger-bar" />
              <span className="burger-bar" />
              <span className="burger-bar" />
            </button>
          </div>
        </div>
        <div className={`layout-nav-row ${isMobileMenuOpen ? 'layout-nav-row-open' : ''}`}>
          <nav
            id="main-navigation"
            className={`main-nav ${isMobileMenuOpen ? 'main-nav-open' : ''}`}
            aria-label="Navigation principale"
          >
            {visibleNavigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
                onClick={closeMobileMenu}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggleButton
            className="theme-toggle-btn-desktop"
            theme={theme}
            onToggle={toggleTheme}
          />
        </div>
      </header>
      {showMonCapBanner ? (
        <MonCapBanner objectives={state.objectives} />
      ) : null}
      {isMobileMenuOpen ? (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Fermer le menu"
          onClick={closeMobileMenu}
        />
      ) : null}
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
