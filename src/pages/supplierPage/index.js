import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css';
import socket from '../../socket';
import { API_BASE_URL } from '../../config';

const SupplierDashboard = () => {
    const [rfqs, setRfqs] = useState([]);
    const [bidForms, setBidForms] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [placingBid, setPlacingBid] = useState(null); // ID of RFQ being bid on

    useEffect(() => {
        fetchRFQs();

        socket.on('new-rfq', (newRFQ) => {
            setRfqs((prevRfqs) => [newRFQ, ...prevRfqs]);
        });

        socket.on('new-bid', (data) => {
            setRfqs((prevRfqs) => 
                prevRfqs.map(rfq => 
                    rfq.id === data.rfq_id 
                    ? { ...rfq, lowest_bid: Math.min(rfq.lowest_bid === 0 ? Infinity : rfq.lowest_bid || Infinity, data.amount) } 
                    : rfq
                )
            );
        });
        socket.on('rfq-updated', fetchRFQs);

        return () => {
            socket.off('new-rfq');
            socket.off('new-bid');
            socket.off('rfq-updated');
        };
    }, []);

    const fetchRFQs = async () => {
        try {
            const token = Cookies.get('token');
            const res = await axios.get(`${API_BASE_URL}/supplier/rfqs`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRfqs(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching supplier RFQs:', err);
            setError('Failed to load available RFQs. Please check your connection.');
            setLoading(false);
        }
    };

    const handleBidChange = (rfqId, field, value) => {
        setBidForms((prevState) => ({
            ...prevState,
            [rfqId]: {
                carrier_name: '',
                freight_charges: '',
                origin_charges: '',
                destination_charges: '',
                transit_time: '',
                quote_validity: '',
                amount: '',
                ...prevState[rfqId],
                [field]: value,
            },
        }));
    };

    const placeBid = async (rfqId) => {
        const form = bidForms[rfqId] || {};
        if (
            !form.amount ||
            Number(form.amount) <= 0 ||
            !form.carrier_name ||
            !form.transit_time ||
            !form.quote_validity
        ) {
            alert('Please fill all required bid fields.');
            return;
        }

        setPlacingBid(rfqId);
        const token = Cookies.get('token');

        try {
            await axios.post(
                `${API_BASE_URL}/supplier/bid`,
                {
                    rfq_id: rfqId,
                    carrier_name: form.carrier_name,
                    freight_charges: Number(form.freight_charges || 0),
                    origin_charges: Number(form.origin_charges || 0),
                    destination_charges: Number(form.destination_charges || 0),
                    transit_time: form.transit_time,
                    quote_validity: form.quote_validity,
                    amount: Number(form.amount),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert('Bid placed successfully! ✅');
            setBidForms((prevState) => ({ ...prevState, [rfqId]: {} }));
            fetchRFQs(); // Refresh list to show new lowest bid
        } catch (err) {
            alert(err.response?.data?.message || 'Error placing bid. Please try again.');
        } finally {
            setPlacingBid(null);
        }
    };

    if (loading) return <div className="loading-state">Fetching available RFQs...</div>;

    return (
        <div className="supplier-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h2>Supplier Portal</h2>
                    <p>Review active requests and place your best bids.</p>
                </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <div className="rfq-list">
                {rfqs.length === 0 ? (
                    <div className="no-data">No active RFQs available at the moment.</div>
                ) : (
                    rfqs.map((rfq) => (
                        <div key={rfq.id} className="rfq-bid-card">
                            <div className="card-top">
                                <span className="rfq-badge">Active Auction</span>
                                <h3 className="rfq-name">{rfq.rfq_name}</h3>
                                <p className="rfq-id">Reference: #{rfq.id}</p>
                            </div>

                            <div className="bid-info-grid">
                                <div className="info-item">
                                    <span className="label">Current Lowest Bid</span>
                                    <span className="value highlight">₹{rfq.lowest_bid || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Closing Time</span>
                                    <span className="value">
                                        {new Date(rfq.bid_close_time).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="bid-action-area">
                                <input
                                    placeholder="Carrier Name"
                                    value={bidForms[rfq.id]?.carrier_name || ''}
                                    onChange={(e) => handleBidChange(rfq.id, 'carrier_name', e.target.value)}
                                    className="bid-input"
                                />
                                <div className="input-with-currency">
                                    <span className="currency-symbol">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Enter your bid"
                                        value={bidForms[rfq.id]?.amount || ''}
                                        onChange={(e) => handleBidChange(rfq.id, 'amount', e.target.value)}
                                        className="bid-input"
                                    />
                                </div>
                                <input
                                    type="number"
                                    placeholder="Freight Charges"
                                    value={bidForms[rfq.id]?.freight_charges || ''}
                                    onChange={(e) => handleBidChange(rfq.id, 'freight_charges', e.target.value)}
                                    className="bid-input"
                                />
                                <input
                                    type="number"
                                    placeholder="Origin Charges"
                                    value={bidForms[rfq.id]?.origin_charges || ''}
                                    onChange={(e) => handleBidChange(rfq.id, 'origin_charges', e.target.value)}
                                    className="bid-input"
                                />
                                <input
                                    type="number"
                                    placeholder="Destination Charges"
                                    value={bidForms[rfq.id]?.destination_charges || ''}
                                    onChange={(e) => handleBidChange(rfq.id, 'destination_charges', e.target.value)}
                                    className="bid-input"
                                />
                                <input
                                    placeholder="Transit Time"
                                    value={bidForms[rfq.id]?.transit_time || ''}
                                    onChange={(e) => handleBidChange(rfq.id, 'transit_time', e.target.value)}
                                    className="bid-input"
                                />
                                <input
                                    type="date"
                                    value={bidForms[rfq.id]?.quote_validity || ''}
                                    onChange={(e) => handleBidChange(rfq.id, 'quote_validity', e.target.value)}
                                    className="bid-input"
                                />
                                <button 
                                    onClick={() => placeBid(rfq.id)}
                                    disabled={placingBid === rfq.id}
                                    className="place-bid-btn"
                                >
                                    {placingBid === rfq.id ? 'Placing...' : 'Submit Bid'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SupplierDashboard;