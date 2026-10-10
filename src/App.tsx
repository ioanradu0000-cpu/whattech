import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AboutPage } from './pages/AboutPage'
import { BuyPage } from './pages/BuyPage'
import { ComparePage } from './pages/ComparePage'
import { CompatibilityPage } from './pages/CompatibilityPage'
import { DevicePage } from './pages/DevicePage'
import { DevicesPage } from './pages/DevicesPage'
import { FixDevicePage } from './pages/FixDevicePage'
import { HomePage } from './pages/HomePage'
import { NeedPage } from './pages/NeedPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RepairReplacePage } from './pages/RepairReplacePage'
import { ToolsPage } from './pages/ToolsPage'
import { UpgradePage } from './pages/UpgradePage'
import { ValuePage } from './pages/ValuePage'

const ForumPage=lazy(()=>import('./pages/ForumPage').then(module=>({default:module.ForumPage})))
const ForumDetailPage=lazy(()=>import('./pages/ForumDetailPage').then(module=>({default:module.ForumDetailPage})))
const AdminPage=lazy(()=>import('./pages/AdminPage').then(module=>({default:module.AdminPage})))

export function AppRoutes(){return <Suspense fallback={<div className="routeLoading" aria-label="Loading page"/>}><Routes><Route element={<Layout/>}><Route index element={<HomePage/>}/><Route path="tools" element={<ToolsPage/>}/><Route path="tools/will-it-work" element={<CompatibilityPage/>}/><Route path="tools/fix-my-device" element={<FixDevicePage/>}/><Route path="tools/should-i-upgrade" element={<UpgradePage/>}/><Route path="tools/repair-or-replace" element={<RepairReplacePage/>}/><Route path="tools/whats-it-worth" element={<ValuePage/>}/><Route path="tools/what-do-i-need" element={<NeedPage/>}/><Route path="tools/what-should-i-buy" element={<BuyPage/>}/><Route path="tools/compare" element={<ComparePage/>}/><Route path="devices" element={<DevicesPage/>}/><Route path="devices/:brand/:deviceId" element={<DevicePage/>}/><Route path="forum" element={<ForumPage/>}/><Route path="forum/:postId" element={<ForumDetailPage/>}/><Route path="admin" element={<AdminPage/>}/><Route path="about" element={<AboutPage/>}/><Route path="compatibility" element={<Navigate to="/tools/will-it-work" replace/>}/><Route path="diagnose" element={<Navigate to="/tools/fix-my-device" replace/>}/><Route path="decision" element={<Navigate to="/tools/repair-or-replace" replace/>}/><Route path="compare" element={<Navigate to="/tools/compare" replace/>}/><Route path="*" element={<NotFoundPage/>}/></Route></Routes></Suspense>}

export default function App(){return <BrowserRouter><AppRoutes/></BrowserRouter>}
