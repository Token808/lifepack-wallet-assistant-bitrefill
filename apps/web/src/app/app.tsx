import { Toaster } from '@repo/ui/components/sonner'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { HomePage } from '../pages/home-page'
import { UiKitPage } from '../pages/ui-kit-page'
import { ThemeToggle } from './theme-toggle'

function AppLayout() {
  return (
    <main className="min-h-screen bg-surface-page px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex w-full max-w-6xl justify-end">
        <ThemeToggle />
      </div>
      <Outlet />
      <Toaster />
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="ui-kit" element={<UiKitPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export { App }
