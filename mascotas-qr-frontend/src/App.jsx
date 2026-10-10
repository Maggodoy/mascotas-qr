import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicScan from './pages/PublicScan';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PetForm from './pages/PetForm'; // <--- Acá estaba el detalle (se llamaba AddPet)
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scan/:qrCode" element={<PublicScan />} />
        <Route path="/p/:qrCode" element={<PublicScan />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pets/new" element={<PetForm />} />
        <Route path="/pets/edit/:id" element={<PetForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;