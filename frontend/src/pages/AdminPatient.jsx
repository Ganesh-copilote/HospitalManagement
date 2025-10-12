import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../components/DataTable";

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/patients").then((res) => setPatients(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Patients</h1>
      <DataTable title="Registered Patients" data={patients} />
    </div>
  );
};

export default Patients;
