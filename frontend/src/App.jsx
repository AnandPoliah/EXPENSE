// frontend/src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link, // Ensure Link is imported for the navigation bar
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Import Pages
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TransactionList from "./pages/TransactionList.jsx";
import TransactionForm from "./pages/TransactionForm.jsx";
import BudgetsPage from "./pages/BudgetsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import "./App.css";

// Component that enforces authentication
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Main layout component wrapping all protected pages
const Layout = () => {
  const { logout } = useAuth();

  return (
    <div className="app-container">
            {/* Top Navigation Bar */}     {" "}
      <header className="app-header">
               {" "}
        <Link to="/dashboard" className="app-logo">
                    💸 Budget Planner        {" "}
        </Link>
               {" "}
        <nav className="nav-links-container">
                   {" "}
          <Link to="/budgets" className="nav-link">
                        Budgets          {" "}
          </Link>
                   {" "}
          <Link to="/transactions" className="nav-link">
                        Transactions          {" "}
          </Link>
                   {" "}
          <Link to="/profile" className="nav-link">
                        Profile          {" "}
          </Link>
                   {" "}
          <button onClick={logout} className="logout-button">
                        Logout          {" "}
          </button>
                 {" "}
        </nav>
             {" "}
      </header>
            {/* The current route content is rendered here */}     {" "}
      <main className="app-main-content">
                <Outlet />     {" "}
      </main>
         {" "}
    </div>
  );
};

const App = () => {
  return (
    <Router>
           {" "}
      <AuthProvider>
               {" "}
        <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/register" element={<AuthPage />} />
                   {" "}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />     
             {" "}
          {/* Protected Routes - Only accessible if isAuthenticated is true */} 
                 {" "}
          <Route element={<ProtectedRoute />}>
                       {" "}
            <Route element={<Layout />}>
                            {/* FR4: Dashboard - The landing page */}
                            <Route path="/dashboard" element={<Dashboard />} /> 
                          {/* FR3: Budget Management */}
                            <Route path="/budgets" element={<BudgetsPage />} /> 
                          {/* FR2/FR5: Transaction Management */}
                           {" "}
              <Route path="/transactions" element={<TransactionList />} />     
                     {/* ⭐ QUICK-ADD ROUTE CONFIRMATION ⭐ */}
                           {" "}
              <Route path="/transaction/add" element={<TransactionForm />} />
                                         {" "}
              <Route
                path="/transaction/edit/:id"
                element={<TransactionForm />}
              />
                            {/* FR1.3: Profile Management */}
                            <Route path="/profile" element={<ProfilePage />} /> 
                       {" "}
            </Route>
                     {" "}
          </Route>
                    {/* Fallback 404 Route */}
                   {" "}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />     
           {" "}
        </Routes>
             {" "}
      </AuthProvider>
         {" "}
    </Router>
  );
};

export default App;
