import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PortfolioLayout from './layouts/PortfolioLayout'
import DemoLayout from './layouts/DemoLayout'
import Problem from './pages/portfolio/Problem'
import Build from './pages/portfolio/Build'
import Tradeoffs from './pages/portfolio/Tradeoffs'
import Login from './pages/Login'
import RoleDashboard from './pages/RoleDashboard'
import RequireRequestor from './components/RequireRequestor'
import RequestorStub from './pages/stubs/RequestorStub'
import RequestorDashboard from './pages/requestor/RequestorDashboard'
import CancellationStub from './pages/stubs/CancellationStub'
import SubmissionConfirmation from './pages/requestor/SubmissionConfirmation'
import ApproverStub from './pages/stubs/ApproverStub'
import ApproverDashboard from './pages/approver/ApproverDashboard'
import ApproverCaseView from './pages/approver/ApproverCaseView'
import DAdminModuleView from './pages/admin/DAdminModuleView'
import DAdminCasesView from './pages/admin/DAdminCasesView'
import DAdminCaseDetail from './pages/admin/DAdminCaseDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PortfolioLayout />}>
          <Route index element={<Problem />} />
          <Route path="build"      element={<Build />} />
          <Route path="tradeoffs"  element={<Tradeoffs />} />
        </Route>
        <Route path="demo" element={<DemoLayout />}>
          <Route index          element={<Login />} />
          <Route path="dashboard" element={<RoleDashboard />} />
          <Route element={<RequireRequestor />}>
            <Route path="requestor/dashboard" element={<RequestorDashboard />} />
            <Route path="requestor" element={<RequestorStub />} />
            <Route path="requestor/confirm" element={<SubmissionConfirmation />} />
            <Route path="requestor/:moduleId" element={<CancellationStub />} />
          </Route>
          <Route path="approver/dashboard" element={<ApproverDashboard />} />
          <Route path="approver/case/:caseId" element={<ApproverCaseView />} />
          <Route path="approver"  element={<ApproverStub />} />
          <Route path="admin"     element={<DAdminModuleView />} />
          <Route path="admin/module/:moduleId" element={<DAdminCasesView />} />
          <Route path="admin/case/:caseId"     element={<DAdminCaseDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
