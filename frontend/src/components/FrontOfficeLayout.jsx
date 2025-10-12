// components/FrontOfficeLayout.jsx
import Breadcrumb from './Breadcrumb';
import ScrollToTop from './ScrollToTop';

const FrontOfficeLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-20 px-4">
      <div className="container mx-auto">
        <Breadcrumb />
        {children}
        <ScrollToTop />
      </div>
    </div>
  );
};

export default FrontOfficeLayout;