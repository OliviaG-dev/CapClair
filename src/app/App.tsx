import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/AppLayout/AppLayout'
import { CapClairProvider } from '../hooks/CapClairProvider'
import { useCapClairState } from '../hooks/useCapClairState'
import Dashboard from '../pages/Dashboard/Dashboard'
import Handoff from '../pages/Handoff/Handoff'
import Journal from '../pages/Journal/Journal'
import ObjectifDetail from '../pages/ObjectifDetail/ObjectifDetail'
import Objectifs from '../pages/Objectifs/Objectifs'
import Onboarding from '../pages/Onboarding/Onboarding'
import Stats from '../pages/Stats/Stats'
import Synthese from '../pages/Synthese/Synthese'
import './App.css'

function RootRedirect() {
  const { state } = useCapClairState()

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  if (!state.handoffCompleted) {
    return <Navigate to="/synthese" replace />
  }

  return <Navigate to="/dashboard" replace />
}

type RequiresHandoffProps = {
  children: ReactNode
}

function RequiresHandoff({ children }: RequiresHandoffProps) {
  const { state } = useCapClairState()

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  if (!state.handoffCompleted) {
    return <Navigate to="/handoff" replace />
  }

  return children
}

function App() {
  return (
    <CapClairProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<RootRedirect />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="synthese" element={<Synthese />} />
            <Route path="handoff" element={<Handoff />} />
            <Route
              path="dashboard"
              element={
                <RequiresHandoff>
                  <Dashboard />
                </RequiresHandoff>
              }
            />
            <Route
              path="objectifs"
              element={
                <RequiresHandoff>
                  <Objectifs />
                </RequiresHandoff>
              }
            />
            <Route path="objectifs/:id" element={<ObjectifDetail />} />
            <Route
              path="journal"
              element={
                <RequiresHandoff>
                  <Journal />
                </RequiresHandoff>
              }
            />
            <Route
              path="stats"
              element={
                <RequiresHandoff>
                  <Stats />
                </RequiresHandoff>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CapClairProvider>
  )
}

export default App
