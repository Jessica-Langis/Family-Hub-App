import './Panel.css'

/** Wrapper card used by every section */
export default function Panel({ className = '', children, style }) {
  return (
    <div className={`panel ${className}`} style={style}>
      {children}
    </div>
  )
}

/** Standardised section header — title, optional badge, optional action buttons */
export function PanelHeader({ title, badge, actions }) {
  return (
    <div className="section-header">
      <div className="section-header-left">
        <span className="section-title">{title}</span>
        {badge && <span className="section-badge">{badge}</span>}
      </div>
      {actions && (
        <div className="section-header-actions">{actions}</div>
      )}
    </div>
  )
}
