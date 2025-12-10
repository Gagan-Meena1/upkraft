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
  const [pricingModel, setPricingModel] = useState('Per Session');
  const [packagePricing, setPackagePricing] = useState([
    { name: 'Silver', sessions: 4, perSessionRate: 400, discount: 0, totalPrice: 1600 },
    { name: 'Gold', sessions: 12, perSessionRate: 350, discount: 12, totalPrice: 4200 },
    { name: 'Platinum', sessions: 24, perSessionRate: 320, discount: 20, totalPrice: 7680 }
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
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error('Failed to load academy information');
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
    try {
      // TODO: Implement API call to save pricing
      console.log('Saving pricing:', { pricingModel, packagePricing });
      alert('Pricing saved successfully!');
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to save pricing');
    }
  };

  const handleSavePolicies = async () => {
    try {
      // TODO: Implement API call to save policies
      console.log('Saving policies:', policies);
      alert('Policies saved successfully!');
    } catch (error) {
      console.error('Error saving policies:', error);
      alert('Failed to save policies');
    }
  };

  const handleSaveTutorPayout = async () => {
    try {
      // TODO: Implement API call to save tutor payout settings
      console.log('Saving tutor payout:', tutorPayout);
      alert('Tutor payout settings saved successfully!');
    } catch (error) {
      console.error('Error saving tutor payout:', error);
      alert('Failed to save tutor payout settings');
    }
  };

  const handleSaveTaxCompliance = async () => {
    try {
      // TODO: Implement API call to save tax compliance settings
      console.log('Saving tax compliance:', taxCompliance);
      alert('Tax settings saved successfully!');
    } catch (error) {
      console.error('Error saving tax compliance:', error);
      alert('Failed to save tax settings');
    }
  };

  const handlePackagePricingChange = (index: number, field: string, value: number) => {
    const updated = [...packagePricing];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate total price when sessions or perSessionRate changes
    if (field === 'sessions' || field === 'perSessionRate') {
      const totalPrice = updated[index].sessions * updated[index].perSessionRate;
      updated[index] = { ...updated[index], totalPrice };
    }
    
    setPackagePricing(updated);
  };

  const paymentModelOptions = [
    { id: 'Per Session', name: 'Per Session', description: 'Students pay for each session attended' },
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

              {/* Package Pricing Table */}
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
                          <tr key={pkg.name} style={{ borderBottom: index < packagePricing.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                            <td style={{
                              padding: '12px',
                              fontWeight: 600
                            }}>
                              {pkg.name}
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

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '25px'
              }}>
                <button
                  onClick={handleSavePricing}
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
                  Save Pricing
                </button>
              </div>
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
                    <option value="Tiered (Based on volume)">Tiered (Based on volume)</option>
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
                    <option value="On-demand">On-demand</option>
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
    </div>
  );
}

