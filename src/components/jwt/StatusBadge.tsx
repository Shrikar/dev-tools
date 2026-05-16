interface StatusBadgeProps {
  type: 'success' | 'warning' | 'error' | 'info'
  children: string
}

export default function StatusBadge({ type, children }: StatusBadgeProps) {
  return <span className={`status-pill ${type === 'success' ? 'status-success' : type === 'warning' ? 'status-warning' : type === 'error' ? 'status-error' : 'status-info'}`}>{children}</span>
}
