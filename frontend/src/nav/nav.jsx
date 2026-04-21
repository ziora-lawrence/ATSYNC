import React from 'react'
import './nav.css'
import { Link } from 'react-router-dom'

const Nav = () => {
  return (
    <div>
        <div className='nav-container'>
            <Link to={"./"}><h1>ATSYNC</h1></Link>
            <ul className='nav-menu'>
                <Link to={"/features"}><li>Features</li></Link>
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