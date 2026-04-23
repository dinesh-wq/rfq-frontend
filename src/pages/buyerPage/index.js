import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const ViewRFQs = lazy(() => import('../../components/viewRFQ'));
const CreateRFQ = lazy(() => import('../../components/createRFQ'));

const BuyerDashboard = () => {
    const [activeTab, setActiveTab] = useState('view');
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h2>Buyer Dashboard</h2>
                    <p>Manage your RFQs and track active auctions.</p>
                </div>
                <div className="tab-navigation">
                    <button
                        className="tab-btn"
                        onClick={() => navigate('/')}
                    >
                        Back
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                        onClick={() => setActiveTab('view')}
                    >
                        View Active RFQs
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create New RFQ
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <Suspense fallback={<div className="loading-state">Loading component...</div>}>
                    {activeTab === 'view' && <ViewRFQs />}
                    {activeTab === 'create' && <CreateRFQ />}
                </Suspense>
            </main>
        </div>
    );
};

export default BuyerDashboard;