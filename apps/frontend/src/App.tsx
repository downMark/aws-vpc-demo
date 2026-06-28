import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import TokenManager from './pages/TokenManager'
import { ProfileEditor } from './pages/ProfileEditor'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900">GitHub Profile Manager</h1>
            <nav className="flex gap-4">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Token 管理
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Profile 编辑
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<TokenManager />} />
            <Route path="/profile" element={<ProfileEditor />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
