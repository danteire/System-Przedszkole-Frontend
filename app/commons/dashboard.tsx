// app/routes/dashboard/dashboard.tsx
import { api } from "~/utils/serviceAPI";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, redirect } from "react-router";
import { useState, useEffect } from "react";

// clientLoader - wykonuje się TYLKO w przeglądarce
export async function clientLoader() {
  if (!api.isAuthenticated()) {
    throw redirect('/login');
  }
  return {};
}

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsAdmin(api.isAdmin());
    setAccountInfo(api.getAccountInfo());
    
    console.log('Dashboard mounted:');
    console.log('  - isAdmin:', api.isAdmin());
    console.log('  - accountType:', api.getAccountType());
  }, []);

  const handleLogout = async () => {
    await api.logout();
  };

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand as={Link} to="/dashboard">
            Przedszkole +
            
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/attendance">Attendance</Nav.Link>
              <Nav.Link as={Link} to="/groups">Groups</Nav.Link>
              <Nav.Link as={Link} to="/meals">Meals</Nav.Link>
              <Nav.Link as={Link} to="/messages">Messages</Nav.Link>
              
              {isClient && isAdmin && (
                <>
                  <Nav.Link as={Link} to="/adminPanel" className="text-warning">
                    👤 Admin Panel
                  </Nav.Link>
                </>
              )}
            </Nav>
            {accountInfo && (
              <span className="text-muted ms-2">
                ({accountInfo.firstName} {accountInfo.lastName} - {accountInfo.accountType})
              </span>
            )}
            <Nav>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}