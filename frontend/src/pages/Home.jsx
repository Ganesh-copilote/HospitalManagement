import Navbar from '../components/Navbar';
import FeatureCard from '../components/FeatureCard';
import DoctorCard from '../components/DoctorCard';

const Home = () => {
  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500 text-white pt-32 pb-16 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between max-w-6xl">
          <div className="w-full md:w-1/2 p-4 md:p-10">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Your Family's Health, <br />Connected</h1>
            <p className="text-lg mt-4 text-blue-100">Manage your family's healthcare with ease. Register once, add all family members, and book appointments with top doctors – all in one secure platform.</p>
            <button onClick={() => window.location.href = '/register'} className="mt-6 bg-white text-blue-500 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100">Register Your Family</button>
          </div>
          <div className="w-full md:w-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-lg p-5 text-center">
            <img src="/static/images/Doctor.jpg" alt="Doctor with tablet" className="w-full rounded-lg object-cover" />
            <h5 className="mt-4 font-semibold text-gray-800">Modern Healthcare</h5>
            <p className="text-gray-600 text-sm">Top doctors and specialists ready to care for your entire family.</p>
          </div>
        </div>
      </section>
      <section id="about" className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 p-4">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">✨ About FamilyCare Connect</h2>
              <p className="text-gray-600 text-lg leading-relaxed">FamilyCare Connect is a modern healthcare platform built to simplify the way families manage their medical needs...</p>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
              <img src="https://images.stockcake.com/public/d/9/e/d9e0f1cb-6bb7-406a-aa30-c72cf629d5ac_large/hospital-emergency-room-stockcake.jpg" alt="Hospital Care" className="w-full h-48 object-cover rounded-lg shadow" />
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="bg-orange-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon="https://img.icons8.com/fluency/48/stethoscope.png" title="Top Doctors" description="Access certified and experienced doctors from multiple specialties." />
          </div>
        </div>
      </section>
      <section id="doctors" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DoctorCard name="Dr. John Doe" specialty="Cardiologist" image="/static/images/doctor1.jpg" />
          </div>
        </div>
      </section>
      <section id="contact" className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-6">Contact us for any inquiries or support.</p>
          <a href="mailto:support@familycareconnect.com" className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600">Email Us</a>
        </div>
      </section>
    </>
  );
};

export default Home;