import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getFamilyMember, editFamilyMember } from "../services/api";
import Navbar from "../components/Navbar";

const EditFamilyMember = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const location = useLocation();

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    aadhar: "",
    address: "",
    prev_problem: "",
    curr_problem: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showScroll, setShowScroll] = useState(false);

  // ---------------- Breadcrumb ----------------
  const generateBreadcrumb = () => {
    const pathnames = location.pathname.split("/").filter(x => x);
    return (
      <nav className="text-sm text-gray-600 mb-6">
        <ol className="list-reset flex">
          <li>
            <button
              onClick={() => navigate("/patient_dashboard")}
              className="text-blue-600 hover:underline"
            >
              Dashboard
            </button>
          </li>
          {pathnames.map((value, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            return (
              <li key={index} className="flex items-center">
                <span className="mx-2">›</span>
                {isLast ? (
                  <span className="text-gray-800 font-medium capitalize">
                    {value.replace(/_/g, " ")}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(routeTo)}
                    className="text-blue-600 hover:underline capitalize"
                  >
                    {value.replace(/_/g, " ")}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  };

  // ---------------- Scroll-to-Top ----------------
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const response = await getFamilyMember(memberId);
        if (response.success && response.member) {
          setFormData({
            first_name: response.member.first_name || "",
            middle_name: response.member.middle_name || "",
            last_name: response.member.last_name || "",
            age: response.member.age || "",
            gender: response.member.gender || "",
            phone: response.member.phone || "",
            email: response.member.email || "",
            aadhar: response.member.aadhar || "",
            address: response.member.address || "",
            prev_problem: response.member.prev_problem || "",
            curr_problem: response.member.curr_problem || ""
          });
        } else {
          setError(response.error || "Failed to load family member data.");
        }
      } catch (err) {
        setError("Failed to load family member. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (memberId) fetchMember();
    else {
      setError("No member ID provided");
      setLoading(false);
    }
  }, [memberId]);

  // ---------------- Handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const result = await editFamilyMember(memberId, formData);
      if (result.success) {
        navigate("/patient_dashboard#family?success=Family member updated successfully");
      } else {
        setError(result.error || "Failed to update family member.");
      }
    } catch (err) {
      setError("Failed to update family member. Please try again.");
    }
  };

  // ---------------- Loading ----------------
  if (loading) {
    return (
      <>
        <Navbar isDashboard={true} userType="patient" />
        <div className="container mx-auto pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10 text-center">
            <div className="text-lg font-semibold text-blue-700 animate-pulse">
              Loading family member details...
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---------------- Main JSX ----------------
  return (
    <>
      <Navbar isDashboard={true} userType="patient" />

      <div className="container mx-auto pt-20 px-4 pb-20">
        <div className="max-w-4xl mx-auto">{generateBreadcrumb()}</div>

        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10 border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
            Edit Family Member
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Middle Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Aadhar Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="aadhar"
                value={formData.aadhar}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Previous Medical Problems
              </label>
              <textarea
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="prev_problem"
                rows="2"
                value={formData.prev_problem}
                onChange={handleChange}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Current Medical Problems
              </label>
              <textarea
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="curr_problem"
                rows="2"
                value={formData.curr_problem}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/patient_dashboard#family")}
                className="bg-gray-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
              >
                Update Family Member
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Scroll-To-Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
          title="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default EditFamilyMember;
