import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "../config/firebase";
import UserContext from '../UserContext';
import './OperatorProfile_UI';

const Reservation = () => {
  const { user } = useContext(UserContext);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [historyLog, setHistoryLog] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const fetchReservations = async (managementName) => {
    const q = query(collection(db, 'reservations'), where('managementName', '==', managementName));
    try {
      const querySnapshot = await getDocs(q);
      const reservations = querySnapshot.docs.map(doc => {
        const timestamp = doc.data().timestamp.seconds;
        const dateObject = new Date(timestamp * 1000);
        const formattedTime = dateObject.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        
        return {
          id: doc.id,
          name: doc.data().name,
          plateNumber: doc.data().carPlate,
          floor: doc.data().slotId.charAt(0),
          slot: doc.data().slotId.slice(1),
          timeOfRequest: formattedTime,
        };
      });
      setReservationRequests(reservations);
    } catch (error) {
      console.error("Error fetching reservations: ", error);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      if (currentUser && user?.managementName) {
        
        fetchReservations(user.managementName);
      } else {

        setReservationRequests([]);
      }
    });

    return () => unsubscribe();
  }, [user?.managementName]);


  useEffect(() => {
    
    localStorage.setItem('reservationRequests', JSON.stringify(reservationRequests));
  }, [reservationRequests]);

  useEffect(() => {
    
    const storedHistoryLog = JSON.parse(localStorage.getItem('historyLog'));
    if (storedHistoryLog) {
      setHistoryLog(storedHistoryLog);
    }
  }, []);
  const handleReservation = (accepted, name, plateNumber, floor, slot, timeOfRequest, index) => {
    const status = accepted ? 'Accepted' : 'Declined';

    const logEntry = {
      status,
      name,
      plateNumber,
      floor,
      slot,
      timeOfRequest,
    };

    localStorage.setItem('historyLog', JSON.stringify([logEntry, ...historyLog]));

    const updatedRequests = [...reservationRequests];
    updatedRequests.splice(index, 1);
    setReservationRequests(updatedRequests);

    setSelectedReservation({
      status,
      name,
      plateNumber,
      floor,
      slot,
      timeOfRequest,
    });
  };


  const ReservationRequest = ({ request, index }) => (
    <div className="reservation-request mb-4 border p-3 rounded bg-light" key={request.plateNumber}>
      <h4 className="mb-0">Name: {request.name}</h4>
      <p className="text-muted mb-2">Time of Request: {request.timeOfRequest}</p>
      <p>Plate Number: {request.plateNumber}</p>
      <p>Floor Number: {request.floor}</p>
      <p>Slot Number: {request.slot}</p>
      <div className="d-flex flex-column align-items-center mt-2">
        <button className="btn btn-success" onClick={() => handleReservation(true, request.name, request.plateNumber, request.floor, request.slot, request.timeOfRequest, index)}>Accept Reservation</button>
        <button className="btn btn-danger mt-2" onClick={() => handleReservation(false, request.name, request.plateNumber, request.floor, request.slot, request.timeOfRequest, index)}>Decline Reservation</button>
      </div>
    </div>
  );

  return (
    <div className='wrapper'>
      <div className='box'>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
        
    <div className='wrapper' style={{position: 'relative'}}>
      <div className='box'>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
        {/* Moving Car Scene */}
        <div className="moving-car-scene">
        <div className="road">
            <div className="car">🚗</div> {/* Car Emoji */}
            <div className="car2">🚕</div> {/* Car Emoji */}
            <div className="car3">🏍️</div> {/* Car Emoji */}
            <div className="car4">🚙</div> {/* Car Emoji */}
            <div className="car5">🚐</div> {/* Car Emoji */}
        </div>
        <div className="tree tree1"></div>
        <div className="tree tree2"></div>
    </div>
   

      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="ViewSpace">
            SpotWise Parking Management System
          </a>
        </div>
      </nav>
      <div className="container mt-5 d-flex flex-column align-items-center justify-content-center">
        <h2 className="text-center mb-4" style={{color: 'white'}}>Parking Reservation Management</h2>
        <div className="reservation-requests d-flex flex-column align-items-center mb-4" style={{ width: '600px', height:'60vh', overflowY: 'scroll', padding: '10px', background: 'rgba(0, 0, 0, 0.5)'}}>
          {reservationRequests.length === 0 ? (
            <p>No reservation</p>
          ) : (
            reservationRequests.map((request, index) => (
              <ReservationRequest request={request} index={index} key={request.plateNumber} />
            ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
  
};

export default Reservation;