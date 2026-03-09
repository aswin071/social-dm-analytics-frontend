import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DMExplorer from './pages/DMExplorer'
import ProductIntelligence from './pages/ProductIntelligence'
import Insights from './pages/Insights'
import CatalogManagement from './pages/CatalogManagement'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="messages" element={<DMExplorer />} />
        <Route path="products/:id" element={<ProductIntelligence />} />
        <Route path="insights" element={<Insights />} />
        <Route path="catalog" element={<CatalogManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}
