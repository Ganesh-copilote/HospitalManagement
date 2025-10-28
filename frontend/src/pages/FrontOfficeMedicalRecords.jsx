import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Printer
} from 'lucide-react';
import { getAllMedicalRecords, viewMedicalRecord } from '../services/api';

const FrontOfficeMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAllMedicalRecords();
        console.log('📋 Medical Records API Response:', response);
        
        // Handle the response structure from the new backend
        if (response.success && response.medical_records) {
          setRecords(response.medical_records);
        } else if (response.medical_records) {
          setRecords(response.medical_records);
        } else if (Array.isArray(response)) {
          setRecords(response);
        } else {
          setRecords([]);
          console.warn('Unexpected API response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching medical records:', error);
        setError('Failed to load medical records');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Helper function to get field value regardless of naming convention
  const getField = (record, fieldNames) => {
    for (const fieldName of fieldNames) {
      if (record[fieldName] !== undefined && record[fieldName] !== null) {
        return record[fieldName];
      }
    }
    return 'N/A';
  };

  const handleViewRecord = async (recordId) => {
    try {
      await viewMedicalRecord(recordId);
    } catch (error) {
      console.error('Error viewing record:', error);
      alert('Failed to open medical record file');
    }
  };

  const handlePrintRecord = () => {
    if (!selectedRecord) return;

    // Get all the medical record data
    const patientName = getField(selectedRecord, ['patientName', 'patient_name']);
    const patientId = getField(selectedRecord, ['patientId', 'patient_id']);
    const recordType = getField(selectedRecord, ['record_type', 'recordType']);
    const doctor = getField(selectedRecord, ['doctor_name', 'doctor']);
    const date = getField(selectedRecord, ['date', 'record_date', 'created_date']);
    const diagnosis = getField(selectedRecord, ['diagnosis', 'notes']);
    const notes = getField(selectedRecord, ['notes']);
    const priority = getField(selectedRecord, ['priority']);
    const status = getField(selectedRecord, ['status']);
    const filePath = getField(selectedRecord, ['file_path']);

    // Create a print-friendly window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Record - ${patientName}</title>
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
          .info-grid { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 10px;
          }
          .info-row {
            margin-bottom: 12px;
          }
          .label { 
            font-weight: bold; 
            color: #555;
            display: inline-block;
            width: 180px;
          }
          .value {
            color: #333;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
          }
          .priority-high {
            background: #fee2e2;
            color: #dc2626;
          }
          .priority-medium {
            background: #fef3c7;
            color: #d97706;
          }
          .priority-low {
            background: #d1fae5;
            color: #065f46;
          }
          .status-active {
            background: #d1fae5;
            color: #065f46;
          }
          .status-completed {
            background: #dbeafe;
            color: #1e40af;
          }
          .status-cancelled {
            background: #fee2e2;
            color: #dc2626;
          }
          .content-box {
            border: 1px solid #ddd; 
            padding: 20px; 
            margin-bottom: 20px;
            border-radius: 8px;
            background: #f9f9f9;
          }
          .content-title {
            font-weight: bold;
            font-size: 16px;
            color: #059669;
            margin-bottom: 10px;
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            border-top: 2px solid #ddd;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .signature-area {
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
          .record-id {
            background: #f3f4f6;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
          }
          @media print {
            body { 
              margin: 20px; 
              -webkit-print-color-adjust: exact;
            }
            .no-print { 
              display: none; 
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">MEDICAL RECORD</div>
        
        <div class="header">
          <div class="clinic-name">HEALTHCARE MEDICAL CENTER</div>
          <div class="title">MEDICAL RECORD</div>
          <div class="subtitle">123 Health Street, Medical City, MC 12345</div>
          <div class="subtitle">Phone: (555) 123-4567 | www.healthcaremedical.com</div>
        </div>

        <div class="record-id">
          Medical Record ID: #${selectedRecord.id} | Generated on: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        <div class="section">
          <div class="section-title">PATIENT INFORMATION</div>
          <div class="info-grid">
            <div class="info-row">
              <span class="label">Patient Name:</span>
              <span class="value">${patientName}</span>
            </div>
            <div class="info-row">
              <span class="label">Patient ID:</span>
              <span class="value">${patientId}</span>
            </div>
            <div class="info-row">
              <span class="label">Record Type:</span>
              <span class="value">${recordType}</span>
            </div>
            <div class="info-row">
              <span class="label">Record Date:</span>
              <span class="value">${new Date(date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">MEDICAL DETAILS</div>
          <div class="info-grid">
            <div class="info-row">
              <span class="label">Attending Doctor:</span>
              <span class="value">${doctor}</span>
            </div>
            <div class="info-row">
              <span class="label">Priority Level:</span>
              <span class="value">
                ${priority}
                <span class="status-badge priority-${priority}">${priority ? priority.toUpperCase() : 'NORMAL'}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Record Status:</span>
              <span class="value">
                ${status}
                <span class="status-badge status-${status}">${status ? status.toUpperCase() : 'UNKNOWN'}</span>
              </span>
            </div>
            ${filePath && filePath !== 'N/A' ? `
            <div class="info-row">
              <span class="label">Attachment:</span>
              <span class="value">${filePath.split('/').pop()}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">MEDICAL CONTENT</div>
          <div class="content-box">
            <div class="content-title">Diagnosis & Findings</div>
            <div style="white-space: pre-wrap; line-height: 1.8;">
              ${diagnosis || 'No diagnosis recorded'}
            </div>
          </div>

          ${notes && notes !== diagnosis && notes !== 'N/A' ? `
          <div class="content-box">
            <div class="content-title">Additional Notes & Observations</div>
            <div style="white-space: pre-wrap; line-height: 1.8;">
              ${notes}
            </div>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="signature-area">
            <div style="margin-bottom: 10px;"><strong>Authorized Signature</strong></div>
            <div class="signature-line"></div>
            <div style="margin-top: 10px;">
              <div>${doctor}</div>
              <div>Licensed Healthcare Provider</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div style="margin-bottom: 10px;">
            <strong>CONFIDENTIAL MEDICAL INFORMATION</strong>
          </div>
          <div style="margin-bottom: 5px;">✓ This document contains protected health information</div>
          <div style="margin-bottom: 5px;">✓ Unauthorized disclosure is prohibited by law</div>
          <div style="margin-bottom: 5px;">✓ For authorized medical use only</div>
          <div style="margin-top: 15px; font-style: italic;">
            This is an official medical record. Keep in secure storage.
          </div>
          <div style="margin-top: 10px; font-size: 10px;">
            Document generated electronically. Valid without signature.
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

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[priority] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Normal'}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
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
              <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and view patient medical records
              </p>
            </div>
            {/* <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>New Record</span>
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
                  placeholder="Search patients, ID, diagnosis, or record type..."
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
              </select>
              <button className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Records Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredRecords.length} of {records.length} records
          </p>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getField(record, ['patientName', 'patient_name']) || 'Unknown Patient'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {getField(record, ['patientId', 'patient_id']) || 'N/A'}
                    </p>
                  </div>
                  {getPriorityBadge(getField(record, ['priority']))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{getField(record, ['record_type', 'recordType']) || 'General Record'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    <span>{getField(record, ['doctor_name', 'doctor']) || 'Unknown Doctor'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{getField(record, ['date', 'record_date', 'created_date']) || 'No date'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {getField(record, ['diagnosis', 'notes']) || 'No diagnosis information'}
                  </p>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(getField(record, ['status']))}
                    <span className="text-sm text-gray-600 capitalize">
                      {getField(record, ['status']) || 'unknown'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {getField(record, ['file_path']) && (
                      <button 
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecord(record.id);
                        }}
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRecords.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {records.length === 0 ? 'No medical records available.' : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Medical Record Details</h2>
                  <p className="text-gray-600">Record #{selectedRecord.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Patient Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Patient Name</label>
                      <p className="font-medium">
                        {getField(selectedRecord, ['patientName', 'patient_name']) || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Patient ID</label>
                      <p className="font-medium">
                        {getField(selectedRecord, ['patientId', 'patient_id']) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Record Type</label>
                      <p className="font-medium">
                        {getField(selectedRecord, ['record_type', 'recordType']) || 'General Record'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Medical Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Attending Doctor</label>
                      <p className="font-medium">
                        {getField(selectedRecord, ['doctor_name', 'doctor']) || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Date</label>
                      <p className="font-medium">
                        {getField(selectedRecord, ['date', 'record_date', 'created_date']) || 'No date'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Priority</label>
                      <div className="mt-1">
                        {getPriorityBadge(getField(selectedRecord, ['priority']))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <div className="mt-1 flex items-center space-x-2">
                        {getStatusIcon(getField(selectedRecord, ['status']))}
                        <span className="capitalize">
                          {getField(selectedRecord, ['status']) || 'unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Diagnosis</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {getField(selectedRecord, ['diagnosis', 'notes']) || 'No diagnosis recorded'}
                </p>
              </div>

              {getField(selectedRecord, ['notes']) && getField(selectedRecord, ['notes']) !== getField(selectedRecord, ['diagnosis']) && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {getField(selectedRecord, ['notes'])}
                  </p>
                </div>
              )}

              {getField(selectedRecord, ['file_path']) && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">
                        {getField(selectedRecord, ['file_path']).split('/').pop() || 'Medical record file'}
                      </span>
                      <button 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleViewRecord(selectedRecord.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={handlePrintRecord}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Record</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FrontOfficeMedicalRecords;