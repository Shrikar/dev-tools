import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import JSONFormatter from './tools/JSONFormatter'
import JSONCompare from './tools/JSONCompare'
import JWTDecoder from './tools/JWTDecoder'
import Base64Tool from './tools/Base64Tool'
import HashGenerator from './tools/HashGenerator'
import UUIDGenerator from './tools/UUIDGenerator'
import URLEncodeDecode from './tools/URLEncodeDecode'
import TimestampConverter from './tools/TimestampConverter'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="sidebar">
          <h2>Dev Tools</h2>
          <ul>
            <li><Link to="/json-formatter">JSON Formatter</Link></li>
            <li><Link to="/json-compare">JSON Compare</Link></li>
            <li><Link to="/jwt-decoder">JWT Decoder</Link></li>
            <li><Link to="/base64">Base64</Link></li>
            <li><Link to="/hash">Hash Generator</Link></li>
            <li><Link to="/uuid">UUID Generator</Link></li>
            <li><Link to="/url">URL Encode/Decode</Link></li>
            <li><Link to="/timestamp">Timestamp Converter</Link></li>
          </ul>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<div>Choose a tool from the sidebar.</div>} />
            <Route path="/json-formatter" element={<JSONFormatter />} />
            <Route path="/json-compare" element={<JSONCompare />} />
            <Route path="/jwt-decoder" element={<JWTDecoder />} />
            <Route path="/base64" element={<Base64Tool />} />
            <Route path="/hash" element={<HashGenerator />} />
            <Route path="/uuid" element={<UUIDGenerator />} />
            <Route path="/url" element={<URLEncodeDecode />} />
            <Route path="/timestamp" element={<TimestampConverter />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
