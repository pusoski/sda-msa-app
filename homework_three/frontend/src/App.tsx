import {BrowserRouter, Routes, Route, NavLink} from 'react-router-dom';
import Home from './Home';
import Issuers from './Issuers';
import DataAnalyses from './DataAnalyses';
import DataReports from './DataReports';
import Personalization from './Personalization';
import './assets/css/App.css';

const App = () => {
    return (
        <BrowserRouter>
            <div className="view">
                <div className="nav-bar-container">
                    <div className="nav-bar-container-header">
                        <img className="nav-bar-logo" alt="MSA logotype" src="/msa-logotype.svg"/>
                        <ul className="nav-bar-top-list">
                            <li className="nav-bar-top-item">
                                <NavLink
                                    to="/"
                                    className={({isActive}) =>
                                        `nav-bar-top-item-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <img className="nav-bar-top-item-icon" alt="Rocket launch icon"
                                         src="/get-started-icon.svg"/>
                                    Get Started
                                </NavLink>
                            </li>
                            <li className="nav-bar-top-item">
                                <NavLink
                                    to="/issuers-list"
                                    className={({isActive}) =>
                                        `nav-bar-top-item-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <img className="nav-bar-top-item-icon" alt="Table icon"
                                         src="/issuers-list-icon.svg"/>
                                    Issuers List
                                </NavLink>
                            </li>
                            <li className="nav-bar-top-item">
                                <NavLink
                                    to="/data-analyses"
                                    className={({isActive}) =>
                                        `nav-bar-top-item-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <img className="nav-bar-top-item-icon" alt="Chart icon"
                                         src="/data-analyses-icon.svg"/>
                                    Data Analyses
                                </NavLink>
                            </li>
                            <li className="nav-bar-top-item">
                                <NavLink
                                    to="/data-reports"
                                    className={({isActive}) =>
                                        `nav-bar-top-item-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <img className="nav-bar-top-item-icon" alt="Files icon"
                                         src="/generated-reports-icon.svg"/>
                                    Data Reports
                                </NavLink>
                            </li>
                            <li className="nav-bar-top-item">
                                <NavLink
                                    to="/personalization"
                                    className={({isActive}) =>
                                        `nav-bar-top-item-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <img className="nav-bar-top-item-icon" alt="Dashboard icon"
                                         src="/personalization-icon.svg"/>
                                    Personalization
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                    <ul className="nav-bar-bottom-list">
                        <li className="nav-bar-bottom-item">
                            <a
                                href="https://github.com/pusoski/sda-msa-app/"
                                target="_blank"
                                className="nav-bar-bottom-item-link"
                            >
                                <img className="nav-bar-bottom-item-icon" alt="Deployed code icon"
                                     src="/source-code-icon.svg"/>
                                Source Code
                                <img className="new-tab-icon" alt="New-tab icon"
                                     src="/new-tab-icon.svg"/>
                            </a>
                        </li>
                        <li className="nav-bar-bottom-item">
                            <a
                                href="https://mse.mk/en"
                                target="_blank"
                                className="nav-bar-bottom-item-link"
                            >
                                <img className="nav-bar-bottom-item-icon" alt="Database icon"
                                     src="/data-source-icon.svg"/>
                                Data Source
                                <img className="new-tab-icon" alt="New-tab icon"
                                     src="/new-tab-icon.svg"/>
                            </a>
                        </li>
                    </ul>
                </div>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/issuers-list" element={<Issuers/>}/>
                    <Route path="/data-analyses" element={<DataAnalyses/>}/>
                    <Route path="/data-reports" element={<DataReports/>}/>
                    <Route path="/personalization" element={<Personalization/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;