// app/commons/dashboard.tsx
import { api } from "~/utils/serviceAPI";
import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import styles from "./DashBoard.module.css";
import {
  FaUsers,
  FaUserCheck,
  FaUtensils,
  FaComments,
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaGraduationCap
} from "react-icons/fa";

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    // Get role and info from API/Storage
    const role = api.getAccountType();
    const info = api.getAccountInfo();

    setUserRole(role || "");
    setAccountInfo(info);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    window.location.href = '/'; // Force redirect
  };

  const isAdmin = userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';
  const isParent = userRole === 'PARENT';

  // Navigation Items Configuration
  const navItems = [
    { to: "/groups", icon: <FaUsers />, label: "Groups", visible: !isParent && !isTeacher }, // Hidden for parent and teacher
    { to: "/attendance", icon: <FaUserCheck />, label: "Attendance", visible: true },
    { to: "/meals", icon: <FaUtensils />, label: "Meals", visible: true },
    { to: "/messages", icon: <FaComments />, label: "Messages", visible: true },
  ];

  // Admin/Teacher Panel Link
  const panelLink = {
    to: "/adminPanel",
    icon: <FaChalkboardTeacher />,
    label: isAdmin ? "Admin Panel" : "Teacher Panel",
    visible: isAdmin || isTeacher
  };

  if (panelLink.visible) {
    navItems.push(panelLink);
  }

  return (
    // WRAPPER: Rozciąga się na całą szerokość ekranu
    <div className={styles.dashboardWrapper}>

      {/* CONTAINER: Centruje zawartość do max-width: 1400px */}
      <div className={styles.dashboardContainer}>

        {/* 1. Logo Pill (Left) */}
        <Link to="/" className={styles.logoLink} title="Home">
          <FaGraduationCap size={24} />
          <span>Preschool+</span>
        </Link>

        {/* 2. Navigation Pill (Center) */}
        <nav className={styles.navContainer}>
          {navItems.filter(item => item.visible).map((item) => {
            // Sprawdź czy to dokładnie ta ścieżka LUB czy podstrona (np. /groups/new też powinno aktywować /groups)
            // Ale uwaga na root "/"
            const isActive = item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                title={item.label}
              >
                <span className={styles.icon}>{item.icon}</span>
                {isActive && <span className={styles.navItemText}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 3. User Info Pill (Right) */}
        {accountInfo && (
          <div className={styles.userContainer}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{accountInfo.firstName} {accountInfo.lastName}</span>
              <span className={styles.userRole}>{userRole}</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}