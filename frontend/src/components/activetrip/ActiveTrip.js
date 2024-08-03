import React, { useState, useEffect, useRef } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { GoogleMap, DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import Cookies from 'js-cookie';
import Geocode from "react-geocode";
import './ActiveTrip.css'
import PayPalButtonComponent from '../PayPalButtonComponent';

Geocode.setApiKey(process.env.REACT_APP_MAPS_API_KEY);

const mapContainerStyle = {
    height: "35vh",
    width: "100%",
};
const options = {
    disableDefaultUI: true,
    zoomControl: true,
};
const center = {
    lat: 43.473078230478336,
    lng: -80.54225947407059,
};

const pricePerKm = 0.15; // Define your price per km here
const averageVehicleOccupancy = 1.62;
const averageCO2EmissionPerKm = 0.251; // Average CO2 emission per km for a car

export default function ActiveTrip({ setActiveTrip }) {

    const [mapCoords, setMapCoords] = useState({});
    const [routeResp, setRouteResp] = useState();
    const [waypoints, setWaypoints] = useState([]);
    const mapRef = useRef();
    const [amount, setAmount] = useState(0);
    const [isDriver, setIsDriver] = useState(false);
    const [driverNote, setDriverNote] = useState("");
    const [riderNote, setRiderNote] = useState("");
    const [carbonSavings, setCarbonSavings] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);

    const onMapLoad = (map) => {
        mapRef.current = map;
    };

    const directionsCallback = (response) => {
        if (response !== null) {
            if (response.status === 'OK') {
                setRouteResp(response);
                calculateAmount(response);
                calculateCarbonSavings(response);
                calculateDistance(response);
            } else {
                alert('Problem fetching directions');
            }
        } else {
            alert('Problem fetching directions');
        }
    };

    const calculateAmount = (response) => {
        if (response.routes && response.routes.length > 0) {
            const route = response.routes[0];
            let distanceInKm = 0;

            route.legs.forEach(leg => {
                distanceInKm += leg.distance.value / 1000; // Convert meters to kilometers
            });

            const calculatedAmount = distanceInKm * pricePerKm;
            setAmount(Math.floor(calculatedAmount.toFixed(2))); // Set the calculated amount
        }
    };

    const calculateDistance = (response) => {
        if (response.routes && response.routes.length > 0) {
            const route = response.routes[0];
            let distanceInKm = 0;

            route.legs.forEach(leg => {
                distanceInKm += leg.distance.value / 1000; // Convert meters to kilometers
            });

            setTotalDistance(distanceInKm.toFixed(2)); // Set the total distance in kilometers
        }
    };

    const calculateCarbonSavings = (response) => {
        if (response.routes && response.routes.length > 0) {
            const route = response.routes[0];
            let distanceInKm = 0;

            route.legs.forEach(leg => {
                distanceInKm += leg.distance.value / 1000; // Convert meters to kilometers
            });

            const passengerCount = route.legs[0].steps.length; // Number of passengers (excluding the driver)
            const passengerKm = distanceInKm * passengerCount;
            const carbonOffset = (passengerKm / averageVehicleOccupancy) * averageCO2EmissionPerKm;

            const carbonOffsetInKg = carbonOffset / 1000; // Convert grams to kilograms

            setCarbonSavings(carbonOffsetInKg.toFixed(2)); // Set the calculated carbon savings in kilograms
        }
    };

    const getDateandTime = (dtString) => {
        const d = new Date(dtString);
        let date = d.toDateString();
        dtString = d.toTimeString();
        let time = dtString.split(' ')[0].split(':')
        return date + ' @ ' + time[0] + ':' + time[1]
    };

    const setWaypointsFn = (localWaypoints) => {
        localWaypoints.forEach(function(part, index) {
            this[index] = { location: this[index], stopover: false }
        }, localWaypoints);
        setWaypoints(localWaypoints);
    };

    const getLocFromCoords = (coords, type) => {
        let lat = coords['lat'];
        let long = coords['lng'];

        Geocode.fromLatLng(lat, long).then(
            (res) => {
                const location = res.results[0].formatted_address;
                const commaIndex = location.indexOf(',');

                if (commaIndex !== -1) {
                    const formattedLocation = location.substring(commaIndex + 1).trim();

                    if (type === 'src') {
                        setsource(formattedLocation);
                    } else {
                        setdestination(formattedLocation);
                    }
                }
            },
            (err) => {
                console.error(err);
                if (type === 'src') {
                    setsource(lat + ',' + long);
                }
                else {
                    setdestination(lat + ',' + long);
                }
            }
        );
    };

    useEffect(() => {
        fetch(process.env.REACT_APP_END_POINT + '/trip/isdriver', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            }
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
        }).then((responseJson) => {
            if (responseJson.isdriver) {
                setIsDriver(true);
            }
        }).catch((error) => {
            alert(error);
        });
    }, []);

    const handleCancel = (e) => {
        e.preventDefault();

        return fetch(process.env.REACT_APP_END_POINT + '/trip', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            },
        }).then((response) => {
            if (response.ok) {
                setActiveTrip(null);
                alert("Trip cancelled successfully");
                window.location.reload();
                return;
            }
            throw new Error(response.statusText);
        }).catch((error) => {
            console.log(error);
            alert(error);
        });
    };

    const handleDone = (e) => {
        e.preventDefault();

        return fetch(process.env.REACT_APP_END_POINT + '/trip/done', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            },
        }).then((response) => {
            console.log(response);
            if (response.ok) {
                setActiveTrip(null);
                alert("Trip marked completed");
                window.location.reload();
                return;
            }
            throw new Error(response.statusText);
        }).catch((error) => {
            console.log(error);
            alert(error);
        });
    };

    const [source, setsource] = useState("");
    const [destination, setdestination] = useState("");
    const [datetime, setdatetime] = useState("");
    const [driver, setdriver] = useState("");
    const [riders, setriders] = useState("");

    useEffect(() => {
        fetch(process.env.REACT_APP_END_POINT + '/trip/activetrip', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            }
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
        }).then((responseJson) => {
            console.log(responseJson);
            setWaypointsFn(responseJson.waypoints);
            setdatetime(getDateandTime(responseJson.dateTime));
            setdriver(responseJson.driver);
            getLocFromCoords(responseJson.source, 'src');
            getLocFromCoords(responseJson.destination, 'dest');
            let all_riders = responseJson.riders;
            var temp_riders = "";
            for (let i = 0; i < all_riders.length - 1; i++) {
                temp_riders += all_riders[i] + ', ';
            }
            temp_riders += all_riders[all_riders.length - 1];
            if (temp_riders === "") {
                temp_riders = "No rider currently";
            }
            if (responseJson.riders && responseJson.riders.length > 0) {
                const temp_riders = responseJson.riders.join(', ');
                setriders(temp_riders);
            } else {
                setriders("No Riders Yet");
            }

            setDriverNote(responseJson.driver_note || ""); // Set driver note
            setRiderNote(responseJson.rider_note || ""); // Set rider note

            mapCoords['src'] = responseJson.source;
            mapCoords['dst'] = responseJson.destination;
            setMapCoords(mapCoords);
            console.log(mapCoords);

        }).catch((error) => {
            alert(error);
        });
    }, []);

    const handleDriverNoteChange = (e) => {
        setDriverNote(e.target.value);
    };

    const handleRiderNoteChange = (e) => {
        setRiderNote(e.target.value);
    };

    const updateDriverNote = () => {
        fetch(process.env.REACT_APP_END_POINT + '/trip/driverNote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            },
            body: JSON.stringify({ note: driverNote })
        }).then((response) => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }).then((data) => {
            alert("Driver note updated successfully");
        }).catch((error) => {
            alert(error);
        });
    };

    const updateRiderNote = () => {
        fetch(process.env.REACT_APP_END_POINT + '/trip/riderNote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            },
            body: JSON.stringify({ note: riderNote })
        }).then((response) => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }).then((data) => {
            alert("Rider note updated successfully");
        }).catch((error) => {
            alert(error);
        });
    };

    return (
        <>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={15}
                center={center}
                options={options}
                onLoad={onMapLoad}>
                {
                    (routeResp == null && mapCoords['src'] != null && mapCoords['dst'] != null) && (
                        <DirectionsService
                            options={{
                                destination: mapCoords['dst'],
                                origin: mapCoords['src'],
                                travelMode: 'DRIVING',
                                waypoints: waypoints,
                                optimizeWaypoints: true,
                            }}
                            callback={directionsCallback}
                        />
                    )
                }
                {
                    routeResp !== null && (
                        <DirectionsRenderer
                            options={{
                                directions: routeResp
                            }}
                        />
                    )
                }
            </GoogleMap>
            <Container id="activeTripContainer" fluid="lg">
                <Row style={{ marginTop: '1rem' }}>
                    <Col md="10">
                        <h1>Active Trip Details</h1>
                        <Row>

                            <table>
                                <tbody>
                                    <tr>
                                        <td><span className='trip-attributes'>Source</span></td>
                                        <td>{source}</td>
                                    </tr>
                                    <tr>
                                        <td><span className='trip-attributes'>Destination</span></td>
                                        <td>{destination}</td>
                                    </tr>
                                    <tr>
                                        <td><span className='trip-attributes'>Date</span></td>
                                        <td>{datetime}</td>
                                    </tr>
                                    <tr>
                                        <td><span className='trip-attributes'>Driver</span></td>
                                        <td>{driver}</td>
                                    </tr>
                                    <tr>
                                        <td><span className='trip-attributes'>Rider(s)</span></td>
                                        <td>{riders}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Total Distance</b></td>
                                        <td>{totalDistance} km</td>
                                    </tr>
                                    <tr>
                                        <td><span className='trip-attributes'>Amount</span></td>
                                        <td>${amount}</td>
                                    </tr>
                                    <tr>
                                        <td><span className='trip-attributes'>Carbon Savings</span></td>
                                        <td>{carbonSavings} kg CO2</td>
                                    </tr>
                                </tbody>
                            </table>

                            

                            <h3><span className='trip-attributes'>Driver Note</span>:</h3>
                            {isDriver ? (
                                <textarea
                                    value={driverNote}
                                    onChange={handleDriverNoteChange}
                                    placeholder="Add trip related info here"
                                />
                            ) : (
                                <p>{driverNote || "No driver note yet"}</p>
                            )}
                            {isDriver && <Button onClick={updateDriverNote}>Update Driver Note</Button>}
                            <br />

                            <h3><span className='trip-attributes'>Rider Note</span>:</h3>
                            {!isDriver ? (
                                <textarea
                                    value={riderNote}
                                    onChange={handleRiderNoteChange}
                                    placeholder="Add trip related info here"
                                />
                            ) : (
                                <p>{riderNote || "No rider note yet"}</p>
                            )}
                            {!isDriver && <Button onClick={updateRiderNote}>Update Rider Note</Button>}
                            <br />
                        </Row>
                    </Col>
                    <Col md="2">
                        <Row>
                            {isDriver ? (
                                <Button variant='primary' id='doneTripButton' onClick={handleDone}> Done </Button>
                            ) : (
                                amount ? (
                                    <PayPalButtonComponent amount={amount.toString()} />
                                ) : (
                                    <div>Amount is not available</div>
                                )
                            )}
                            <Button variant='danger' id='cancelTripButton' onClick={handleCancel}> Cancel trip </Button>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
