import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { FaUserCircle } from "react-icons/fa";
import { Card, Row, Col, Container, Table } from "react-bootstrap";
import {
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBCardTitle
} from 'mdb-react-ui-kit';
import { useNavigate, useLocation, Link } from "react-router-dom";

const Tracks = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  
  const [showSchedule, setShowSchedule] = useState(false);

  const handleCardHover = (cardIndex) => {
    setHoveredCard(cardIndex);
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  const handleViewRevenue = () => {
    setShowTable(true);
    setShowUserDetail(false);
    setShowSchedule(false);
  };

  const handleViewUserDetail = () => {
    setShowUserDetail(true);
    setShowTable(false);
    setShowSchedule(false);
  };

  const handleViewSchedule = () => {
    setShowSchedule(true);
    setShowTable(false);
    setShowUserDetail(false);
 
  };

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

  return (
    <div style={{ backgroundColor: '#3b89ac', minHeight: "100vh" }}>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
          <div className="container">
            <Link className="navbar-brand" to="/estDashBoard">
              SpotWise Parking Management System
            </Link>
            <p style={styles.welcomeMessage}>
            <DropdownButton
              alignRight
              variant="outline-light"
              title={<FaUserCircle style={styles.icon} />}
              id="dropdown-menu"
            >
              <Dropdown.Item href="Dashboard">Dashboard</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="/Login">Logout</Dropdown.Item>
            </DropdownButton>
          </p>
          </div>
        </nav>
      <Container style={{backgroundColor:'#bfd2d9', marginTop:'80px', borderRadius:'25px'}}>
        <Row>
          <Col md={5} style={{marginTop:'20px'}}>
            <Container>
              <Row>
                <Col md={6}>
                  <MDBCard
                    style={{ height: '350px', borderRadius:'20px'}}
                    onMouseEnter={() => handleCardHover(1)}
                    onMouseLeave={handleCardLeave}
                    className={hoveredCard === 1 ? 'hovered-card' : ''}
                  >
                    <MDBCardImage src='https://media.istockphoto.com/id/1306314288/vector/monthly-financial-report-rgb-color-icon.jpg?s=612x612&w=0&k=20&c=hFZfzotHine6telPBHeMxuONa63THVczLWQJgC4h9HQ=' style={{ objectFit: 'cover', height: '50%', borderRadius:"20px" }} />
                    <MDBCardBody style={{ height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
                      <div>
                        <MDBCardTitle style={{ fontFamily: 'Courier New', fontWeight: 'bold' }}>Revenue</MDBCardTitle>
                        <MDBCardText style={{ fontFamily: 'serif' }}>
                          This section provides a concise overview of the financial gains achieved.
                        </MDBCardText>
                      </div>
                      <MDBBtn onClick={handleViewRevenue} style={{ fontFamily: 'Courier New' }}>View Revenue</MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                </Col>
                <Col md={6}>
                  <MDBCard
                    style={{ height: '350px',  borderRadius:'20px' }}
                    onMouseEnter={() => handleCardHover(2)}
                    onMouseLeave={handleCardLeave}
                    className={hoveredCard === 2 ? 'hovered-card' : ''}
                  >
                    <MDBCardImage src='https://png.pngitem.com/pimgs/s/80-800194_transparent-users-icon-png-flat-user-icon-png.png' style={{ objectFit: 'cover', height: '50%', borderRadius:'20px'}} />
                    <MDBCardBody style={{ height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
                      <div>
                        <MDBCardTitle style={{ fontFamily: 'Courier New', fontWeight: 'bold' }}>Customer</MDBCardTitle>
                        <MDBCardText style={{ fontFamily: 'serif' }}>
                          This sections offers a summary of the user who parked today.
                        </MDBCardText>
                      </div>
                      <MDBBtn onClick={handleViewUserDetail} style={{ fontFamily: 'Courier New' }}>View Customer Details</MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                </Col>
              </Row>
              <Row style={{ marginTop: '20px', marginBottom:'20px'}}>
                <Col md={6}>
                  <MDBCard
                    style={{ height: '350px', borderRadius:'20px' }}
                    onMouseEnter={() => handleCardHover(4)}
                    onMouseLeave={handleCardLeave}
                    className={hoveredCard === 4 ? 'hovered-card' : ''}
                  >
                    <MDBCardImage src='https://cdn-icons-png.flaticon.com/512/1497/1497835.png' position='top' alt='...' style={{ objectFit: 'cover', height: '50%', borderRadius:'20px' }} />
                    <MDBCardBody style={{ height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
                      <div>
                        <MDBCardTitle style={{ fontFamily: 'Courier New' }}>Schedule</MDBCardTitle>
                        <MDBCardText style={{ fontFamily: 'serif' }}>
                          This section provides a concise overview of the financial gains achieved.
                        </MDBCardText>
                      </div>
                      <MDBBtn onClick={handleViewSchedule} style={{ fontFamily: 'Courier New' }}>View Schedule</MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                </Col>
              </Row>
            </Container>
          </Col>
          <Col md={6}>
            <Container style={{marginLeft:'75px',backgroundColor: '#fff', padding: '20px', marginTop: '20px', height: '700px', borderRadius:'20px'}}>
              {showTable ? (
                <>
                  <h3 style={{ fontFamily: 'Courier New', fontWeight: 'bold', textAlign: 'center' }}>INCOME DETAIL</h3>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>2023-07-01</td>
                        <td>$500</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>2023-07-02</td>
                        <td>$750</td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              ) : showUserDetail ? (
                <>
                  <h3 style={{ fontFamily: 'Courier New', fontWeight: 'bold', textAlign: 'center' }}>USER DETAIL</h3>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>Junas Nazarito Gutib</td>
                        <td>wakwak@gmail.com</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Gilbert Canete</td>
                        <td>gilbertcanete@gmail.com</td>
                      </tr>
                    </tbody>
                  </Table>
                </>
             ) : showSchedule ? (
                <>
                  <h3 style={{ fontFamily: 'Courier New', fontWeight: 'bold', textAlign: 'center' }}>SCHEDULE DETAIL</h3>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Agent Name</th>
                        <th>Time in</th>
                        <th>Time out</th>
                        <th>Duty Hours</th>
                        <th>Email</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Marky Rocarberte</td>
                        <td>10:00 AM</td>
                        <td>04:00 PM</td>
                        <td>6 hours</td>
                        <td>markyrocaberte@gmail.com</td>
                        <td>0920123458</td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              ) : (
                <>
                  <h3 style={{fontFamily:'Courier New', fontWeight:'bold', textAlign:'center'}}>OVERVIEW</h3>
                </>
              )}
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Tracks;