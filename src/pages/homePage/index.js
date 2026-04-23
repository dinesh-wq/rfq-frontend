import './index.css'
import { Routes, Route, Link } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const BuyerPage = lazy(() => import('../buyerPage/index.js'))
const SupplierPage = lazy(() => import('../supplierPage/index.js'))

const HomeMenu = () => {
    return (
        <main className='main-content'>
            <h1>Select Your Portal</h1>
            <div className='button-group'>
                <Link to="/buyer" className='homepage-button'>
                    <span className="button-icon">📦</span>
                    Buyer Portal
                </Link>
                <Link to="/supplier" className='homepage-button'>
                    <span className="button-icon">💰</span>
                    Seller Portal
                </Link>
            </div>
        </main>
    )
}

const HomePage = ({ setIsLoggedIn }) => {
    return (
        <div className='homepage-container'>
            <nav className='navbar'>
                <p className='nav-brand'>British RFQ System</p>
                <p className='welcome-user' onClick={() => setIsLoggedIn(false)} style={{ cursor: 'pointer' }}>
                    Welcome User (Logout)
                </p>
            </nav>
            <Suspense fallback={<div className="loading-state">Loading portal...</div>}>
                <Routes>
                    <Route path="/" element={<HomeMenu />} />
                    <Route path="/buyer" element={<BuyerPage />} />
                    <Route path="/supplier" element={<SupplierPage />} />
                </Routes>
            </Suspense>
        </div>
    )
}

export default HomePage