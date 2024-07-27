import React, { useEffect, useState } from 'react';
import Geocode from "react-geocode";
import './AdminPanel.css';

Geocode.setApiKey(process.env.REACT_APP_MAPS_API_KEY);

const AdminPanel = () => {
    const [trips, setTrips] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchTripsAndUsers = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const [tripsResponse, usersResponse] = await Promise.all([
                    fetch(process.env.REACT_APP_END_POINT + '/admin/trips', {
                        headers: {
                            'Authorization': localStorage.getItem('adminToken')

                        }
                    }),
                    fetch(process.env.REACT_APP_END_POINT + '/admin/users', {
                        headers: {
                            'Authorization': localStorage.getItem('adminToken')

                        }
                    }),
                ]);

                if (!tripsResponse.ok || !usersResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const tripsData = await tripsResponse.json();
                const usersData = await usersResponse.json();

                // Convert coordinates to addresses for trips
                for (let trip of tripsData) {
                    const originAddress = await Geocode.fromLatLng(trip.source.lat, trip.source.lng);
                    const destinationAddress = await Geocode.fromLatLng(trip.destination.lat, trip.destination.lng);
                    trip.sourceAddress = originAddress.results[0].formatted_address;
                    trip.destinationAddress = destinationAddress.results[0].formatted_address;
                }

                setTrips(tripsData);
                setUsers(usersData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load data. Please try again.');
                setLoading(false);
            }
        };

        fetchTripsAndUsers();
    }, []);

    const handleCloseModal = () => {
        setSelectedTrip(null);
        setSelectedUser(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="admin-panel">
            <h1>Welcome to the Admin Panel</h1>
            <div className="container">
                <section className="table-container">
                    <h2>Trips</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Origin</th>
                                <th>Destination</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map(trip => (
                                <tr key={trip._id}>
                                    <td>{trip._id}</td>
                                    <td>
                                        <a href={`https://maps.google.com/?q=${trip.source.lat},${trip.source.lng}`} target="_blank" rel="noopener noreferrer">
                                            {trip.sourceAddress || `Lat: ${trip.source.lat}, Lng: ${trip.source.lng}`}
                                        </a>
                                    </td>
                                    <td>
                                        <a href={`https://maps.google.com/?q=${trip.destination.lat},${trip.destination.lng}`} target="_blank" rel="noopener noreferrer">
                                            {trip.destinationAddress || `Lat: ${trip.destination.lat}, Lng: ${trip.destination.lng}`}
                                        </a>
                                    </td>
                                    <td>{new Date(trip.dateTime).toLocaleString()}</td>
                                    <td>{trip.completed ? 'Completed' : 'In Progress'}</td>
                                    <td>
                                        <button onClick={() => setSelectedTrip(trip)}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <section className="table-container">
                    <h2>Users</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user._id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button onClick={() => setSelectedUser(user)}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>

            {(selectedTrip || selectedUser) && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={handleCloseModal}>&times;</span>
                        {selectedTrip && (
                            <>
                                <h2>Trip Details</h2>
                                <p><strong>ID:</strong> {selectedTrip._id}</p>
                                <p><strong>Origin:</strong> <a href={`https://maps.google.com/?q=${selectedTrip.source.lat},${selectedTrip.source.lng}`} target="_blank" rel="noopener noreferrer">{selectedTrip.sourceAddress}</a></p>
                                <p><strong>Destination:</strong> <a href={`https://maps.google.com/?q=${selectedTrip.destination.lat},${selectedTrip.destination.lng}`} target="_blank" rel="noopener noreferrer">{selectedTrip.destinationAddress}</a></p>
                                <p><strong>Date:</strong> {new Date(selectedTrip.dateTime).toLocaleString()}</p>
                                <p><strong>Status:</strong> {selectedTrip.completed ? 'Completed' : 'In Progress'}</p>
                            </>
                        )}
                        {selectedUser && (
                            <>
                                <h2>User Details</h2>
                                <p><strong>ID:</strong> {selectedUser._id}</p>
                                <p><strong>Name:</strong> {selectedUser.name}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
