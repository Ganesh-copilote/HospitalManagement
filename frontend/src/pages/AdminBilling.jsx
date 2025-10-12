import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../components/DataTable";

const Billing = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/bills").then((res) => setBills(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Billing</h1>
      <DataTable title="All Bills" data={bills} />
    </div>
  );
};

export default Billing;
