import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PortfolioLayout from './layouts/PortfolioLayout'
import DemoLayout from './layouts/DemoLayout'
import Problem from './pages/portfolio/Problem'
import Approach from './pages/portfolio/Approach'
import Decisions from './pages/portfolio/Decisions'
import Build from './pages/portfolio/Build'
import Login from './pages/Login'
import RoleDashboard from './pages/RoleDashboard'
import RequestorStub from './pages/stubs/RequestorStub'
import RequestorDashboard from './pages/requestor/RequestorDashboard'
import CancellationStub from './pages/stubs/CancellationStub'
import SubmissionConfirmation from './pages/requestor/SubmissionConfirmation'
import ApproverStub from './pages/stubs/ApproverStub'
import ApproverDashboard from './pages/approver/ApproverDashboard'
import ApproverCaseView from './pages/approver/ApproverCaseView'
import DeptAdminStub from './pages/stubs/DeptAdminStub'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PortfolioLayout />}>
          <Route index element={<Problem />} />
          <Route path="approach"  element={<Approach />} />
          <Route path="decisions" element={<Decisions />} />
          <Route path="build"     element={<Build />} />
        </Route>
        <Route path="demo" element={<DemoLayout />}>
          <Route index          element={<Login />} />
          <Route path="dashboard" element={<RoleDashboard />} />
          <Route path="requestor/dashboard" element={<RequestorDashboard />} />
          <Route path="requestor" element={<RequestorStub />} />
          <Route path="requestor/confirm" element={<SubmissionConfirmation />} />
          <Route path="requestor/:moduleId" element={<CancellationStub />} />
          <Route path="approver/dashboard" element={<ApproverDashboard />} />
          <Route path="approver/case/:caseId" element={<ApproverCaseView />} />
          <Route path="approver"  element={<ApproverStub />} />
          <Route path="admin"     element={<DeptAdminStub />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
