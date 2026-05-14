import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Landingpage from './pages/landingpage'
import Agentonboard from './pages/agentonboard'
import Dashboard from './pages/dashboard'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Landingpage/>}/>
        <Route path='/agent-onboard' element={<Agentonboard/>}/>
      </Routes>
    </>
  )
}

export default App