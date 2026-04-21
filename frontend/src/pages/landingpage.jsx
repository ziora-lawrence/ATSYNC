import React from 'react'
import './landingpage.css'

const Landingpage = () => {
  return (
    <div className='landing-page'>
        <section className='hero'>
            <div className='hero-text'>
                <h1>
                    The Future of Client<br/>
                    Relations for
                </h1>
                <p>Ai powered communication that automates onboarding and<br/>  updates, so you can focus on the work</p>
                <div className='hero-buttons'>
                    <button className='get-early-access'>Get Early Access</button>
                    <button className='watch-demo'>Watch Demo</button>
                </div>
            </div>
            <div className='hero-image'>
                <img src="" alt="idk what should be here tbh"/>
            </div>
        </section>
    </div>
  )
}

export default Landingpage