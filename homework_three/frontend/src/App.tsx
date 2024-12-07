import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './Home';
import Issuers from './Issuers';
import './App.css';

const App = () => {
    return (
        <BrowserRouter>
            <div>
                <nav className="navbar">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <NavLink
                                to="/"
                                className={({ isActive }) => isActive ? 'active' : ''}
                                end
                            >
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/issuers"
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                Issuers
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/issuers" element={<Issuers />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;