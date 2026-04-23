import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css';
import socket from '../../socket';

const ViewRFQs = () => {
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRFQs();

        socket.on('new-bid', (data) => {
            setRfqs((prevRfqs) => 
                prevRfqs.map(rfq => 
                    rfq.id === data.rfq_id 
                    ? { ...rfq, lowest_bid: Math.min(rfq.lowest_bid === 0 ? Infinity : rfq.lowest_bid || Infinity, data.amount) } 
                    : rfq
                )
            );
        });

        return () => {
            socket.off('new-bid');
        };
    }, []);

    const fetchRFQs = async () => {
        try {
            const token = Cookies.get('token');
            const res = await axios.get('http://localhost:3001/rfq/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRfqs(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching RFQs:', err);
            setError('Failed to load RFQs. Please check your connection.');
            setLoading(false);
        }
    };

    if (loading) return <div className="view-status">Fetching active RFQs...</div>;
    if (error) return <div className="view-status error">{error}</div>;

    return (
        <div className="view-rfqs-container">
            <div className="view-header">
                <h3>Active RFQs ({rfqs.length})</h3>
                <button className="refresh-btn" onClick={fetchRFQs}>Refresh List</button>
            </div>

            {rfqs.length === 0 ? (
                <div className="no-data">No RFQs found. Create your first one to get started!</div>
            ) : (
                <div className="rfq-grid">
                    {rfqs.map((rfq) => (
                        <div key={rfq.id} className="rfq-card">
                            <div className="rfq-card-header">
                                <span className="rfq-id">#{rfq.id}</span>
                                <span className="rfq-status">Active</span>
                            </div>
                            <h4 className="rfq-name">{rfq.rfq_name}</h4>
                            <div className="rfq-details">
                                <div className="detail-item">
                                    <span className="label">Buyer</span>
                                    <span className="value">{rfq.buyer_name || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Lowest Bid</span>
                                    <span className="value price">₹{rfq.lowest_bid || '0'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Closes At</span>
                                    <span className="value date">
                                        {new Date(rfq.bid_close_time).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button className="view-details-btn">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewRFQs;