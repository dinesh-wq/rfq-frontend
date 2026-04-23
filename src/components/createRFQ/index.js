import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css';
import { API_BASE_URL } from '../../config';

const CreateRFQ = () => {
    const [data, setData] = useState({
        rfq_name: '',
        bid_start_time: '',
        bid_close_time: '',
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
                bid_start_time: '',
                bid_close_time: '',
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