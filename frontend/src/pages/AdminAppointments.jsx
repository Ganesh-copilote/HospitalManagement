import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../components/DataTable";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments").then((res) => setAppointments(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Appointments</h1>
      <DataTable title="All Appointments" data={appointments} />
    </div>
  );
};

export default Appointments;
