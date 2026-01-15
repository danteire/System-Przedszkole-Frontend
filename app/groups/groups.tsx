import { useEffect } from "react";
import { Button } from "react-bootstrap";
import { replace, Route, useNavigate } from "react-router";
import DashBoard from "~/commons/dashboard";
import PaginatedTable from "~/groups/groupTable";
import styles from '../commons/PaginatedTable.module.css';

export function loader() {
  return null;
}


export default function GroupsPage() {
    return(
       <>
      <div className="container mx-auto max-w-4xl">
        <DashBoard />
      </div>
      <div className="w-full px-4">
        <PaginatedTable />
      </div>
    </>
    );
}
