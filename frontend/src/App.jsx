import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home';
import Browse from './components/Browse';
import Dashboard from './components/Dashboard';
import Auctions from './components/Auctions';
import CreateAuction from './components/CreateAuction';
import AuthPage from './components/AuthPage';
import HelpCenter from './components/HelpCenter';
import { PrivateRoute, PublicOnlyRoute } from './components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/auth"
            element={
              <PublicOnlyRoute>
                <AuthPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="/browse" element={<Browse />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auctions/:id" element={<Browse />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin", "buyer_seller"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-auction"
            element={
              <PrivateRoute allowedRoles={["admin", "buyer_seller"]}>
                <CreateAuction />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
