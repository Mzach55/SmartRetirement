import { Route, Routes } from 'react-router'
import ContributionPage from '../routes/ContributionPage.tsx'
import DashboardPage from '../routes/DashboardPage.tsx'
import NotFoundPage from '../routes/NotFoundPage.tsx'
import ParticipantChooserPage from '../routes/ParticipantChooserPage.tsx'
import ParticipantLayout from '../routes/ParticipantLayout.tsx'
import PlanDetailPage from '../routes/PlanDetailPage.tsx'
import PlansPage from '../routes/PlansPage.tsx'
import ProfilePage from '../routes/ProfilePage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ParticipantChooserPage />} />

      <Route
        path="/participants/:participantId"
        element={<ParticipantLayout />}
      >
        <Route index element={<DashboardPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="plans/:planId" element={<PlanDetailPage />} />
        <Route
          path="plans/:planId/contribute"
          element={<ContributionPage />}
        />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
