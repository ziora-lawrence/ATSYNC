import React from 'react'
import {Routes, Route} from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import Landingpage from './pages/landingpage'
import Agentonboard from './pages/agentonboard'
import Dashboard from './pages/dashboard'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Landingpage/>}/>
        <Route path='/agent-onboard' element={<Agentonboard/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App