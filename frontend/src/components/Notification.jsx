import React from 'react'

const Notification = ({ showNotification }) => {
  return (
    <div className={`notification-container ${showNotification ? 'show' : ''}`}>
       <p>⚠️ Already guessed this letter!</p>
    </div>
  )
}

export default Notification;