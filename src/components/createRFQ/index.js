import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css';
import { API_BASE_URL } from '../../config';

const CreateRFQ = () => {
    const [data, setData] = useState({
        rfq_name: '',
        reference_id: '',
        bid_start_time: '',
        bid_close_time: '',
        forced_bid_close_time: '',
        pickup_service_date: '',
        trigger_window_minutes: '10',
        extension_duration_minutes: '5',
        extension_trigger: 'bid_received_last_x',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        const token = Cookies.get('token');

        try {
            const res = await axios.post(
                `${API_BASE_URL}/rfq/create`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({ text: 'RFQ Created Successfully ✅', type: 'success' });
            console.log(res.data);
            // Optional: reset form
            setData({
                rfq_name: '',
                reference_id: '',
                bid_start_time: '',
                bid_close_time: '',
                forced_bid_close_time: '',
                pickup_service_date: '',
                trigger_window_minutes: '10',
                extension_duration_minutes: '5',
                extension_trigger: 'bid_received_last_x',
            });

        } catch (err) {
            setMessage({ 
                text: err.response?.data?.message || 'Failed to create RFQ. Please try again.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-rfq-container">
            <form onSubmit={handleSubmit} className="rfq-creation-form">
                <div className="input-field">
                    <label>RFQ Name</label>
                    <input 
                        name="rfq_name" 
                        value={data.rfq_name}
                        placeholder="e.g. June Logistics Auction" 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="input-field">
                    <label>RFQ Reference ID (optional)</label>
                    <input
                        name="reference_id"
                        value={data.reference_id}
                        placeholder="e.g. RFQ-LOG-2026-04"
                        onChange={handleChange}
                    />
                </div>

                <div className="form-grid">
                    <div className="input-field">
                        <label>Start Time</label>
                        <input 
                            type="datetime-local" 
                            name="bid_start_time" 
                            value={data.bid_start_time}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-field">
                        <label>Close Time</label>
                        <input 
                            type="datetime-local" 
                            name="bid_close_time" 
                            value={data.bid_close_time}
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-field">
                        <label>Forced Close Time</label>
                        <input
                            type="datetime-local"
                            name="forced_bid_close_time"
                            value={data.forced_bid_close_time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <label>Pickup / Service Date</label>
                        <input
                            type="date"
                            name="pickup_service_date"
                            value={data.pickup_service_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-field">
                        <label>Trigger Window (X minutes)</label>
                        <input
                            type="number"
                            min="1"
                            name="trigger_window_minutes"
                            value={data.trigger_window_minutes}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <label>Extension Duration (Y minutes)</label>
                        <input
                            type="number"
                            min="1"
                            name="extension_duration_minutes"
                            value={data.extension_duration_minutes}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="input-field">
                    <label>Extension Trigger</label>
                    <select
                        name="extension_trigger"
                        value={data.extension_trigger}
                        onChange={handleChange}
                        required
                    >
                        <option value="bid_received_last_x">Bid received in last X minutes</option>
                        <option value="any_rank_change_last_x">Any supplier rank change in last X minutes</option>
                        <option value="l1_rank_change_last_x">Lowest bidder (L1) rank change in last X minutes</option>
                    </select>
                </div>

                <button type="submit" className="create-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create RFQ'}
                </button>

                {message.text && (
                    <div className={`form-message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreateRFQ;