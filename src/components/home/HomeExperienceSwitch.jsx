import React from 'react'

/**
 * Compare toggle: Classic (current dense home) vs Refined (audit recommendations).
 * Persists choice in localStorage via parent.
 */
export default function HomeExperienceSwitch({ value = 'classic', onChange }) {
  const set = (next) => {
    if (next === value) return
    onChange?.(next)
  }

  return (
    <div className="vn-ux-switch" role="group" aria-label="Homepage experience">
      <span className="vn-ux-switch-label">Home</span>
      <button
        type="button"
        className={`vn-ux-switch-btn${value === 'classic' ? ' is-on' : ''}`}
        aria-pressed={value === 'classic'}
        onClick={() => set('classic')}
      >
        Classic
      </button>
      <button
        type="button"
        className={`vn-ux-switch-btn${value === 'refined' ? ' is-on' : ''}`}
        aria-pressed={value === 'refined'}
        onClick={() => set('refined')}
      >
        New
      </button>
    </div>
  )
}
