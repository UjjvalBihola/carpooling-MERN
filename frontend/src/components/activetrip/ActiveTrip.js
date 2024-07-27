import React, { useState, useEffect, useRef } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { GoogleMap, DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import Cookies from 'js-cookie';
import Geocode from "react-geocode";

import './ActiveTrip.css'

Geocode.setApiKey(process.env.REACT_APP_MAPS_API_KEY);
// Map options
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

const pricePerKm = 0.08; // Define your price per km here

export default function ActiveTrip({ setActiveTrip }) {
    // For Map
    const [mapCoords, setMapCoords] = useState({})
    const [routeResp, setRouteResp] = useState();
    const [waypoints, setWaypoints] = useState([]);
    const mapRef = useRef();
    const [amount, setAmount] = useState(0);
    const [isDriver, setIsDriver] = useState(false);

    const onMapLoad = (map) => {
        mapRef.current = map;
    };

    const directionsCallback = (response) => {
        if (response !== null) {
            if (response.status === 'OK') {
                setRouteResp(response);
                calculateAmount(response);
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

    // Format date and time
    const getDateandTime = (dtString) => {
        const d = new Date(dtString);
        let date = d.toDateString();
        dtString = d.toTimeString();
        let time = dtString.split(' ')[0].split(':')
        return date + ' @ ' + time[0] + ':' + time[1]
    }

    const setWaypointsFn = (localWaypoints) => {
        localWaypoints.forEach(function(part, index) {
            this[index] = {location: this[index], stopover: false}
          }, localWaypoints);
        setWaypoints(localWaypoints);
    }

    // To convert location coordinates into names
    const getLocFromCoords = (coords, type) => {
        let lat = coords['lat']
        let long = coords['lng']

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
                    setsource(lat + ',' + long)
                }
                else {
                    setdestination(lat + ',' + long)
                }
            }
        );
    }

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

    // Handle 'Cancel' button
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
    }

    // Handle 'Done' button
    const handleDone = (e) => {
        e.preventDefault();

        return fetch(process.env.REACT_APP_END_POINT + '/trip/done', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            },
        }).then((response) => {
            console.log(response)
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
    }

    // Active Trip details
    const [source, setsource] = useState("")
    const [destination, setdestination] = useState("")
    const [datetime, setdatetime] = useState("")
    const [driver, setdriver] = useState("")
    const [riders, setriders] = useState("")

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
            console.log(responseJson)
            setWaypointsFn(responseJson.waypoints)
            setdatetime(getDateandTime(responseJson.dateTime))
            setdriver(responseJson.driver)
            getLocFromCoords(responseJson.source, 'src')
            getLocFromCoords(responseJson.destination, 'dest')
            let all_riders = responseJson.riders
            var temp_riders = ""
            for (let i = 0; i < all_riders.length - 1; i++) {
                temp_riders += all_riders[i] + ', '
            }
            temp_riders += all_riders[all_riders.length - 1]
            if (temp_riders === "") {
                temp_riders = "No rider currently"
            }
            if (responseJson.riders && responseJson.riders.length > 0) {
                const temp_riders = responseJson.riders.join(', ');
                setriders(temp_riders);
            } else {
                setriders("No Riders Yet");
            }

            // Set Map Coords
            mapCoords['src'] = responseJson.source
            mapCoords['dst'] = responseJson.destination
            setMapCoords(mapCoords)
            console.log(mapCoords)

        }).catch((error) => {
            alert(error);
        });
    }, []);

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
                            <h3 style={{ marginTop: '1rem' }}><span className='trip-attributes'>Source</span>: {source}</h3>
                            <h3><span className='trip-attributes'>Destination</span>: {destination}</h3>
                            <h3><span className='trip-attributes'>Date</span>: {datetime}</h3>
                            <h3 style={{ marginTop: '1rem' }}><span className='trip-attributes'>Driver</span>: {driver}</h3>
                            <h3><span className='trip-attributes'>Rider(s)</span>: {riders}</h3>
                            <h3><span className='trip-attributes'>Amount</span>: ${amount}</h3>
                        </Row>
                    </Col>
                    <Col md="2">
                        <Row>
                            {isDriver ? (
                                <Button variant='primary' id='doneTripButton' onClick={handleDone}> Done </Button>
                            ) : (
                                // Add Razorpay payment button
                                <div>
                                    <form>
                                        <script src="https://checkout.razorpay.com/v1/payment-button.js" data-payment_button_id="pl_OdMokI0gZrpwWk" async></script>
                                    </form>
                                </div>
                            )}
                            <Button variant='danger' id='cancelTripButton' onClick={handleCancel}> Cancel trip </Button>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
