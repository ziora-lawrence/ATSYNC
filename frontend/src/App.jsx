import React from 'react'
import Nav from './nav/nav'
import {Routes, Route} from 'react-router-dom'
import Landingpage from './pages/landingpage'
import Features from './pages/features'


const App = () => {
  return (
    <>
    <Nav/>
    <Routes>
      <Route path='/' element={<Landingpage/>}/>
      <Route path='/features' element={<Features/>}/>
    </Routes>
    </>
  )
}

export default App