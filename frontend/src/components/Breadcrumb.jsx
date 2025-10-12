// components/Breadcrumb.jsx
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Define breadcrumb mappings for all routes
  const breadcrumbMap = {
    // Front Office Routes
    '/front_office_dashboard': [{ label: 'Dashboard', path: '/front_office_dashboard' }],
    '/front_office_patient': [
      { label: 'Dashboard', path: '/front_office_dashboard' },
      { label: 'Patient Management', path: '/front_office_patient' }
    ],
    '/front_office_checkins': [
      { label: 'Dashboard', path: '/front_office_dashboard' },
      { label: 'Check-ins', path: '/front_office_checkins' }
    ],
    '/front_office_appointments': [
      { label: 'Dashboard', path: '/front_office_dashboard' },
      { label: 'Appointments', path: '/front_office_appointments' }
    ],
    '/front_office_payments': [
      { label: 'Dashboard', path: '/front_office_dashboard' },
      { label: 'Payments', path: '/front_office_payments' }
    ],
    '/front_office_register': [
      { label: 'Dashboard', path: '/front_office_dashboard' },
      { label: 'New Registration', path: '/front_office_register' }
    ],
    '/front_office_reports': [
      { label: 'Dashboard', path: '/front_office_dashboard' },
      { label: 'Reports', path: '/front_office_reports' }
    ],
    
    // Patient Routes
    '/patient_dashboard': [{ label: 'Dashboard', path: '/patient_dashboard' }],
    '/patient_dashboard#family': [
      { label: 'Dashboard', path: '/patient_dashboard' },
      { label: 'Family Members', path: '/patient_dashboard#family' }
    ],
    '/patient_dashboard#appointments': [
      { label: 'Dashboard', path: '/patient_dashboard' },
      { label: 'Appointments', path: '/patient_dashboard#appointments' }
    ]
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    // Handle dynamic routes
    if (path.startsWith('/front_office_view_patient/')) {
      return [
        { label: 'Dashboard', path: '/front_office_dashboard' },
        { label: 'Patient Management', path: '/front_office_patient' },
        { label: 'Patient Details', path: '#' }
      ];
    }
    if (path.startsWith('/edit_family_member/')) {
      return [
        { label: 'Dashboard', path: '/patient_dashboard' },
        { label: 'Family Members', path: '/patient_dashboard#family' },
        { label: 'Edit Family Member', path: '#' }
      ];
    }
    if (path.startsWith('/view_appointment/')) {
      return [
        { label: 'Dashboard', path: '/patient_dashboard' },
        { label: 'Appointments', path: '/patient_dashboard#appointments' },
        { label: 'View Appointment', path: '#' }
      ];
    }
    if (path.startsWith('/reschedule_appointment/')) {
      return [
        { label: 'Dashboard', path: '/patient_dashboard' },
        { label: 'Appointments', path: '/patient_dashboard#appointments' },
        { label: 'Reschedule Appointment', path: '#' }
      ];
    }
    if (path.startsWith('/add_family_member')) {
      return [
        { label: 'Dashboard', path: '/patient_dashboard' },
        { label: 'Family Members', path: '/patient_dashboard#family' },
        { label: 'Add Family Member', path: '#' }
      ];
    }
    if (path.startsWith('/book_appointment')) {
      return [
        { label: 'Dashboard', path: '/patient_dashboard' },
        { label: 'Appointments', path: '/patient_dashboard#appointments' },
        { label: 'Book Appointment', path: '#' }
      ];
    }
    
    return breadcrumbMap[path] || breadcrumbMap['/patient_dashboard'] || [{ label: 'Dashboard', path: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumb if only on dashboard
  if (breadcrumbs.length === 1) return null;

  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg 
                className="flex-shrink-0 h-4 w-4 text-gray-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="ml-2 text-gray-700 font-medium">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.path)}
                className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;