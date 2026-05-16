import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import JsonSuitePage from './pages/JsonSuitePage'
import JwtSuitePage from './pages/JwtSuitePage'
import CronSuitePage from './pages/CronSuitePage'
import YamlJsonConverterPage from './pages/YamlJsonConverterPage'
import RestClientPage from './pages/RestClientPage'
import Base64Page from './pages/Base64Page'
import HashGeneratorPage from './pages/HashGeneratorPage'
import UuidGeneratorPage from './pages/UuidGeneratorPage'
import UrlEncodeDecodePage from './pages/UrlEncodeDecodePage'
import TimestampConverterPage from './pages/TimestampConverterPage'
import { legacyRedirects } from './config/tools'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/json" element={<Navigate to="/json/formatter" replace />} />
          <Route path="/json/:tool" element={<JsonSuitePage />} />

          <Route path="/jwt" element={<Navigate to="/jwt/decoder" replace />} />
          <Route path="/jwt/:tool" element={<JwtSuitePage />} />

          <Route path="/cron" element={<Navigate to="/cron/helper" replace />} />
          <Route path="/cron/:tool" element={<CronSuitePage />} />

          <Route path="/rest-client" element={<RestClientPage />} />
          <Route path="/yaml-json-converter" element={<YamlJsonConverterPage />} />
          <Route path="/base64" element={<Base64Page />} />
          <Route path="/hash-generator" element={<HashGeneratorPage />} />
          <Route path="/uuid-generator" element={<UuidGeneratorPage />} />
          <Route path="/url-encode-decode" element={<UrlEncodeDecodePage />} />
          <Route path="/timestamp-converter" element={<TimestampConverterPage />} />

          {Object.entries(legacyRedirects).map(([oldPath, newPath]) => (
            <Route key={oldPath} path={oldPath} element={<Navigate to={newPath} replace />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
