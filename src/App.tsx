import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '@/store';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import RoleSelectPage from '@/pages/RoleSelectPage';
import CitizenPage from '@/pages/CitizenPage';
import ReportEmergencyPage from '@/pages/ReportEmergencyPage';
import TrackRequestPage from '@/pages/TrackRequestPage';
import ResponsePage from '@/pages/ResponsePage';
import RescuePage from '@/pages/RescuePage';
import HospitalPage from '@/pages/HospitalPage';
import MapPage from '@/pages/MapPage';
import MissingPersonsPage from '@/pages/MissingPersonsPage';
import ResourcesPage from '@/pages/ResourcesPage';
import MessagesPage from '@/pages/MessagesPage';
import ReplanningPage from '@/pages/ReplanningPage';
import CompetingEmergenciesPage from '@/pages/CompetingEmergenciesPage';
import SOSSignalPage from '@/pages/SOSSignalPage';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/role" element={<RoleSelectPage />} />
            <Route path="/citizen" element={<CitizenPage />} />
            <Route path="/emergency" element={<CitizenPage />} />
            <Route path="/sos" element={<SOSSignalPage />} />
            <Route path="/emergency/report" element={<ReportEmergencyPage />} />
            <Route path="/emergency/track" element={<TrackRequestPage />} />
            <Route path="/response" element={<ResponsePage />} />
            <Route path="/rescue" element={<RescuePage />} />
            <Route path="/hospital" element={<HospitalPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/missing" element={<MissingPersonsPage />} />
            <Route path="/missing/report" element={<MissingPersonsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/replanning" element={<ReplanningPage />} />
            <Route path="/competing" element={<CompetingEmergenciesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
