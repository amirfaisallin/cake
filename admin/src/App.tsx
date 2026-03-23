import React from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AdminLayout } from '@/components/admin-layout'

import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminFoodListPage from './pages/AdminFoodListPage'
import AdminFoodItemsPage from './pages/AdminFoodItemsPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AdminMenuPage from './pages/AdminMenuPage'
import AdminDeliveryPage from './pages/AdminDeliveryPage'
import AdminSettingsPage from './pages/AdminSettingsPage'

function AdminRoot() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRoot />}>
        <Route index element={<AdminLoginPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="food-list" element={<AdminFoodListPage />} />
        <Route path="food-items" element={<AdminFoodItemsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="menu" element={<AdminMenuPage />} />
        <Route path="delivery" element={<AdminDeliveryPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

