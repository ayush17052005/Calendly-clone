import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import Layout from './components/Layout';
import Scheduling from './pages/Scheduling';
import Meetings from './pages/Meetings';
import Availability from './pages/Availability';
import Contacts from './pages/Contacts';


function App() {
  return (
    <Routes>
      <Route path="/booking/:slug" element={<BookingPage />} />
      <Route path="/" element={<Layout />}> 
        {/* Redirect root to scheduling (or whatever default page) */}
        <Route index element={<Navigate to="/scheduling" replace />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="availability" element={<Availability />} />
        <Route path="contacts" element={<Contacts />} />
      </Route>
    </Routes> 
  );
}

export default App;
