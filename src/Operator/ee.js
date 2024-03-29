import React, { useState, useEffect, useContext, useMemo} from 'react';
import { Button, Modal, Form} from 'react-bootstrap';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { Link, } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { db } from "../config/firebase";
import { collection, getDocs, query, where, serverTimestamp,addDoc, setDoc, doc, getDoc, onSnapshot} from 'firebase/firestore';
import SearchForm from './SearchForm';
import UserContext from '../UserContext';
import { useNavigate } from 'react-router-dom';
import './space.css';


const ParkingSlot = () => {
    const styles = {
        welcomeMessage: {
          position: "absolute",
          top: "10px",
          right: "10px",
          margin: "0",
          color: "#fff",
          fontFamily: "Rockwell, sans-serif",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        },
        icon: {
          marginRight: "5px",
        },
      };
      const { user } = useContext(UserContext);
  const maxZones = 5;
  const initialSlotSets = [{ title: 'Zone 1', slots: Array(15).fill(false) }];
  
  const initialTotalSpaces = initialSlotSets.map(zone => zone.slots.length).reduce((total, spaces) => total + spaces, 0);

  const [slotSets, setSlotSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalParkingSpaces = slotSets.reduce((total, slotSet) => total + slotSet.slots.length, 0);
const availableParkingSpaces = slotSets.reduce((available, slotSet) => {
  return available + slotSet.slots.filter(slot => !slot.occupied).length;
}, 0);

const saveSlotsToLocalStorage = (managementName, slots) => {
  try {
    localStorage.setItem(`slotSets_${managementName}`, JSON.stringify(slots));
    console.log('Saved slots to local storage for:', managementName);
  } catch (error) {
    console.error('Error saving slots to local storage:', error);
  }
};

const loadSlotsFromLocalStorage = (managementName) => {
  try {
    const savedSlots = localStorage.getItem(`slotSets_${managementName}`);
    return savedSlots ? JSON.parse(savedSlots) : [];
  } catch (error) {
    console.error('Error loading slots from local storage:', error);
    return [];
  }
};

useEffect(() => {
  const managementName = user?.managementName;
  if (managementName) {
    const savedSlots = loadSlotsFromLocalStorage(managementName);
    if (savedSlots.length > 0) {
      setSlotSets(savedSlots);
      console.log('Loaded slots from local storage:', savedSlots);
    } else {
      fetchData(managementName); 
    }
  }
}, []); 


const savedSlots = useMemo(() => loadSlotsFromLocalStorage(), []);

const fetchData = async (managementName) => {
  if (!user || !user.managementName) {
    console.log('No user logged in or management name is missing');
    return;
  }

  let occupiedSlots = new Map(); 

  try {
    const parkingLogsRef = collection(db, 'logs');
    const parkingLogsQuery = query(parkingLogsRef, where('managementName', '==', user.managementName), where('timeOut', '==', null));
  
    const unsubLogs = onSnapshot(parkingLogsQuery, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => doc.data());

      occupiedSlots = new Map();
      snapshot.forEach(doc => {
        const data = doc.data();
        occupiedSlots.set(data.slotId, doc.id); 
      });
      console.log(snapshot.docs.map(doc => doc.data()));
    });

    const collectionRef = collection(db, 'establishments');
    const q = query(collectionRef, where('managementName', '==', user.managementName));
  
    const unsubEstablishments = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const newEstablishmentData = snapshot.docs.map(doc => doc.data());
        const establishmentData = snapshot.docs[0].data();
  
        let newSlotSets = [];
  
        if (Array.isArray(establishmentData.floorDetails) && establishmentData.floorDetails.length > 0) {
          newSlotSets = establishmentData.floorDetails.map(floor => ({
            title: floor.floorName,
            slots: Array.from({ length: parseInt(floor.parkingLots) }, (_, i) => ({ id: i })),
          }));
        } else if (establishmentData.totalSlots) {
          newSlotSets = [{
            title: 'General Parking',
            slots: Array.from({ length: parseInt(establishmentData.totalSlots) }, (_, i) => ({ id: i })),
          }];
        }
        console.log('New Slot Sets:', newSlotSets);
  
        newSlotSets.forEach((slotSet) => {
          slotSet.slots.forEach((slot) => {
            if (occupiedSlots.has(slot.id)) {
              slot.occupied = true;
              slot.logDocId = occupiedSlots.get(slot.id);
            } else {
              slot.occupied = false;
            }
          });
        });
  
        setSlotSets(newSlotSets);
        saveSlotsToLocalStorage(newSlotSets);
  
        if (savedSlots.length > 0) {
          setSlotSets(savedSlots);
          console.log('Loaded slots from local storage:', savedSlots);
        }
      } else {
        console.log('No such establishment!');
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setIsLoading(false);
  }
};


  
  useEffect(() => {
    const managementName = user?.managementName;
    if (managementName && slotSets.length > 0) {
      saveSlotsToLocalStorage(managementName, slotSets);
    }
  }, [slotSets, user?.managementName]); 
  
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [zoneAvailableSpaces, setZoneAvailableSpaces] = useState(
    initialSlotSets.map(zone => zone.slots.length)
  );

  const [recordFound, setRecordFound] = useState(true); 
  const [userFound, setUserFound] = useState(true);
  const searchInFirebase = async (searchInput) => {
    try {
      const collectionRef = collection(db, 'user');
      const q = query(collectionRef, where('carPlateNumber', '==', searchInput));
      const querySnapshot = await getDocs(q);
  
      const user = querySnapshot.docs.find(doc => doc.data().carPlateNumber === searchInput);
  
      if (user) {
        console.log('Found user:', user.data());
        setUserPlateNumber(user.data().carPlateNumber);
        setUserDetails(user.data());
        setUserFound(true);
      } else {
        console.log('User not found.');
        setUserDetails({}); 
        setUserPlateNumber(searchInput);
        setUserFound(false); 
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const navigate = useNavigate();

  const handleButtonClick = () => {
  navigate("/Reservation");
 };

  const rows = 5;
  const cols = 3;

  const handleNext = () => {
    if (currentSetIndex < slotSets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
    }
  };

  const [showModal, setShowModal] = useState(false); 
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedPlateNumber, setSelectedPlateNumber] = useState(""); 
  const [agent, setAgentName] = useState (user.firstName || "");
  const [agentL, setAgentLName] = useState (user.lastName || "");
  const [managementName, setManagementName] = useState (user.managementName || "");
  const fullName = `${agent} ${agentL}`;
  const [errorMessage, setErrorMessage] = useState("");
  
  const addToLogs = async (userDetails, slotNumber) => {
    try {
      const logsCollectionRef = collection(db, 'logs'); 
      const timestamp = serverTimestamp();
      const logData = {
        ...userDetails,
        slotNumber, // Add slotNumber to log data
        status: 'Occupied', // Add status to log data
        timeIn: timestamp,
        timeOut: null,
        agent: fullName,
        managementName: managementName,
      };
  
      const docRef = await addDoc(logsCollectionRef, logData);
      console.log('Log added with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding log: ', error);
    }
  };
  
  
  const [userDetails, setUserDetails] = useState({});
  const [userPlateNumber, setUserPlateNumber] = useState("");
  const handleAddToSlot = (carPlateNumber, slotIndex) => {
    if (!carPlateNumber || carPlateNumber.trim() === "") {
      setErrorMessage("Please enter a plate number.");
      return;
    }
    if (!userFound) {
      const confirmAssign = window.confirm("No record found. Do you want to proceed?");
      if (!confirmAssign) {
        return;
      }
    }

    // Update the local state with new slot status
    const updatedSets = [...slotSets];
    const timestamp = new Date();

    const updatedUserDetails = {
      carPlateNumber,
      email: userDetails?.email || "",
      contactNumber: userDetails?.contactNumber || "",
      carPlateNumber: userDetails?.carPlateNumber || carPlateNumber,
      car: userDetails?.car || "",
      gender: userDetails?.gender || "",
      age: userDetails?.age || "",
      address: userDetails?.address || "",
      name: userDetails?.name || "",
      timestamp,
    };

    updatedSets[currentSetIndex].slots[slotIndex] = {
      text: carPlateNumber,
      occupied: true,
      timestamp: timestamp,
      userDetails: updatedUserDetails,
    };

    setSlotSets(updatedSets);

    // Save updated slot status to localStorage
    saveSlotsToLocalStorage(managementName, updatedSets);

    // Add entry to logs with slotNumber
    addToLogs(updatedUserDetails, slotIndex);

    // Update Firebase collection to reflect occupied status
    const slotUpdate = { status: 'Occupied' };
    const slotRef = doc(db, 'slots', `slot_${slotIndex}`);
    setDoc(slotRef, slotUpdate, { merge: true })
      .then(() => console.log(`Slot ${slotIndex} status updated in Firebase`))
      .catch(error => console.error('Error updating slot status in Firebase:', error));

    setErrorMessage("");
  };

  
  const handleSlotClick = (index) => {
    setSelectedSlot(index);
    setShowModal(true);
    setUserDetails(slotSets[currentSetIndex].slots[index]?.userDetails || null);
  };
  
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const handleExitSlot = async (slotIndex) => {
    if (!slotSets[currentSetIndex].slots[slotIndex].occupied) {
      setErrorMessage("This slot is already empty.");
      return;
    }
    setSelectedSlot(slotIndex);
    setShowExitConfirmation(true);
    const updatedSets = [...slotSets];
    updatedSets[currentSetIndex].slots[slotIndex] = {
      text: slotIndex + 1, 
      occupied: false,
      timestamp: null,
      userDetails: null,
    };
    setSlotSets(updatedSets);
  
    setZoneAvailableSpaces((prevSpaces) => {
      const updatedSpaces = [...prevSpaces];
      updatedSpaces[currentSetIndex]++;
      return updatedSpaces;
    });
    const logData = {
      carPlateNumber: userDetails.carPlateNumber,
      timeOut: serverTimestamp(),
      paymentStatus: 'Paid',
    };
  
    try {
      const logsCollectionRef = collection(db, 'logs');
      const q = query(logsCollectionRef, where('carPlateNumber', '==', userDetails.carPlateNumber));
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        await setDoc(docRef, logData, { merge: true });
      });
    } catch (error) {
      console.error('Error updating logs: ', error);
    }
  
    setErrorMessage('');
  };

  const handleConfirmExit = () => {
    setShowExitConfirmation(false);
  };
  const handleCancelExit = () => {
    setShowExitConfirmation(false); 
  };
  

  return (
    <div style={{ textAlign: 'center' }}>
        < nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
        <div className="container">
          <Link className="navbar-brand" to="/">
            SpotWise Parking Management System
          </Link>
          <p style={styles.welcomeMessage}>
            <DropdownButton 
            variant="outline-light"
                alignRight
                title={<FaUserCircle style={styles.icon} />}
                id="dropdown-menu"
              >
                <Dropdown.Item href="OperatorDashboard"><img
                        src="dashboard.jpg"
                        alt="Operator Dashboard Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Records</Dropdown.Item>
                      <Dropdown.Item href="OperatorProfile">
                <img
                        src="opname.jpg"
                        alt="Operator Profile Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="/"><img
                        src="logout.png"
                        alt="Operator Logout Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Logout</Dropdown.Item>
              </DropdownButton>
              </p>
        </div>
      </nav>
      <div style={{ textAlign: 'center', fontSize: '15px', marginTop:'10px', marginBottom:'15px'}}>
      {slotSets.length > 0 && (
     <div>
     <h3>{slotSets[currentSetIndex].title}</h3>
     </div>
       )}
       {slotSets.length === 0 && !isLoading && <div>No parking zones available.</div>}
     </div>
        <div className='parkingGrid'
       
      >
       {slotSets[currentSetIndex] && slotSets[currentSetIndex].slots.map((slot, index) => (
  <div
    key={index}
    style={{
      width: '90px',
      height: '80px',
      backgroundColor: slot.occupied ? 'red' : 'green', // Set background color based on slot.occupied
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      marginLeft: '35px',
    }}
    onClick={() => handleSlotClick(index)}
  >
    {slot.occupied ? (
      <div>
        <div>{slot.userDetails ? slot.userDetails.carPlateNumber : slot.text}</div>
      </div>
    ) : (
      index + 1
    )}
  </div>
))}
</div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Parking Slot {selectedSlot + 1}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
 
  {selectedSlot !== null && (
  <SearchForm
  onSearch={searchInFirebase}
  onSelectSlot={(carPlateNumber) => handleAddToSlot(carPlateNumber, selectedSlot)}
  onExitSlot={() => handleExitSlot(selectedSlot)}
  selectedSlot={selectedSlot}
  userDetails={userDetails}
/>

  )}
{selectedSlot !== null && userDetails !== null && (
  <div style={{ marginTop: '10px' }}>
    <h4>User Details:</h4>
    <p>Email: {userDetails.email}</p>
    <p>Contact Number: {userDetails.contactNumber}</p>
    <p>Car Plate Number: {userDetails.carPlateNumber}</p>
    <p>Gender: {userDetails.gender}</p>
    <p>Age: {userDetails.age}</p>
    <p>Address: {userDetails.address}</p>
    {slotSets[currentSetIndex].slots[selectedSlot].timestamp && (
      <p>Timestamp: {slotSets[currentSetIndex].slots[selectedSlot].timestamp.toString()}</p>
    )}
  </div>
)}
  </Modal.Body>
  <Modal.Footer>
  {recordFound ? null : <div style={{ color: 'red' }}>No record found for this car plate number.</div>}
  </Modal.Footer>
</Modal>
    <Modal show={showExitConfirmation} onHide={handleCancelExit}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to vacant this slot?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancelExit}>
          No
        </Button>
        <Button variant="primary" onClick={handleConfirmExit}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>

    <div style={{ textAlign: 'center', marginTop: '10px' }}>
      <Button onClick={handleButtonClick}>Manage Reservation</Button>
    </div>
    
      <div style={{textAlign: 'center', fontFamily:'Georgina', fontSize:'15px', marginTop:'10px'}}>
          <span>  Total Parking Spaces: {totalParkingSpaces}</span>
          <br />
          <span> Available Spaces: {availableParkingSpaces}</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: '5px', fontSize:'15px'}}>
            <div style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'green', marginRight: '10px' }}></div>
                <span>Available</span>
                     <div style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'red', marginLeft: '20px', marginRight: '10px' }}></div>
                 <span>Occupied</span>
            </div>
      <div style={{textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginTop: '5px', marginLeft:'450px', marginBottom:'5px'}}>
          <Button onClick={handlePrev} style={{ marginRight: '20px', backgroundColor: 'gray' }}>Prev</Button>
          <Button onClick={handleNext}>Next</Button>
        </div>
    </div>
    
  );
};

export default ParkingSlot;