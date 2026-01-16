
export interface Preschooler {
  id: number;
  firstName: string;
  lastName: string;
  groupID: number;
}

export interface AttendanceRecord {
  id?: number;
  preschoolerId: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  arrivalTime: string | null;
  departureTime: string | null;
  date?: string;
  recordedById?: number;
}

export interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}