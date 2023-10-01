import React, { useState } from 'react';
import { Button, Modal, Form} from 'react-bootstrap';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { Link, } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { db } from "../config/firebase";
import { collection, getDocs} from 'firebase/firestore';


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
  const maxZones = 5;
  const initialSlotSets = [{ title: 'Zone 1', slots: Array(15).fill(false) }];
  
  const initialTotalSpaces = initialSlotSets.map(zone => zone.slots.length).reduce((total, spaces) => total + spaces, 0);

  const [slotSets, setSlotSets] = useState(initialSlotSets);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [zoneAvailableSpaces, setZoneAvailableSpaces] = useState(
    initialSlotSets.map(zone => zone.slots.length)
  );

  const toggleOccupancy = (setIndex, boxIndex) => {
    const updatedSets = [...slotSets];
    const isOccupied = updatedSets[setIndex].slots[boxIndex];
    updatedSets[setIndex].slots[boxIndex] = !isOccupied;
    setSlotSets(updatedSets);
  
    const updatedAvailableSpaces = [...zoneAvailableSpaces];
    updatedAvailableSpaces[setIndex] += isOccupied ? 1 : -1;
    setZoneAvailableSpaces(updatedAvailableSpaces);
  };
  

  const rows = 5;
  const cols = 3;

  const handleNext = () => {
    if (currentSetIndex === slotSets.length - 1) {
      if (slotSets.length < maxZones) {
        setSlotSets(prevSets => [
          ...prevSets,
          { title: `Zone ${prevSets.length + 1}`, slots: Array(15).fill(false) },
        ]);
        setZoneAvailableSpaces(prevSpaces => [...prevSpaces, 15]); 
        setCurrentSetIndex(currentSetIndex + 1);
      }
    } else {
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

  const handleSlotClick = (index) => {
    setSelectedSlot(index);
    setShowModal(true);
  };
  const [textToAdd, setTextToAdd] = useState("");
  const [userPlateNumber, setUserPlateNumber] = useState("");


  const handleAddText = async () => {
    try {
      const collectionRef = collection(db, 'user');
      const querySnapshot = await getDocs(collectionRef);
  
      const user = querySnapshot.docs.find(doc => doc.data().carPlateNumber === textToAdd);
  
      if (user) {
        console.log('Found user:', user.data());
        setUserPlateNumber(user.data().carPlateNumber);
      } else {
        console.log('User not found.');
        const updatedSets = [...slotSets];
        updatedSets[currentSetIndex].slots[selectedSlot] = {
          text: textToAdd,
          occupied: true,
          timestamp: new Date(),
        };
        setSlotSets(updatedSets);
        setZoneAvailableSpaces(prevSpaces => {
          const updatedSpaces = [...prevSpaces];
          updatedSpaces[currentSetIndex]--;
          return updatedSpaces;
        });
      }
  
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
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
                    <h3>{slotSets[currentSetIndex].title}</h3>
        </div>
        <div
        style={{
          display: 'grid',
          gridTemplateRows: `auto repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '10px',
          maxWidth: '600px',
          margin: '0 auto',
          border: '5px solid black',
          padding: '25px',
          maxHeight: '500px',
          marginBottom: '20px',
        }}
      >
        {slotSets[currentSetIndex].slots.map((slot, index) => (
          <div
            key={index}
            style={{
              width: '90px',
              height: '80px',
              backgroundColor: slot.occupied ? 'red' : 'green',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              marginLeft: '35px',
            }}
            onClick={() => handleSlotClick(index)}
          >
            {slot.text ? slot.text : index + 1}
          </div>
        ))}
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Parking Slot {selectedSlot + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  <Form.Group>
    <Form.Label>Enter Plate Number:</Form.Label>
    <Form.Control
      type="text"
      value={textToAdd}
      onChange={(e) => {
        setTextToAdd(e.target.value);
        setUserPlateNumber(""); // Reset the user plate number state when typing
      }}
    />
  </Form.Group>
  {userPlateNumber && (
    <div style={{ marginTop: '10px' }}>
      User's Plate Number: {userPlateNumber}
    </div>
  )}
</Modal.Body>


        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddText}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
      <div style={{textAlign: 'center', fontFamily:'Georgina', fontSize:'15px', marginTop:'10px'}}>
          <span>  Total Parking Spaces: {initialTotalSpaces}</span>
          <br />
          <span> Available Spaces: {zoneAvailableSpaces[currentSetIndex]}</span>
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