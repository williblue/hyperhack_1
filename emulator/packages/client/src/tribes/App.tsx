import React from 'react';
import './styles/App.css';
import { Routes, Route } from "react-router-dom";
import TribesPage from './tribes';
import AllTribes from './all-tribes'
import MyTribe from './my-tribe'

function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<TribesPage />} />
                <Route path="/all-tribes" element={<AllTribes />} />
                <Route path="/my-tribe" element={<MyTribe />} />
            </Routes>
        </div>
    );
}

export default App;
