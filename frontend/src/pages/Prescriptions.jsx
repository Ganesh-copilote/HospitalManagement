import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Plus,
  Pill,
  Calendar,
  User,
  Stethoscope,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Printer
} from 'lucide-react';
import { getAllPrescriptions } from '../services/api';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAllPrescriptions();
        console.log('💊 Prescriptions API Response:', response);
        
        // Handle different response structures
        if (response.success && response.prescriptions) {
          setPrescriptions(response.prescriptions);
        } else if (response.prescriptions) {
          setPrescriptions(response.prescriptions);
        } else if (Array.isArray(response)) {
          setPrescriptions(response);
        } else {
          setPrescriptions([]);
          console.warn('Unexpected API response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setError('Failed to load prescriptions');
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Helper function to get field value regardless of naming convention
  const getField = (prescription, fieldNames) => {
    for (const fieldName of fieldNames) {
      if (prescription[fieldName] !== undefined && prescription[fieldName] !== null) {
        return prescription[fieldName];
      }
    }
    return 'N/A';
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const patientName = getField(prescription, ['patientName', 'patient_name']);
    const patientId = getField(prescription, ['patientId', 'patient_id']);
    
    const matchesSearch = 
      patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientId?.toLowerCase().includes(searchTerm.toLowerCase());

    const status = getField(prescription, ['status']);
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handlePrint = () => {
    if (!selectedPrescription) return;

    // Get all the prescription data
    const patientName = getField(selectedPrescription, ['patientName', 'patient_name']);
    const patientId = getField(selectedPrescription, ['patientId', 'patient_id']);
    const doctor = getField(selectedPrescription, ['doctor']);
    const datePrescribed = getField(selectedPrescription, ['datePrescribed', 'prescription_date']);
    const medications = getField(selectedPrescription, ['medications']) || [];
    const pharmacy = getField(selectedPrescription, ['pharmacy']);
    const notes = getField(selectedPrescription, ['notes']);
    const status = getField(selectedPrescription, ['status']);

    // Create a print-friendly window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patientName}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
            background: white;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #059669;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .clinic-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #059669;
            margin-bottom: 10px;
          }
          .title { 
            font-size: 24px; 
            margin: 15px 0; 
            color: #333;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
            margin: 5px 0;
          }
          .section { 
            margin-bottom: 30px; 
          }
          .section-title { 
            font-weight: bold; 
            font-size: 18px;
            border-bottom: 2px solid #059669;
            padding-bottom: 8px;
            margin-bottom: 15px;
            color: #059669;
          }
          .patient-info, .prescription-info { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 10px;
          }
          .info-row {
            margin-bottom: 8px;
          }
          .label { 
            font-weight: bold; 
            color: #555;
            display: inline-block;
            width: 150px;
          }
          .value {
            color: #333;
          }
          .medication { 
            border: 1px solid #ddd; 
            padding: 20px; 
            margin-bottom: 20px;
            border-radius: 8px;
            background: #f9f9f9;
          }
          .medication-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .medication-name {
            font-weight: bold;
            font-size: 18px;
            color: #059669;
          }
          .medication-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .detail-item {
            margin-bottom: 8px;
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            border-top: 2px solid #ddd;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .doctor-signature {
            margin-top: 60px;
            border-top: 1px solid #333;
            padding-top: 15px;
            width: 300px;
            float: right;
          }
          .signature-line {
            margin-top: 40px;
            border-top: 1px solid #333;
            width: 200px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
          }
          .status-active {
            background: #d1fae5;
            color: #065f46;
          }
          .status-completed {
            background: #dbeafe;
            color: #1e40af;
          }
          .watermark {
            opacity: 0.1;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: #059669;
            pointer-events: none;
            z-index: -1;
          }
          @media print {
            body { 
              margin: 20px; 
              -webkit-print-color-adjust: exact;
            }
            .no-print { 
              display: none; 
            }
            .medication {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">MEDICAL PRESCRIPTION</div>
        
        <div class="header">
          <div class="clinic-name">HEALTHCARE MEDICAL CENTER</div>
          <div class="title">MEDICAL PRESCRIPTION</div>
          <div class="subtitle">123 Health Street, Medical City, MC 12345</div>
          <div class="subtitle">Phone: (555) 123-4567 | www.healthcaremedical.com</div>
        </div>

        <div class="section">
          <div class="section-title">PATIENT INFORMATION</div>
          <div class="patient-info">
            <div class="info-row">
              <span class="label">Patient Name:</span>
              <span class="value">${patientName}</span>
            </div>
            <div class="info-row">
              <span class="label">Patient ID:</span>
              <span class="value">${patientId}</span>
            </div>
            <div class="info-row">
              <span class="label">Date Issued:</span>
              <span class="value">${new Date(datePrescribed).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="info-row">
              <span class="label">Preferred Pharmacy:</span>
              <span class="value">${pharmacy}</span>
            </div>
            <div class="info-row">
              <span class="label">Prescription Status:</span>
              <span class="value">
                ${status}
                <span class="status-badge status-${status}">${status.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">PRESCRIBING PHYSICIAN</div>
          <div class="info-row">
            <span class="label">Doctor:</span>
            <span class="value">${doctor}</span>
          </div>
          <div class="info-row">
            <span class="label">Medical License:</span>
            <span class="value">MC${selectedPrescription.id.toString().padStart(6, '0')}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">PRESCRIBED MEDICATIONS</div>
          ${medications.map((med, index) => `
            <div class="medication">
              <div class="medication-header">
                <div class="medication-name">${med.name}</div>
                <div style="font-size: 12px; color: #666;">Medication #${index + 1}</div>
              </div>
              <div class="medication-details">
                <div class="detail-item">
                  <span class="label">Dosage:</span>
                  <span class="value">${med.dosage}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Frequency:</span>
                  <span class="value">${med.frequency}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Duration:</span>
                  <span class="value">${med.duration}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Instructions:</span>
                  <span class="value">${med.instructions}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${notes && notes !== 'N/A' ? `
        <div class="section">
          <div class="section-title">SPECIAL INSTRUCTIONS & NOTES</div>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; border-left: 4px solid #059669;">
            ${notes}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="doctor-signature">
            <div style="margin-bottom: 10px;"><strong>Authorized Signature</strong></div>
            <div class="signature-line"></div>
            <div style="margin-top: 10px;">
              <div>${doctor}</div>
              <div>Licensed Physician</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div style="margin-bottom: 10px;">
            <strong>IMPORTANT INFORMATION</strong>
          </div>
          <div style="margin-bottom: 5px;">✓ Take medications exactly as prescribed</div>
          <div style="margin-bottom: 5px;">✓ Do not share medications with others</div>
          <div style="margin-bottom: 5px;">✓ Store medications properly as instructed</div>
          <div style="margin-bottom: 5px;">✓ Report any side effects immediately</div>
          <div style="margin-top: 15px; font-style: italic;">
            This is a computer-generated prescription. Valid only with official clinic stamp.
          </div>
          <div style="margin-top: 10px; font-size: 10px;">
            For medical emergencies, call 911 or visit the nearest emergency room immediately.
          </div>
        </div>

        <script>
          // Auto-print and close
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
            
            // Close window after print (optional)
            window.onafterprint = function() {
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and view patient prescriptions
              </p>
            </div>
            {/* <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Prescription</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients or medications..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
              <button className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Prescriptions Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
          </p>
        </div>

        {/* Prescriptions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPrescriptions.map((prescription) => {
            const patientName = getField(prescription, ['patientName', 'patient_name']);
            const patientId = getField(prescription, ['patientId', 'patient_id']);
            const doctor = getField(prescription, ['doctor']);
            const datePrescribed = getField(prescription, ['datePrescribed', 'prescription_date']);
            const medications = getField(prescription, ['medications']) || [];
            const status = getField(prescription, ['status']);
            const pharmacy = getField(prescription, ['pharmacy']);

            return (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPrescription(prescription)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{patientName}</h3>
                      <p className="text-sm text-gray-600">ID: {patientId}</p>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      <span>{doctor}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{datePrescribed}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Pill className="w-4 h-4 mr-2" />
                      <span>{medications.length} medication(s)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{pharmacy}</span>
                    </div>
                  </div>

                  {/* Medications Preview */}
                  <div className="border-t border-gray-200 pt-4">
                    {medications.slice(0, 2).map((med, index) => (
                      <div key={index} className="text-sm text-gray-700 mb-2 last:mb-0">
                        <span className="font-medium">{med.name}</span>
                        <span className="text-gray-500 ml-2">{med.dosage}</span>
                      </div>
                    ))}
                    {medications.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{medications.length - 2} more medications
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className="text-sm text-gray-600 capitalize">{status}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredPrescriptions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Pill className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {prescriptions.length === 0 ? 'No prescriptions available.' : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
                  <p className="text-gray-600">Prescription #{selectedPrescription.id}</p>
                </div>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Patient Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Patient Name</label>
                      <p className="font-medium">
                        {getField(selectedPrescription, ['patientName', 'patient_name'])}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Patient ID</label>
                      <p className="font-medium">
                        {getField(selectedPrescription, ['patientId', 'patient_id'])}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Pharmacy</label>
                      <p className="font-medium">
                        {getField(selectedPrescription, ['pharmacy'])}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Prescription Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Prescribing Doctor</label>
                      <p className="font-medium">
                        {getField(selectedPrescription, ['doctor'])}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Date Prescribed</label>
                      <p className="font-medium">
                        {getField(selectedPrescription, ['datePrescribed', 'prescription_date'])}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Refills Remaining</label>
                      <p className="font-medium">
                        {getField(selectedPrescription, ['refills'])}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(getField(selectedPrescription, ['status']))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Medications</h3>
                <div className="space-y-4">
                  {getField(selectedPrescription, ['medications']).map((medication, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                        <Pill className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-gray-600">Dosage</label>
                          <p className="font-medium">{medication.dosage}</p>
                        </div>
                        <div>
                          <label className="text-gray-600">Frequency</label>
                          <p className="font-medium">{medication.frequency}</p>
                        </div>
                        <div>
                          <label className="text-gray-600">Duration</label>
                          <p className="font-medium">{medication.duration}</p>
                        </div>
                        <div>
                          <label className="text-gray-600">Instructions</label>
                          <p className="font-medium">{medication.instructions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {getField(selectedPrescription, ['notes']) && getField(selectedPrescription, ['notes']) !== 'N/A' && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Doctor's Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {getField(selectedPrescription, ['notes'])}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Prescription</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;