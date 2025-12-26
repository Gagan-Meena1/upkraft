"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  age?: number;
  address?: string;
  contact?: string;
  courses: any[];
  createdAt: string;
  profileImage?: string;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('academy');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [academyInfo, setAcademyInfo] = useState({
    academyName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSavingAcademyInfo, setIsSavingAcademyInfo] = useState(false);
  const [isLoadingAcademyInfo, setIsLoadingAcademyInfo] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({
    selectedMethods: ['UPI', 'Net Banking', 'Card', 'Cash'],
    preferredMethod: 'UPI',
    paymentGateway: 'Razorpay',
    currency: 'INR'
  });
  const [pricingModel, setPricingModel] = useState('Monthly Subscription');
  const [packagePricing, setPackagePricing] = useState([
    { name: 'Silver', sessions: 4, perSessionRate: 400, discount: 0, totalPrice: 1600 },
    { name: 'Gold', sessions: 12, perSessionRate: 350, discount: 12, totalPrice: 4200 },
    { name: 'Platinum', sessions: 24, perSessionRate: 320, discount: 20, totalPrice: 7680 }
  ]);
  const [monthlySubscriptionPricing, setMonthlySubscriptionPricing] = useState([
    { months: 1, discount: 0 },
    { months: 3, discount: 5 },
    { months: 6, discount: 10 },
    { months: 9, discount: 12 },
    { months: 12, discount: 15 }
  ]);
  const [policies, setPolicies] = useState({
    lateFeePolicy: '₹200 per day (Max ₹1,500)',
    daysUntilOverdue: 3,
    earlyPaymentDiscount: 0,
    autoSuspendAfter: 7
  });
  const [tutorPayout, setTutorPayout] = useState({
    commissionModel: 'Percentage of Course Fee',
    commissionPercentage: 70,
    payoutFrequency: 'Monthly',
    minimumPayoutAmount: '₹1,000'
  });
  const [taxCompliance, setTaxCompliance] = useState({
    defaultGSTRate: '18%',
    academyGSTIN: '',
    invoicePrefix: 'INV',
    nextInvoiceNumber: 125
  });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutApplyOption, setPayoutApplyOption] = useState<'all' | 'select' | 'selectWithStudents'>('all');
  const [tutorsList, setTutorsList] = useState<Array<{_id: string; username: string; email: string}>>([]);
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>([]);
  const [selectedTutorForStudents, setSelectedTutorForStudents] = useState<string>('');
  const [studentsList, setStudentsList] = useState<Array<{_id: string; username: string; email: string}>>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingApplyOption, setPricingApplyOption] = useState<'all' | 'select'>('all');
  const [pricingStudentsList, setPricingStudentsList] = useState<Array<{_id: string; username: string; email: string}>>([]);
  const [selectedPricingStudentIds, setSelectedPricingStudentIds] = useState<string[]>([]);
  const [isLoadingPricingStudents, setIsLoadingPricingStudents] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingAcademyInfo(true);
      try {
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();
        setUserData(userData.user);
        
        // Set initial academy info from user data
        setAcademyInfo({
          academyName: userData.user?.username || '',
          email: userData.user?.email || '',
          phone: userData.user?.contact || '',
          address: userData.user?.address || ''
        });

        // Fetch payment methods settings
        const paymentMethodsResponse = await fetch("/Api/academy/paymentMethods");
        if (paymentMethodsResponse.ok) {
          const paymentMethodsData = await paymentMethodsResponse.json();
          if (paymentMethodsData.success && paymentMethodsData.paymentMethods) {
            setPaymentMethods(paymentMethodsData.paymentMethods);
          }
        }

        // Fetch policies settings
        const policiesResponse = await fetch("/Api/academy/policies");
        if (policiesResponse.ok) {
          const policiesData = await policiesResponse.json();
          if (policiesData.success && policiesData.policies) {
            setPolicies(policiesData.policies);
          }
        }

        // Fetch tax settings
        const taxSettingsResponse = await fetch("/Api/academy/taxSettings");
        if (taxSettingsResponse.ok) {
          const taxSettingsData = await taxSettingsResponse.json();
          if (taxSettingsData.success && taxSettingsData.taxSettings) {
            setTaxCompliance(taxSettingsData.taxSettings);
          }
        }

        // Fetch package pricing settings
        setIsLoadingPricing(true);
        const packagePricingResponse = await fetch("/Api/academy/packagePricing");
        if (packagePricingResponse.ok) {
          const packagePricingData = await packagePricingResponse.json();
          if (packagePricingData.success && packagePricingData.packagePricingSettings) {
            setPricingModel(packagePricingData.packagePricingSettings.pricingModel || 'Monthly Subscription');
            if (packagePricingData.packagePricingSettings.packagePricing && 
                Array.isArray(packagePricingData.packagePricingSettings.packagePricing) &&
                packagePricingData.packagePricingSettings.packagePricing.length > 0) {
              setPackagePricing(packagePricingData.packagePricingSettings.packagePricing);
            }
            if (packagePricingData.packagePricingSettings.monthlySubscriptionPricing && 
                Array.isArray(packagePricingData.packagePricingSettings.monthlySubscriptionPricing) &&
                packagePricingData.packagePricingSettings.monthlySubscriptionPricing.length > 0) {
              setMonthlySubscriptionPricing(packagePricingData.packagePricingSettings.monthlySubscriptionPricing);
            }
          }
        }
        setIsLoadingPricing(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error('Failed to load academy information');
        setIsLoadingPricing(false);
      } finally {
        setIsLoadingAcademyInfo(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveAcademyInfo = async () => {
    // Validate required fields
    if (!academyInfo.academyName || !academyInfo.email) {
      toast.error('Academy name and email are required');
      return;
    }

    setIsSavingAcademyInfo(true);
    try {
      const response = await fetch('/Api/academy/updateInfo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          academyName: academyInfo.academyName,
          email: academyInfo.email,
          phone: academyInfo.phone,
          address: academyInfo.address
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update academy information');
      }

      // Show success message
      toast.success('Academy information saved successfully!');
      
      // Reload the page after a short delay to show the toast message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving academy info:', error);
      toast.error(error.message || 'Failed to save academy information');
      setIsSavingAcademyInfo(false);
    }
  };

  const handleTogglePaymentMethod = (method: string) => {
    setPaymentMethods(prev => {
      const isSelected = prev.selectedMethods.includes(method);
      return {
        ...prev,
        selectedMethods: isSelected
          ? prev.selectedMethods.filter(m => m !== method)
          : [...prev.selectedMethods, method]
      };
    });
  };

  const handleSavePaymentMethods = async () => {
    try {
      console.log('Saving payment methods:', paymentMethods);
      const response = await fetch('/Api/academy/paymentMethods', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentMethods),
        credentials: 'include'
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to update payment methods');
      }

      const data = await response.json();
      console.log('Success response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to update payment methods');
      }

      toast.success('Payment methods saved successfully!');
      
      // Reload the page after a short delay to show the toast message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving payment methods:', error);
      toast.error(error.message || 'Failed to save payment methods');
    }
  };

  const paymentMethodOptions = [
    { id: 'UPI', name: 'UPI', icon: '📱', fee: '0% fee' },
    { id: 'Net Banking', name: 'Net Banking', icon: '🏦', fee: 'Manual' },
    { id: 'Card', name: 'Card', icon: '💳', fee: '2.5% fee' },
    { id: 'Cash', name: 'Cash', icon: '💵', fee: 'Manual entry' }
  ];

  const handleSavePricing = async () => {
    // Open modal to choose apply option
    setShowPricingModal(true);
    fetchPricingStudentsList();
  };

  const fetchPricingStudentsList = async () => {
    setIsLoadingPricingStudents(true);
    try {
      const response = await fetch('/Api/academy/students?page=1&limit=1000', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.students) {
          setPricingStudentsList(data.students.map((student: any) => ({
            _id: student._id,
            username: student.username,
            email: student.email
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching students list:', error);
      toast.error('Failed to load students list');
    } finally {
      setIsLoadingPricingStudents(false);
    }
  };

  const handlePricingStudentToggle = (studentId: string) => {
    setSelectedPricingStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSavePricingSettings = async () => {
    if (pricingApplyOption === 'select' && selectedPricingStudentIds.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsSavingPricing(true);
    try {
      const response = await fetch('/Api/academy/packagePricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pricingModel,
          packagePricing: pricingModel === 'Package' ? packagePricing : [],
          monthlySubscriptionPricing: pricingModel === 'Monthly Subscription' ? monthlySubscriptionPricing : [],
          applyToAll: pricingApplyOption === 'all',
          selectedStudentIds: pricingApplyOption === 'select' ? selectedPricingStudentIds : []
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update package pricing');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to update package pricing');
      }

      toast.success('Package pricing saved successfully!');
      setShowPricingModal(false);
      setPricingApplyOption('all');
      setSelectedPricingStudentIds([]);
      
      // Reload the page after a short delay to show the toast message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving package pricing:', error);
      toast.error(error.message || 'Failed to save package pricing');
      setIsSavingPricing(false);
    }
  };

  const handleSavePolicies = async () => {
    try {
      const response = await fetch('/Api/academy/policies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policies),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update policies');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to update policies');
      }

      toast.success('Policies saved successfully!');
      
      // Reload the page after a short delay to show the toast message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving policies:', error);
      toast.error(error.message || 'Failed to save policies');
    }
  };

  const handleSaveTutorPayout = async () => {
    // Open modal to choose apply option
    setShowPayoutModal(true);
    fetchTutorsList();
  };

  const fetchTutorsList = async () => {
    setIsLoadingTutors(true);
    try {
      const response = await fetch('/Api/academy/tutorsList', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTutorsList(data.tutors || []);
        }
      }
    } catch (error) {
      console.error('Error fetching tutors list:', error);
      toast.error('Failed to load tutors list');
    } finally {
      setIsLoadingTutors(false);
    }
  };

  const fetchStudentsForTutor = async (tutorId: string) => {
    setIsLoadingStudents(true);
    setStudentsList([]);
    setSelectedStudentIds([]);
    try {
      const response = await fetch(`/Api/myStudents?tutorId=${tutorId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.filteredUsers) {
          setStudentsList(data.filteredUsers.map((student: any) => ({
            _id: student._id,
            username: student.username,
            email: student.email
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching students for tutor:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleSavePayoutSettings = async () => {
    if (payoutApplyOption === 'select' && selectedTutorIds.length === 0) {
      toast.error('Please select at least one tutor');
      return;
    }

    if (payoutApplyOption === 'selectWithStudents') {
      if (!selectedTutorForStudents) {
        toast.error('Please select a tutor');
        return;
      }
      if (selectedStudentIds.length === 0) {
        toast.error('Please select at least one student');
        return;
      }
    }

    setIsSavingPayout(true);
    try {
      const response = await fetch('/Api/academy/tutorPayoutSettings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payoutSettings: tutorPayout,
          applyToAll: payoutApplyOption === 'all',
          selectedTutorIds: payoutApplyOption === 'select' ? selectedTutorIds : [],
          tutorWithStudents: payoutApplyOption === 'selectWithStudents' ? {
            tutorId: selectedTutorForStudents,
            studentIds: selectedStudentIds
          } : null
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Payout settings saved successfully!');
        setShowPayoutModal(false);
        setPayoutApplyOption('all');
        setSelectedTutorIds([]);
        setSelectedTutorForStudents('');
        setSelectedStudentIds([]);
        setStudentsList([]);
      } else {
        toast.error(data.error || 'Failed to save payout settings');
      }
    } catch (error) {
      console.error('Error saving payout settings:', error);
      toast.error('Failed to save payout settings');
    } finally {
      setIsSavingPayout(false);
    }
  };

  const handleTutorToggle = (tutorId: string) => {
    setSelectedTutorIds(prev => {
      if (prev.includes(tutorId)) {
        return prev.filter(id => id !== tutorId);
      } else {
        return [...prev, tutorId];
      }
    });
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleTutorSelectForStudents = (tutorId: string) => {
    setSelectedTutorForStudents(tutorId);
    if (tutorId) {
      fetchStudentsForTutor(tutorId);
    } else {
      setStudentsList([]);
      setSelectedStudentIds([]);
    }
  };

  const handleSaveTaxCompliance = async () => {
    try {
      const response = await fetch('/Api/academy/taxSettings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taxCompliance),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tax settings');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to update tax settings');
      }

      toast.success('Tax settings saved successfully!');
      
      // Reload the page after a short delay to show the toast message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving tax compliance:', error);
      toast.error(error.message || 'Failed to save tax settings');
    }
  };

  const handlePackagePricingChange = (index: number, field: string, value: number | string) => {
    const updated = [...packagePricing];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate total price when sessions or perSessionRate changes
    if (field === 'sessions' || field === 'perSessionRate') {
      const totalPrice = updated[index].sessions * updated[index].perSessionRate;
      updated[index] = { ...updated[index], totalPrice };
    }
    
    setPackagePricing(updated);
  };

  const handleMonthlySubscriptionDiscountChange = (index: number, value: number) => {
    const updated = [...monthlySubscriptionPricing];
    updated[index] = { ...updated[index], discount: value };
    setMonthlySubscriptionPricing(updated);
  };

  const paymentModelOptions = [
    { id: 'Monthly Subscription', name: 'Monthly Subscription', description: 'Fixed monthly fee for unlimited sessions' },
    { id: 'Package', name: 'Package', description: 'Bulk session packages at discounted rates' }
  ];

  const settingsNavItems = [
    { id: 'academy', label: '🏛️ Academy Info', section: 'General' },
    // { id: 'users', label: '👥 Users & Permissions', section: 'General' },
    { id: 'payment-methods', label: '💳 Payment Methods', section: 'Payments' },
    { id: 'pricing', label: '💰 Pricing & Models', section: 'Payments' },
    { id: 'policies', label: '📋 Policies', section: 'Payments' },
    { id: 'tutor-payout', label: '🤝 Tutor Payouts', section: 'Payments' },
    { id: 'tax', label: '🧾 Tax & Compliance', section: 'Payments' },
    // { id: 'notifications', label: '🔔 Notifications', section: 'Other' }
  ];

  const groupedNavItems = settingsNavItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof settingsNavItems>);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f7',
      padding: '30px'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          color: '#1a1a1a',
          margin: 0,
          fontWeight: 600
        }}>Settings</h1>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '250px 1fr', 
        gap: '20px' 
      }}>
        {/* Left Navigation */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: 'fit-content'
        }}>
          {Object.entries(groupedNavItems).map(([section, items], sectionIndex) => (
            <div key={section}>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '12px 16px',
                marginTop: sectionIndex > 0 ? '16px' : '0',
                marginBottom: '8px'
              }}>
                {section}
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    transition: 'all 0.3s',
                    fontSize: '14px',
                    color: activeSection === item.id ? 'white' : '#666',
                    background: activeSection === item.id 
                      ? 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)' 
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.background = '#f5f5f7';
                      e.currentTarget.style.color = '#1a1a1a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#666';
                    }
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Main Settings Content */}
        <div>
          {/* Academy Info Section */}
          {activeSection === 'academy' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                Academy Information
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                Update your academy details
              </div>

              {/* Loader */}
              {isLoadingAcademyInfo ? (
                <>
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin-loader {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}} />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '60px 20px',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <div 
                      style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #6200EA',
                        borderRadius: '50%',
                        animation: 'spin-loader 1s linear infinite'
                      }}
                    ></div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      Loading academy information...
                    </div>
                  </div>
                </>
              ) : (
                <>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '8px'
                }}>
                  Academy Name
                </label>
                <input
                  type="text"
                  value={academyInfo.academyName}
                  onChange={(e) => setAcademyInfo({ ...academyInfo, academyName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={academyInfo.email}
                    onChange={(e) => setAcademyInfo({ ...academyInfo, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={academyInfo.phone}
                    onChange={(e) => setAcademyInfo({ ...academyInfo, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '8px'
                }}>
                  Address
                </label>
                <input
                  type="text"
                  value={academyInfo.address}
                  onChange={(e) => setAcademyInfo({ ...academyInfo, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '25px'
              }}>
                <button
                  onClick={handleSaveAcademyInfo}
                  disabled={isSavingAcademyInfo}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSavingAcademyInfo ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: isSavingAcademyInfo 
                      ? '#ccc' 
                      : 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                    color: 'white',
                    transition: 'all 0.3s',
                    opacity: isSavingAcademyInfo ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSavingAcademyInfo) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(98, 0, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSavingAcademyInfo) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isSavingAcademyInfo ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
                </>
              )}
            </div>
          )}

          {/* Payment Methods Section */}
          {activeSection === 'payment-methods' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                💳 Payment Methods
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                Choose which payment methods to accept from students
              </div>

              {/* Payment Methods Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '15px',
                marginBottom: '25px'
              }}>
                {paymentMethodOptions.map((method) => {
                  const isSelected = paymentMethods.selectedMethods.includes(method.id);
                  return (
                    <div
                      key={method.id}
                      onClick={() => handleTogglePaymentMethod(method.id)}
                      style={{
                        border: `2px solid ${isSelected ? '#6200EA' : '#ddd'}`,
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        background: isSelected ? '#f5f0ff' : 'white',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#6200EA';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#ddd';
                        }
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '20px',
                          height: '20px',
                          background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </div>
                      )}
                      <div style={{
                        fontSize: '28px',
                        marginBottom: '8px'
                      }}>
                        {method.icon}
                      </div>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '13px',
                        color: '#1a1a1a',
                        marginBottom: '4px'
                      }}>
                        {method.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '4px'
                      }}>
                        {method.fee}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Preferred Payment Method
                  </label>
                  <select
                    value={paymentMethods.preferredMethod}
                    onChange={(e) => setPaymentMethods({ ...paymentMethods, preferredMethod: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    {paymentMethodOptions.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Payment Gateway
                  </label>
                  <select
                    value={paymentMethods.paymentGateway}
                    onChange={(e) => setPaymentMethods({ ...paymentMethods, paymentGateway: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="Razorpay">Razorpay</option>
                    <option value="PayU">PayU</option>
                    <option value="Cashfree">Cashfree</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Currency
                  </label>
                  <select
                    value={paymentMethods.currency}
                    onChange={(e) => setPaymentMethods({ ...paymentMethods, currency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="INR">INR - Indian Rupee (₹)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '25px'
              }}>
                <button
                  onClick={handleSavePaymentMethods}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                    color: 'white',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(98, 0, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Save Payment Methods
                </button>
              </div>
            </div>
          )}

          {/* Pricing & Models Section */}
          {activeSection === 'pricing' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                💰 Pricing & Revenue Models
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                Configure how students are charged for courses
              </div>

              {isLoadingPricing ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '40px',
                  color: '#666'
                }}>
                  Loading pricing settings...
                </div>
              ) : (
                <>

              {/* Payment Model Selection */}
              <div style={{
                background: '#fafafa',
                borderLeft: '4px solid #6200EA',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '16px'
                }}>
                  Payment Model
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  {paymentModelOptions.map((model) => {
                    const isSelected = pricingModel === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => setPricingModel(model.id)}
                        style={{
                          border: `2px solid ${isSelected ? '#6200EA' : '#ddd'}`,
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          background: isSelected ? '#f5f0ff' : 'white',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#6200EA';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#ddd';
                          }
                        }}
                      >
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '15px',
                            width: '24px',
                            height: '24px',
                            background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            ✓
                          </div>
                        )}
                        <div style={{
                          fontWeight: 600,
                          fontSize: '15px',
                          color: '#1a1a1a',
                          marginBottom: '8px'
                        }}>
                          {model.name}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#666',
                          lineHeight: '1.4'
                        }}>
                          {model.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Subscription Pricing Table - Only visible when Monthly Subscription model is selected */}
              {pricingModel === 'Monthly Subscription' && (
                <div style={{
                  background: '#fafafa',
                  borderLeft: '4px solid #6200EA',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '16px'
                  }}>
                    Monthly Subscription Pricing (for Monthly Subscription Model)
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px'
                    }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                          <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#1a1a1a'
                          }}>Duration</th>
                          <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#1a1a1a'
                          }}>Discount %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlySubscriptionPricing.map((subscription, index) => (
                          <tr key={subscription.months} style={{ borderBottom: index < monthlySubscriptionPricing.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                            <td style={{
                              padding: '12px',
                              fontWeight: 600
                            }}>
                              {subscription.months} {subscription.months === 1 ? 'Month' : 'Months'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="number"
                                value={subscription.discount}
                                onChange={(e) => handleMonthlySubscriptionDiscountChange(index, parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                style={{
                                  width: '100px',
                                  padding: '8px',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontFamily: 'inherit',
                                  backgroundColor: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Package Pricing Table - Only visible when Package model is selected */}
              {pricingModel === 'Package' && (
                <div style={{
                  background: '#fafafa',
                  borderLeft: '4px solid #6200EA',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '16px'
                  }}>
                    Package Pricing (for Package Model)
                  </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                      }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                            <th style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontWeight: 600,
                              color: '#1a1a1a'
                            }}>Package</th>
                            <th style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontWeight: 600,
                              color: '#1a1a1a'
                            }}>Sessions</th>
                            <th style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontWeight: 600,
                              color: '#1a1a1a'
                            }}>Per Session Rate</th>
                            <th style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontWeight: 600,
                              color: '#1a1a1a'
                            }}>Total Price</th>
                            <th style={{
                              padding: '12px',
                              textAlign: 'left',
                              fontWeight: 600,
                              color: '#1a1a1a'
                            }}>Discount %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {packagePricing.map((pkg, index) => (
                            <tr key={index} style={{ borderBottom: index < packagePricing.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                              <td style={{ padding: '12px' }}>
                                <input
                                  type="text"
                                  value={pkg.name}
                                  onChange={(e) => handlePackagePricingChange(index, 'name', e.target.value)}
                                  style={{
                                    width: '100px',
                                    padding: '8px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    fontWeight: 600
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                              </td>
                              <td style={{ padding: '12px' }}>
                                <input
                                  type="number"
                                  value={pkg.sessions}
                                  onChange={(e) => handlePackagePricingChange(index, 'sessions', parseInt(e.target.value) || 0)}
                                  style={{
                                    width: '60px',
                                    padding: '8px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                              </td>
                              <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>₹</span>
                                  <input
                                    type="number"
                                    value={pkg.perSessionRate}
                                    onChange={(e) => handlePackagePricingChange(index, 'perSessionRate', parseInt(e.target.value) || 0)}
                                    style={{
                                      width: '70px',
                                      padding: '8px',
                                      border: '2px solid #e0e0e0',
                                      borderRadius: '8px',
                                      fontSize: '14px',
                                      fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                  />
                                </div>
                              </td>
                              <td style={{
                                padding: '12px',
                                fontWeight: 600
                              }}>
                                ₹{pkg.totalPrice.toLocaleString('en-IN')}
                              </td>
                              <td style={{ padding: '12px' }}>
                                <input
                                  type="number"
                                  value={pkg.discount}
                                  onChange={(e) => handlePackagePricingChange(index, 'discount', parseInt(e.target.value) || 0)}
                                  style={{
                                    width: '60px',
                                    padding: '8px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              )}

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '25px'
              }}>
                <button
                  onClick={handleSavePricing}
                  disabled={isSavingPricing}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSavingPricing ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: isSavingPricing 
                      ? '#ccc' 
                      : 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                    color: 'white',
                    transition: 'all 0.3s',
                    opacity: isSavingPricing ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSavingPricing) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(98, 0, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSavingPricing) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isSavingPricing ? 'Saving...' : 'Save Pricing'}
                </button>
              </div>
                </>
              )}
            </div>
          )}

          {/* Policies Section */}
          {activeSection === 'policies' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📋 Payment Policies & Rules
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                Configure late fees, discounts, and payment deadlines
              </div>

              {/* Form Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Late Fee Policy(₹)
                  </label>
                  <input
                    type="text"
                    value={policies.lateFeePolicy}
                    onChange={(e) => setPolicies({ ...policies, lateFeePolicy: e.target.value })}
                    placeholder="e.g., ₹200 per day (Max ₹1,500)"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Days Until Payment is Overdue
                  </label>
                  <input
                    type="number"
                    value={policies.daysUntilOverdue}
                    onChange={(e) => setPolicies({ ...policies, daysUntilOverdue: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="30"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Payment marked overdue after this many days from due date
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Early Payment Discount (%)
                  </label>
                  <input
                    type="number"
                    value={policies.earlyPaymentDiscount}
                    onChange={(e) => setPolicies({ ...policies, earlyPaymentDiscount: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Discount if paid 5 days before due date
                  </div>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Auto-suspend After (Days)
                  </label>
                  <input
                    type="number"
                    value={policies.autoSuspendAfter}
                    onChange={(e) => setPolicies({ ...policies, autoSuspendAfter: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Days overdue before student access is suspended (0 = disabled)
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '25px'
              }}>
                <button
                  onClick={handleSavePolicies}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                    color: 'white',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(98, 0, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Save Policies
                </button>
              </div>
            </div>
          )}

          {/* Tutor Payout Section */}
          {activeSection === 'tutor-payout' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🤝 Tutor Payout Configuration
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                Configure how tutors are compensated from student payments
              </div>

              {/* Alert Box */}
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                gap: '12px',
                fontSize: '14px',
                background: '#e3f2fd',
                border: '1px solid #90caf9',
                color: '#1565c0'
              }}>
                <span>ℹ️</span>
                <div>Tutor commission impacts your revenue reconciliation calculations. Choose wisely.</div>
              </div>

              {/* Form Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Tutor Commission Model
                  </label>
                  <select
                    value={tutorPayout.commissionModel}
                    onChange={(e) => setTutorPayout({ ...tutorPayout, commissionModel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="Percentage of Course Fee">Percentage of Course Fee</option>
                    <option value="Fixed Amount per Session">Fixed Amount per Session</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Commission Percentage
                  </label>
                  <input
                    type="number"
                    value={tutorPayout.commissionPercentage}
                    onChange={(e) => setTutorPayout({ ...tutorPayout, commissionPercentage: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Tutor gets {tutorPayout.commissionPercentage}%, Academy gets {100 - tutorPayout.commissionPercentage}%
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Payout Frequency
                  </label>
                  <select
                    value={tutorPayout.payoutFrequency}
                    onChange={(e) => setTutorPayout({ ...tutorPayout, payoutFrequency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Minimum Payout Amount
                  </label>
                  <input
                    type="text"
                    value={tutorPayout.minimumPayoutAmount}
                    onChange={(e) => setTutorPayout({ ...tutorPayout, minimumPayoutAmount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Payouts only processed if pending amount exceeds this
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '25px'
              }}>
                <button
                  onClick={handleSaveTutorPayout}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                    color: 'white',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(98, 0, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Save Payout Settings
                </button>
              </div>
            </div>
          )}

          {/* Tax & Compliance Section */}
          {activeSection === 'tax' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🧾 Tax & Compliance
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                GST and invoice configuration
              </div>

              {/* Form Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Default GST Rate
                  </label>
                  <select
                    value={taxCompliance.defaultGSTRate}
                    onChange={(e) => setTaxCompliance({ ...taxCompliance, defaultGSTRate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="18%">18%</option>
                    <option value="5%">5%</option>
                    <option value="12%">12%</option>
                    <option value="28%">28%</option>
                    <option value="No GST">No GST</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Academy GSTIN
                  </label>
                  <input
                    type="text"
                    value={taxCompliance.academyGSTIN}
                    onChange={(e) => setTaxCompliance({ ...taxCompliance, academyGSTIN: e.target.value })}
                    placeholder="27ABCDE1234F1Z0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Used for invoice generation and tax filing
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={taxCompliance.invoicePrefix}
                    onChange={(e) => setTaxCompliance({ ...taxCompliance, invoicePrefix: e.target.value })}
                    placeholder="e.g., INV"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Invoices will be numbered: {taxCompliance.invoicePrefix}-00001, {taxCompliance.invoicePrefix}-00002, etc.
                  </div>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Next Invoice Number
                  </label>
                  <input
                    type="number"
                    value={taxCompliance.nextInvoiceNumber}
                    onChange={(e) => setTaxCompliance({ ...taxCompliance, nextInvoiceNumber: parseInt(e.target.value) || 0 })}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      fontFamily: 'inherit',
                      background: '#f5f5f7',
                      cursor: 'not-allowed'
                    }}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Auto-increments with each invoice
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '25px'
              }}>
                <button
                  onClick={handleSaveTaxCompliance}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                    color: 'white',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(98, 0, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Save Tax Settings
                </button>
              </div>
            </div>
          )}

          {/* Placeholder for other sections */}
          {activeSection !== 'academy' && activeSection !== 'payment-methods' && activeSection !== 'pricing' && activeSection !== 'policies' && activeSection !== 'tutor-payout' && activeSection !== 'tax' && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>This section will be implemented soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payout Settings Modal */}
      {showPayoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => {
          if (!isSavingPayout) {
            setShowPayoutModal(false);
            setPayoutApplyOption('all');
            setSelectedTutorIds([]);
            setSelectedTutorForStudents('');
            setSelectedStudentIds([]);
            setStudentsList([]);
          }
        }}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 10001
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '20px'
            }}>
              Apply Payout Settings
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '12px',
                cursor: 'pointer',
                backgroundColor: payoutApplyOption === 'all' ? '#f3e5f5' : 'white',
                transition: 'all 0.3s'
              }}
              onClick={() => {
                setPayoutApplyOption('all');
                setSelectedTutorIds([]);
                setSelectedTutorForStudents('');
                setSelectedStudentIds([]);
                setStudentsList([]);
              }}
              >
                <input
                  type="radio"
                  checked={payoutApplyOption === 'all'}
                  onChange={() => {
                    setPayoutApplyOption('all');
                    setSelectedTutorIds([]);
                    setSelectedTutorForStudents('');
                    setSelectedStudentIds([]);
                    setStudentsList([]);
                  }}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Set for all tutors</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '12px',
                cursor: 'pointer',
                backgroundColor: payoutApplyOption === 'select' ? '#f3e5f5' : 'white',
                transition: 'all 0.3s'
              }}
              onClick={() => {
                setPayoutApplyOption('select');
                setSelectedTutorForStudents('');
                setSelectedStudentIds([]);
                setStudentsList([]);
              }}
              >
                <input
                  type="radio"
                  checked={payoutApplyOption === 'select'}
                  onChange={() => {
                    setPayoutApplyOption('select');
                    setSelectedTutorForStudents('');
                    setSelectedStudentIds([]);
                    setStudentsList([]);
                  }}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Select tutors</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: payoutApplyOption === 'selectWithStudents' ? '#f3e5f5' : 'white',
                transition: 'all 0.3s'
              }}
              onClick={() => {
                setPayoutApplyOption('selectWithStudents');
                setSelectedTutorIds([]);
              }}
              >
                <input
                  type="radio"
                  checked={payoutApplyOption === 'selectWithStudents'}
                  onChange={() => {
                    setPayoutApplyOption('selectWithStudents');
                    setSelectedTutorIds([]);
                  }}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Select tutors with students</span>
              </label>
            </div>

            {payoutApplyOption === 'select' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '8px'
                }}>
                  Select Tutors
                </label>
                {isLoadingTutors ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Loading tutors...</p>
                  </div>
                ) : tutorsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    <p>No tutors found</p>
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px'
                  }}>
                    {tutorsList.map((tutor) => (
                      <label
                        key={tutor._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          marginBottom: '4px',
                          backgroundColor: selectedTutorIds.includes(tutor._id) ? '#e3f2fd' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTutorIds.includes(tutor._id)}
                          onChange={() => handleTutorToggle(tutor._id)}
                          style={{ marginRight: '10px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px' }}>
                          {tutor.username} ({tutor.email})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {payoutApplyOption === 'selectWithStudents' && (
              <div style={{ marginBottom: '20px' }}>
                {/* Tutor Selection Dropdown */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '8px'
                  }}>
                    Select Tutor
                  </label>
                  {isLoadingTutors ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p>Loading tutors...</p>
                    </div>
                  ) : (
                    <select
                      value={selectedTutorForStudents}
                      onChange={(e) => handleTutorSelectForStudents(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s',
                        fontFamily: 'inherit',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    >
                      <option value="">-- Select a tutor --</option>
                      {tutorsList.map((tutor) => (
                        <option key={tutor._id} value={tutor._id}>
                          {tutor.username} ({tutor.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Students List */}
                {selectedTutorForStudents && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      marginBottom: '8px'
                    }}>
                      Select Students
                    </label>
                    {isLoadingStudents ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Loading students...</p>
                      </div>
                    ) : studentsList.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        <p>No students found for this tutor</p>
                      </div>
                    ) : (
                      <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '8px'
                      }}>
                        {studentsList.map((student) => (
                          <label
                            key={student._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              marginBottom: '4px',
                              backgroundColor: selectedStudentIds.includes(student._id) ? '#e3f2fd' : 'transparent',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(student._id)}
                              onChange={() => handleStudentToggle(student._id)}
                              style={{ marginRight: '10px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px' }}>
                              {student.username} ({student.email})
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                  setPayoutApplyOption('all');
                  setSelectedTutorIds([]);
                  setSelectedTutorForStudents('');
                  setSelectedStudentIds([]);
                  setStudentsList([]);
                }}
                disabled={isSavingPayout}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSavingPayout ? 'not-allowed' : 'pointer',
                  opacity: isSavingPayout ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayoutSettings}
                disabled={
                  isSavingPayout || 
                  (payoutApplyOption === 'select' && selectedTutorIds.length === 0) ||
                  (payoutApplyOption === 'selectWithStudents' && (!selectedTutorForStudents || selectedStudentIds.length === 0))
                }
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isSavingPayout || 
                    (payoutApplyOption === 'select' && selectedTutorIds.length === 0) ||
                    (payoutApplyOption === 'selectWithStudents' && (!selectedTutorForStudents || selectedStudentIds.length === 0))
                    ? '#ccc'
                    : 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSavingPayout || 
                    (payoutApplyOption === 'select' && selectedTutorIds.length === 0) ||
                    (payoutApplyOption === 'selectWithStudents' && (!selectedTutorForStudents || selectedStudentIds.length === 0))
                    ? 'not-allowed'
                    : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {isSavingPayout ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Settings Modal */}
      {showPricingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => {
          if (!isSavingPricing) {
            setShowPricingModal(false);
            setPricingApplyOption('all');
            setSelectedPricingStudentIds([]);
          }
        }}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 10001
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '20px'
            }}>
              Apply Pricing Settings
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '12px',
                cursor: 'pointer',
                backgroundColor: pricingApplyOption === 'all' ? '#f3e5f5' : 'white',
                transition: 'all 0.3s'
              }}
              onClick={() => {
                setPricingApplyOption('all');
                setSelectedPricingStudentIds([]);
              }}
              >
                <input
                  type="radio"
                  checked={pricingApplyOption === 'all'}
                  onChange={() => {
                    setPricingApplyOption('all');
                    setSelectedPricingStudentIds([]);
                  }}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Apply to all students</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: pricingApplyOption === 'select' ? '#f3e5f5' : 'white',
                transition: 'all 0.3s'
              }}
              onClick={() => {
                setPricingApplyOption('select');
              }}
              >
                <input
                  type="radio"
                  checked={pricingApplyOption === 'select'}
                  onChange={() => {
                    setPricingApplyOption('select');
                  }}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Select Students</span>
              </label>
            </div>

            {pricingApplyOption === 'select' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '8px'
                }}>
                  Select Students
                </label>
                {isLoadingPricingStudents ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Loading students...</p>
                  </div>
                ) : pricingStudentsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    <p>No students found</p>
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px'
                  }}>
                    {pricingStudentsList.map((student) => (
                      <label
                        key={student._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          marginBottom: '4px',
                          backgroundColor: selectedPricingStudentIds.includes(student._id) ? '#e3f2fd' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPricingStudentIds.includes(student._id)}
                          onChange={() => handlePricingStudentToggle(student._id)}
                          style={{ marginRight: '10px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px' }}>
                          {student.username} ({student.email})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => {
                  setShowPricingModal(false);
                  setPricingApplyOption('all');
                  setSelectedPricingStudentIds([]);
                }}
                disabled={isSavingPricing}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSavingPricing ? 'not-allowed' : 'pointer',
                  opacity: isSavingPricing ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePricingSettings}
                disabled={
                  isSavingPricing || 
                  (pricingApplyOption === 'select' && selectedPricingStudentIds.length === 0)
                }
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isSavingPricing || 
                    (pricingApplyOption === 'select' && selectedPricingStudentIds.length === 0)
                    ? '#ccc'
                    : 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSavingPricing || 
                    (pricingApplyOption === 'select' && selectedPricingStudentIds.length === 0)
                    ? 'not-allowed'
                    : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {isSavingPricing ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

