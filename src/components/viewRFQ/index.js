import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css';
import socket from '../../socket';
import { API_BASE_URL } from '../../config';

const ViewRFQs = () => {
    const [rfqs, setRfqs] = useState([]);
    const [selectedRfq, setSelectedRfq] = useState(null);
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
        socket.on('new-rfq', fetchRFQs);
        socket.on('rfq-updated', fetchRFQs);

        return () => {
            socket.off('new-bid');
            socket.off('new-rfq');
            socket.off('rfq-updated');
        };
    }, []);

    const fetchRFQs = async () => {
        try {
            const token = Cookies.get('token');
            const res = await axios.get(`${API_BASE_URL}/rfq/all`, {
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

    const fetchRFQDetails = async (rfqId) => {
        try {
            const token = Cookies.get('token');
            const res = await axios.get(`${API_BASE_URL}/rfq/${rfqId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedRfq(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Unable to load RFQ details');
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
                                <div className="detail-item">
                                    <span className="label">Forced Close</span>
                                    <span className="value date">
                                        {new Date(rfq.forced_close_time).toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Status</span>
                                    <span className="value">{rfq.auction_status}</span>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button className="view-details-btn" onClick={() => fetchRFQDetails(rfq.id)}>View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedRfq && (
                <div className="rfq-card" style={{ marginTop: '1.5rem' }}>
                    <div className="rfq-card-header">
                        <span className="rfq-id">Details</span>
                        <button className="refresh-btn" onClick={() => setSelectedRfq(null)}>Close</button>
                    </div>
                    <h4 className="rfq-name">{selectedRfq.rfq_name}</h4>
                    <p>Trigger Window: {selectedRfq.trigger_window_minutes} mins | Extension: {selectedRfq.extension_duration_minutes} mins</p>
                    <p>Trigger Rule: {selectedRfq.extension_trigger}</p>
                    <h4>Bids (Lowest first)</h4>
                    {selectedRfq.bids.length === 0 ? <p>No bids yet</p> : selectedRfq.bids.map((bid) => (
                        <p key={bid.id}>
                            {bid.rank} - {bid.supplier_name}: ₹{bid.total_amount} | Carrier: {bid.carrier_name} | Freight: ₹{bid.freight_charges} | Origin: ₹{bid.origin_charges} | Destination: ₹{bid.destination_charges} | Transit: {bid.transit_time} | Validity: {new Date(bid.quote_validity).toLocaleDateString()}
                        </p>
                    ))}
                    <h4>Activity Log</h4>
                    {selectedRfq.logs.length === 0 ? <p>No activity yet</p> : selectedRfq.logs.map((log) => (
                        <p key={log.id}>
                            {new Date(log.created_at).toLocaleString()} - {log.event_type}: {log.description}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewRFQs;