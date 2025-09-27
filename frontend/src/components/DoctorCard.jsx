const DoctorCard = ({ name, specialty, image }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <img src={image} alt={name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
      <h5 className="font-bold text-lg">{name}</h5>
      <p className="text-gray-600">{specialty}</p>
    </div>
  );
};

export default DoctorCard;