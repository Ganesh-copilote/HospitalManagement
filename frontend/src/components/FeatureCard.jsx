const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <img src={icon} alt={title} className="w-12 h-12 mx-auto mb-4" />
      <h5 className="font-bold text-lg mb-2">{title}</h5>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;