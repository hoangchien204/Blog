import React, { useEffect } from 'react';
import { useLocation, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TabNavigator from './navigators/TabNavigator.tsx';
import Login from './user/AdminPage.tsx';
import './assets/css/style.css';

function RouteLogger() {
  const location = useLocation();

  useEffect(() => {
    console.log('Current path:', location.pathname);
  }, [location]);

  return null;
}

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('admin_token');
  console.log('ProtectedRoute - Token:', token);
  if (!token) {
    console.log('Redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
   
      <Routes>
        <Route path="/*" element={<TabNavigator />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <TabNavigator />
            </ProtectedRoute>
          }
        />
      </Routes>

  );
}

export default App;