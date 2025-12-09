import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router";
import { api } from "../utils/serviceAPI";
import styles from "./DashBoard.module.css";

export async function loader() {
  return {};
}

const handleLogout = async () => {
  try {
    await api.logout();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default function DashBoard() {
  return (
    <Navbar expand="lg" className={styles.navbar}>
      <Container>
        <Navbar.Brand as={Link} to="/home" className={styles.brand}>
          Przedszkole +
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={styles.nav}>
            <Nav.Link as={Link} to="/attendance" className={styles.link}>
              Attendance
            </Nav.Link>

            <Nav.Link as={Link} to="/groups" className={styles.link}>
              Groups
            </Nav.Link>

            <Nav.Link as={Link} to="/meals" className={styles.link}>
              Meals
            </Nav.Link>

            <Nav.Link as={Link} to="/messages" className={styles.link}>
              Messages
            </Nav.Link>

            <Nav.Link as={Link} to="/events" className={styles.link}>
              Events
            </Nav.Link>

            <button className={styles.logout} onClick={handleLogout}>
              Logout
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
