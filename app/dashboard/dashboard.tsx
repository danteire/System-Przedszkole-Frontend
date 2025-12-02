import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, redirect } from "react-router";
import {api} from "../utils/serviceAPI"

export async function loader() {
  return {};
}

const handleLogout = async () => {
    try {
      await api.logout(); // Automatycznie czyści token i przekierowuje
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

export default function DashBoard() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/home">Przedszkole +</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/attendance">Attendance</Nav.Link>
            <Nav.Link as={Link} to="/groups">Groups</Nav.Link>
            <Nav.Link as={Link} to="/meals">Meals</Nav.Link>
            <Nav.Link as={Link} to="/messages">Messages</Nav.Link>
            <Nav.Link as={Link} to="/events">Events</Nav.Link>
            <Nav.Item as={Button} onClick={handleLogout}> Logout </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}