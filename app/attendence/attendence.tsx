import { useEffect } from "react";
import { Table } from "react-bootstrap";
import { replace, Route, useNavigate } from "react-router";
import DashBoard from "~/commons/dashboard";
import AttendanceTable from "./attendenceTable";


export function clientLoader() {
  return null;
}

export default function AttendancePage() {
  return (
    <>
      <div className="container mx-auto max-w-4xl">
        <DashBoard />
      </div>

      <div className="w-full px-4">
        <AttendanceTable />
      </div>
    </>
  );
}