// src/components/DataTable.jsx
const DataTable = ({ title, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="text-gray-500">No records found.</p>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            {headers.map((head) => (
              <th key={head} className="px-4 py-2 border text-left capitalize">
                {head.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {headers.map((head) => (
                <td key={head} className="px-4 py-2 border">
                  {row[head]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
