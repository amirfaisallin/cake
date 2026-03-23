import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import OrderPage from './pages/OrderPage'
import TrackPage from './pages/TrackPage'
import GalleryPage from './pages/GalleryPage'
import DeliveryPage from './pages/DeliveryPage'
import ContactPage from './pages/ContactPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

