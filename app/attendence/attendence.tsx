import { useEffect } from "react";
import { Table } from "react-bootstrap";
import { replace, Route, useNavigate } from "react-router";
import DashBoard from "~/commons/dashboard";
import PaginatedTable from "~/commons/table";
export function loader() {
  return null;
}


export default function AttendancePage() {
    return(
      <>
      <DashBoard></DashBoard>
      <PaginatedTable></PaginatedTable>
      </>
    );
}
