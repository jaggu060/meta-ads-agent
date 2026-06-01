import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import NewCampaign from './pages/NewCampaign'
import Evaluate from './pages/Evaluate'
import Nav from './components/Nav'

export default function App() {
  const [configured, setConfigured] = useState(
    () => !!localStorage.getItem('ads_configured')
  )

  if (!configured) {
    return <Setup onDone={() => setConfigured(true)} />
  }

  return (
    <BrowserRouter>
      <div style={{ paddingBottom: 72 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewCampaign />} />
          <Route path="/evaluate" element={<Evaluate />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Nav />
    </BrowserRouter>
  )
}
