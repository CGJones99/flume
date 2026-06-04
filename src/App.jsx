import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import RoleDashboard from './pages/RoleDashboard'
import RequestorStub from './pages/stubs/RequestorStub'
import ApproverStub from './pages/stubs/ApproverStub'
import DeptAdminStub from './pages/stubs/DeptAdminStub'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Login />} />
          <Route path="/dashboard" element={<RoleDashboard />} />
          <Route path="/requestor" element={<RequestorStub />} />
          <Route path="/approver"  element={<ApproverStub />} />
          <Route path="/admin"     element={<DeptAdminStub />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
