import { useLanyard } from 'use-lanyard'

const DISCORD_USER_ID = '974570077150142465'
const DISCORD_USERNAME = 'insurgent_dino'

const statusLabels = {
  online: 'online',
  idle: 'idle',
  dnd: 'do not disturb',
  offline: 'offline',
}

function StatusWidget() {
  const presence = useLanyard(DISCORD_USER_ID)
  const status = presence?.discord_status || 'offline'
  const label = statusLabels[status] || status

  return (
    <p className={`presence-status presence-status-${status}`}>
      <span className="presence-indicator" aria-hidden="true" />
      {presence ? `I am ${label}!` : 'checking Discord status...'}
    </p>
  )
}

export default StatusWidget