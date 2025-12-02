import React from 'react'

interface ErrorBannerProps {
  message: string
  onDismiss: () => void
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffebee',
        border: '1px solid #ef5350',
        color: '#c62828',
        padding: '1rem',
        borderRadius: 8,
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: '#c62828',
          cursor: 'pointer',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          padding: '0 0.5rem'
        }}
      >
        ×
      </button>
    </div>
  )
}
