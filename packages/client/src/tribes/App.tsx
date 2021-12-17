import React from "react"
import "./styles/App.css"
import { Routes, Route, matchRoutes } from "react-router-dom"
import CollectionPage from "./tribes-copy"
import AllTribes from "./all-tribes-copy"
import MyTribe from "./my-tribe-copy"

function App() {
  return (
    <Routes>
      <Route path="/" element={<CollectionPage />} />
      <Route path="/all-tribes-copy" element={<AllTribes />} />
      <Route path="/my-tribe-copy" element={<MyTribe />} />
    </Routes>
  )
}

export default App
