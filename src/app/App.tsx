import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/AppLayout/AppLayout'
import { CapClairProvider } from '../hooks/CapClairProvider'
import { useCapClairState } from '../hooks/useCapClairState'
import Dashboard from '../pages/Dashboard/Dashboard'
import Journal from '../pages/Journal/Journal'
import ObjectifDetail from '../pages/ObjectifDetail/ObjectifDetail'
import Objectifs from '../pages/Objectifs/Objectifs'
import Onboarding from '../pages/Onboarding/Onboarding'
import Stats from '../pages/Stats/Stats'
import Synthese from '../pages/Synthese/Synthese'
import './App.css'

function RootRedirect() {
  const { state } = useCapClairState()
  return <Navigate to={state.synthesis ? '/dashboard' : '/onboarding'} replace />
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
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="objectifs" element={<Objectifs />} />
            <Route path="objectifs/:id" element={<ObjectifDetail />} />
            <Route path="journal" element={<Journal />} />
            <Route path="stats" element={<Stats />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CapClairProvider>
  )
}

export default App
