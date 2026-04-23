import React from 'react'
import './nav.css'

const Nav = ({ setShowLogin }) => {
  return (
    <div>
        <div className='nav-container'>
            <a href='#hero-section' className='atsync-title'><h1>ATSYNC</h1></a>
            <ul className='nav-menu'>
                <li><a href='#how-it-works'>How It Works</a></li>
                <li><a href='#pricing'>Pricing</a></li>
                <li className='login-btn' onClick={() => setShowLogin(true)}>Login</li>
            </ul>
            <button className='get-started'>
                Join Waitlist    
            </button>
        </div>
    </div>
  )
}

export default Nav