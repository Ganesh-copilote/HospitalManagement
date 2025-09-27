const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
      <i className={`${icon} text-blue-500 text-3xl mr-4`}></i>
      <div>
        <h5 className="font-bold text-lg">{title}</h5>
        <p className="text-gray-600 text-2xl">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;