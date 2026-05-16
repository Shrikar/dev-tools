import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import JsonFormatterPage from './pages/JsonFormatterPage'
import JsonComparePage from './pages/JsonComparePage'
import JsonPathPage from './pages/JsonPathPage'
import JsonEscapePage from './pages/JsonEscapePage'
import YamlJsonConverterPage from './pages/YamlJsonConverterPage'
import CronExpressionHelperPage from './pages/CronExpressionHelperPage'
import JwtDecoderPage from './pages/JwtDecoderPage'
import Base64Page from './pages/Base64Page'
import HashGeneratorPage from './pages/HashGeneratorPage'
import UuidGeneratorPage from './pages/UuidGeneratorPage'
import UrlEncodeDecodePage from './pages/UrlEncodeDecodePage'
import TimestampConverterPage from './pages/TimestampConverterPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/json-formatter" element={<JsonFormatterPage />} />
          <Route path="/json-compare" element={<JsonComparePage />} />
          <Route path="/json-path" element={<JsonPathPage />} />
          <Route path="/json-escape" element={<JsonEscapePage />} />
          <Route path="/yaml-json-converter" element={<YamlJsonConverterPage />} />
          <Route path="/cron-expression-helper" element={<CronExpressionHelperPage />} />
          <Route path="/jwt-decoder" element={<JwtDecoderPage />} />
          <Route path="/base64" element={<Base64Page />} />
          <Route path="/hash-generator" element={<HashGeneratorPage />} />
          <Route path="/uuid-generator" element={<UuidGeneratorPage />} />
          <Route path="/url-encode-decode" element={<UrlEncodeDecodePage />} />
          <Route path="/timestamp-converter" element={<TimestampConverterPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
