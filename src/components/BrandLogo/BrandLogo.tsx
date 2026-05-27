import './BrandLogo.css'

function BrandLogo() {
  return (
    <div className="brand-logo" aria-label="CapClair">
      <svg
        className="brand-logo-icon"
        viewBox="0 0 56 56"
        role="img"
        aria-label="Logo CapClair"
      >
        <defs>
          <linearGradient id="capclair-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#256D85" />
            <stop offset="100%" stopColor="#5DA9A0" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="52" height="52" rx="16" fill="url(#capclair-gradient)" />
        <path
          d="M38 19a14 14 0 1 0 0 18"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M28 28 L39 17 M39 17 L39 24 M39 17 L32 17"
          fill="none"
          stroke="#F2A65A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="brand-logo-copy">
        <p className="brand-logo-title">
          <span>Cap</span>
          <span>Clair</span>
        </p>
        <p className="brand-logo-baseline">Transforme le flou en direction</p>
      </div>
    </div>
  )
}

export default BrandLogo
