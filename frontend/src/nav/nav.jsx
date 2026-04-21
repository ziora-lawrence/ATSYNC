import React from 'react'
import './nav.css'

const Nav = () => {
  return (
    <div>
        <div className='nav-container'>
            <h1>ATSYNC</h1>
            <ul className='nav-menu'>
                <li>Features</li>
                <li>Case Studies</li>
                <li>Pricing</li>
                <li>Login</li>
            </ul>
            <button className='get-started'>
                Get Early Access    
            </button>
        </div>
    </div>
  )
}

export default Nav