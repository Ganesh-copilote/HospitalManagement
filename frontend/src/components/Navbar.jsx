import { useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

const Navbar = ({ isDashboard = false, userName = '', userType = '' }) => {
  const navigate = useNavigate();

const handleLogout = async () => {
  try {
    await logout();
    navigate('/');
  } catch (error) {
    console.error('Logout failed:', error.response?.data || error.message || error);
  }
};

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 shadow-md ${isDashboard ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a className={`font-bold text-xl ${isDashboard ? 'text-white' : 'text-blue-600'}`} href="/">FamilyCare Connect</a>
        {!isDashboard ? (
          <div className="flex space-x-4">
            <a href="#about" className="text-gray-600 hover:text-blue-600" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a>
            <a href="#features" className="text-gray-600 hover:text-blue-600" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
            <a href="#doctors" className="text-gray-600 hover:text-blue-600" onClick={(e) => { e.preventDefault(); document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' }); }}>Doctors</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
            <button onClick={() => navigate('/login')} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Login</button>
            <button onClick={() => navigate('/register')} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Get Started</button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <span>Welcome {userName}</span>
            {userType === 'admin' && (
              <a href="/admin" className="bg-white text-blue-600 py-1 px-3 rounded hover:bg-gray-100">Admin Panel</a>
            )}
            <button onClick={handleLogout} className="bg-white text-blue-600 py-1 px-3 rounded hover:bg-gray-100">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;