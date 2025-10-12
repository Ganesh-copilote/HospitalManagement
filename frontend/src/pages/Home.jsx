import Navbar from '../components/Navbar';
import FeatureCard from '../components/FeatureCard';
import DoctorCard from '../components/DoctorCard';

const Home = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 text-white pt-32 pb-16 px-4">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between max-w-6xl gap-8">
          <div className="w-full lg:w-1/2 p-6 lg:p-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-poppins">
              Your Family's Health, <span className="text-cyan-200">Connected</span>
            </h1>
            <p className="text-xl md:text-lg text-blue-100 leading-relaxed mb-8">
              Manage your family's healthcare with ease. Register once, add all family members, 
              and book appointments with top doctors – all in one secure platform.
            </p>
            <button 
              onClick={() => window.location.href = '/register'} 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-4 px-10 rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Register Your Family
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
  <img 
    src="https://max-website20-images.s3.ap-south-1.amazonaws.com/Types_of_Doctors_1c5efbe677.jpg" 
    alt="Doctor with tablet" 
    className="w-full h-64 rounded-2xl object-cover shadow-lg" 
  />
  <div className="mt-6 p-4 bg-white/5 rounded-xl">
    <h5 className="text-xl font-semibold text-white mb-2">Modern Healthcare</h5>
    <p className="text-blue-100 text-sm leading-relaxed">
      Top doctors and specialists ready to care for your entire family with cutting-edge technology.
    </p>
  </div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-blue-100">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-6 rounded-full text-sm font-semibold mb-6">
                  <span>✨</span>
                  About FamilyCare Connect
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6 font-poppins">
                  Revolutionizing Family Healthcare
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  FamilyCare Connect is a modern healthcare platform built to simplify the way families 
                  manage their medical needs through intuitive technology and compassionate care.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    Secure Platform
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Family-Centered
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    24/7 Access
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img 
                    src="https://images.stockcake.com/public/d/9/e/d9e0f1cb-6bb7-406a-aa30-c72cf629d5ac_large/hospital-emergency-room-stockcake.jpg" 
                    alt="Hospital Care" 
                    className="w-full h-48 object-cover rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105" 
                  />
                  <img 
                    src="https://www.gurdevhospital.co/assets/main-1.jpg" 
                    alt="Medical Technology" 
                    className="w-full h-48 object-cover rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105" 
                  />
                </div>
                <div className="space-y-4">
                  <img 
                    src="https://sangvihospital.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-03-at-1.26.36-PM-1.jpeg" 
                    alt="Doctor Consultation" 
                    className="w-full h-48 object-cover rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105" 
                  />
                  <img 
                    src="https://www.vedantu.com/seo/content-images/021c711a-f930-4d14-99bb-f3910cabe3d9_1..png" 
                    alt="Family Health" 
                    className="w-full h-48 object-cover rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-blue-600 py-2 px-6 rounded-full text-sm font-semibold shadow-sm mb-4">
              ⚡ Features
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-poppins">Our Healthcare Features</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Designed to provide comprehensive healthcare management for your entire family
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <img src="https://img.icons8.com/fluency/48/ffffff/stethoscope.png" alt="Stethoscope" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Top Doctors</h3>
              <p className="text-gray-600 leading-relaxed">
                Access certified and experienced doctors from multiple specialties with verified credentials.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <img src="https://img.icons8.com/fluency/48/ffffff/family.png" alt="Family" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Family Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage healthcare for all family members from one centralized, secure dashboard.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <img src="https://img.icons8.com/fluency/48/ffffff/calendar.png" alt="Calendar" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Easy Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Book, reschedule, and manage appointments seamlessly with our intuitive calendar system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 py-2 px-6 rounded-full text-sm font-semibold shadow-sm mb-4">
              👨‍⚕ Our Team
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-poppins">Meet Our Doctors</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Highly qualified healthcare professionals dedicated to your family's wellbeing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Doctor 1 */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-6 overflow-hidden shadow-lg">
                  <img 
                    src="https://media.gettyimages.com/id/1286150641/photo/asian-female-doctor-working-happy-and-smile-with-her-laptop-while-posing-in-her-office-asian.jpg?s=612x612&w=0&k=20&c=WFoNb4mRY3sVx9_8DCr1Nh6Fg48rWtI3ijRw4FYXKRI=" 
                    alt="Dr. Emily Carter" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Dr. Emily Carter</h3>
                <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 py-1 px-4 rounded-full text-sm font-medium mx-auto mb-4">
                  Pediatrician
                </div>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Board-certified pediatrician with 12+ years of experience in child healthcare and development.
                </p>
                <div className="flex justify-center mt-4 text-yellow-400">
                  ★★★★★
                </div>
              </div>
            </div>

            {/* Doctor 2 */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-6 overflow-hidden shadow-lg">
                  <img 
                    src="https://static.vecteezy.com/system/resources/previews/026/375/249/non_2x/ai-generative-portrait-of-confident-male-doctor-in-white-coat-and-stethoscope-standing-with-arms-crossed-and-looking-at-camera-photo.jpg" 
                    alt="Dr. James Wilson" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Dr. James Wilson</h3>
                <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 py-1 px-4 rounded-full text-sm font-medium mx-auto mb-4">
                  Cardiologist
                </div>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Board-certified cardiologist with 15+ years of experience in heart health and preventive care.
                </p>
                <div className="flex justify-center mt-4 text-yellow-400">
                  ★★★★★
                </div>
              </div>
            </div>

            {/* Doctor 3 */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-6 overflow-hidden shadow-lg">
                  <img 
                    src="https://media.gettyimages.com/id/1323720858/photo/a-young-female-doctor-portrait.jpg?s=612x612&w=0&k=20&c=GX046JMl612k2g9Vn_Pl6SJ0dApZYm9KgvrRbDFqfVA=" 
                    alt="Dr. Sophia Lee" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Dr. Sophia Lee</h3>
                <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 py-1 px-4 rounded-full text-sm font-medium mx-auto mb-4">
                  Dermatologist
                </div>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Expert dermatologist specializing in skin health and cosmetic treatments with 10+ years experience.
                </p>
                <div className="flex justify-center mt-4 text-yellow-400">
                  ★★★★★
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-500 to-teal-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white py-2 px-6 rounded-full text-sm font-semibold mb-4">
              📞 Get In Touch
            </div>
            <h2 className="text-4xl font-bold mb-6 font-poppins">Have Questions? We're Here to Help</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Contact us for any inquiries or support. Our team is ready to assist you with all your healthcare needs.
            </p>
            <a 
              href="mailto:support@familycareconnect.com" 
              className="inline-flex items-center gap-3 bg-white text-blue-600 font-semibold py-4 px-10 rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>✉</span>
              Email Us
            </a>
            
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="text-center md:text-left">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                    <span>📧</span>
                  </div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-blue-100 text-sm">support@familycareconnect.com</p>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                    <span>🕒</span>
                  </div>
                  <h4 className="font-semibold mb-2">Response Time</h4>
                  <p className="text-blue-100 text-sm">Within 24 hours</p>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                    <span>🌐</span>
                  </div>
                  <h4 className="font-semibold mb-2">Support</h4>
                  <p className="text-blue-100 text-sm">24/7 Online Assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;