// app/routes/dashboard/dashboard.tsx
import { api } from "~/utils/serviceAPI";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, redirect } from "react-router";
import { useState, useEffect } from "react";

// clientLoader - executes ONLY in the browser
export async function clientLoader() {
  if (!api.isAuthenticated()) {
    throw redirect('/login');
  }
  return {};
}

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Get role and info from API/Storage
    const role = api.getAccountType(); // e.g., 'ADMIN', 'TEACHER', 'PARENT'
    const info = api.getAccountInfo();

    setUserRole(role || "");
    setAccountInfo(info);
    
    console.log('Dashboard mounted:');
    console.log(' - Role:', role);
  }, []);

  const handleLogout = async () => {
    await api.logout();
  };

  // Helper booleans for cleaner JSX
  const isAdmin = userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';
  const isParent = userRole === 'PARENT';

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand as={Link} to="/home">
            Preschool +
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              
              {/* Common Modules */}
              <Nav.Link as={Link} to="/attendance">Attendance</Nav.Link>
              
              {/* Groups - Hidden for PARENT, visible for ADMIN and TEACHER */}
              {!isParent && !isTeacher && (
                <Nav.Link as={Link} to="/groups">Groups</Nav.Link>
              )}
              
              <Nav.Link as={Link} to="/meals">Meals</Nav.Link>
              <Nav.Link as={Link} to="/messages">Messages</Nav.Link>
              
              {/* Admin Panel - Visible only for ADMIN */}
              {isClient && (isAdmin ) && (
                <>
                  <Nav.Link as={Link} to="/adminPanel" className="text-warning">
                    👤 Admin Panel
                  </Nav.Link>
                </>
              )}
              {isClient && (isTeacher) && (
                <Nav.Link as={Link} to="/adminPanel" className="text-warning">
                  👤 Teacher Panel
                </Nav.Link>
              )}
            </Nav>
            
            {/* User Info Display */}
            {accountInfo && (
              <span className="text-muted ms-2">
                Signed in as: <strong>{accountInfo.firstName} {accountInfo.lastName}</strong> ({userRole})
              </span>
            )}
            
            <Nav className="ms-3">
              <Nav.Link onClick={handleLogout} className="text-danger">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}