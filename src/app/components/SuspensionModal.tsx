"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Modal, Button } from 'react-bootstrap';

interface SuspensionModalProps {
  message: string;
}

interface Course {
  _id: string;
  title: string;
  price: number;
  duration: string;
  category: string;
}

const SuspensionModal: React.FC<SuspensionModalProps> = ({ message }) => {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isPaying, setIsPaying] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>(['UPI', 'Credit Card', 'Net Banking']);
  const [gstRate, setGstRate] = useState<string>('18%');
  const [pricingModel, setPricingModel] = useState<string>('Monthly Subscription');
  const [monthlySubscriptionPricing, setMonthlySubscriptionPricing] = useState<Array<{months: number, discount: number}>>([
    { months: 1, discount: 0 },
    { months: 3, discount: 5 },
    { months: 6, discount: 10 },
    { months: 9, discount: 12 },
    { months: 12, discount: 15 }
  ]);

  // Prevent all interactions when modal is open
  useEffect(() => {
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    // Prevent keyboard shortcuts (ESC, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow only Tab for accessibility, but prevent ESC and other shortcuts
      if (e.key === 'Escape' || (e.ctrlKey && e.key === 'w') || (e.ctrlKey && e.key === 'q')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
    };
  }, []);

  // Fetch courses when payment modal opens
  useEffect(() => {
    if (showPaymentModal) {
      fetchCourses();
      fetchPaymentMethodsAndTaxSettings();
    }
  }, [showPaymentModal]);

  // Add custom styles for payment modal to appear above suspension modal
  useEffect(() => {
    if (showPaymentModal) {
      // Create and inject custom styles
      const style = document.createElement('style');
      style.id = 'payment-modal-z-index-fix';
      style.textContent = `
        body > .modal-backdrop.show {
          z-index: 10001 !important;
        }
        body > .modal.show {
          z-index: 10002 !important;
        }
        body > .modal.show .modal-dialog {
          z-index: 10003 !important;
          position: relative;
        }
      `;
      document.head.appendChild(style);

      return () => {
        // Cleanup: remove the style when modal closes
        const styleElement = document.getElementById('payment-modal-z-index-fix');
        if (styleElement) {
          styleElement.remove();
        }
      };
    }
  }, [showPaymentModal]);

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await fetch('/Api/users/user');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.courseDetails && data.courseDetails.length > 0) {
          setCourses(data.courseDetails);
          // Auto-select first course
          if (data.courseDetails.length > 0) {
            setSelectedCourse(data.courseDetails[0]._id);
          }
        } else {
          toast.error('No courses available for payment');
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchPaymentMethodsAndTaxSettings = async () => {
    try {
      const [paymentMethodsResponse, taxSettingsResponse] = await Promise.all([
        fetch("/Api/student/paymentMethods"),
        fetch("/Api/student/taxSettings")
      ]);
      
      // Handle payment methods
      if (paymentMethodsResponse.ok) {
        const data = await paymentMethodsResponse.json();
        if (data.success && data.paymentMethods?.selectedMethods) {
          setAvailablePaymentMethods(data.paymentMethods.selectedMethods);
          const preferredMethod = data.paymentMethods.preferredMethod;
          if (preferredMethod && data.paymentMethods.selectedMethods.includes(preferredMethod)) {
            setPaymentMethod(preferredMethod);
          } else if (data.paymentMethods.selectedMethods.length > 0) {
            setPaymentMethod(data.paymentMethods.selectedMethods[0]);
          }
        }
      }

      // Handle tax settings
      if (taxSettingsResponse.ok) {
        const taxData = await taxSettingsResponse.json();
        if (taxData.success && taxData.taxSettings?.defaultGSTRate) {
          setGstRate(taxData.taxSettings.defaultGSTRate);
        }
      }

      // Fetch package pricing settings
      const packagePricingResponse = await fetch("/Api/student/packagePricing");
      if (packagePricingResponse.ok) {
        const packagePricingData = await packagePricingResponse.json();
        if (packagePricingData.success && packagePricingData.packagePricingSettings) {
          setPricingModel(packagePricingData.packagePricingSettings.pricingModel || 'Monthly Subscription');
          if (packagePricingData.packagePricingSettings.monthlySubscriptionPricing && 
              Array.isArray(packagePricingData.packagePricingSettings.monthlySubscriptionPricing) &&
              packagePricingData.packagePricingSettings.monthlySubscriptionPricing.length > 0) {
            setMonthlySubscriptionPricing(packagePricingData.packagePricingSettings.monthlySubscriptionPricing);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods or tax settings:', error);
    }
  };

  // Calculate GST amount
  const parseGSTRate = (rate: string): number => {
    if (rate === 'No GST') return 0;
    const numericRate = parseFloat(rate.replace('%', ''));
    return isNaN(numericRate) ? 0 : numericRate;
  };

  const selectedCourseData = courses.find(c => c._id === selectedCourse);
  const monthlyFee = selectedCourseData ? (typeof selectedCourseData.price === "number" ? selectedCourseData.price : 0) : 0;
  const gstPercentage = parseGSTRate(gstRate);
  
  // Get discount for selected months
  const selectedPricing = monthlySubscriptionPricing.find(p => p.months === selectedMonths);
  const discountPercentage = selectedPricing?.discount || 0;
  
  // Calculate base amount (monthly fee * months)
  const baseAmountBeforeDiscount = monthlyFee * selectedMonths;
  // Apply discount
  const discountAmount = (baseAmountBeforeDiscount * discountPercentage) / 100;
  const baseAmount = baseAmountBeforeDiscount - discountAmount;
  
  // Calculate GST on discounted amount
  const gstAmount = (baseAmount * gstPercentage) / 100;
  const calculatedAmount = baseAmount + gstAmount;

  const handleOpenPaymentModal = () => {
    setSelectedMonths(1);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }
    
    setIsPaying(true);
    try {
      const response = await fetch("/Api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          months: selectedMonths,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Payment failed");
      }

      toast.success("Payment successful! Your account will be reactivated.");
      setShowPaymentModal(false);
      
      // Refresh the page to check suspension status again
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Unable to process payment");
    } finally {
      setIsPaying(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/Api/users/logout');
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('Error during logout');
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Backdrop - blocks all interactions */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          pointerEvents: showPaymentModal ? 'none' : 'auto'
        }}
        onClick={(e) => {
          // Prevent closing on backdrop click
          e.preventDefault();
          e.stopPropagation();
        }}
        onContextMenu={(e) => {
          // Prevent right-click menu
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Modal */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 10000,
            pointerEvents: showPaymentModal ? 'none' : 'auto',
            opacity: showPaymentModal ? 0.3 : 1
          }}
          onClick={(e) => {
            // Prevent closing on modal click
            e.stopPropagation();
          }}
        >
          {/* Icon */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '40px'
            }}>
              ⚠️
            </div>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            Account Suspended
          </h2>

          {/* Message */}
          <p style={{
            fontSize: '16px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            {message}
          </p>

          {/* Additional Info */}
          <div style={{
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#C53030',
              margin: 0,
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Please contact your academy administrator or make a payment to renew your subscription and restore access to your account.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* <button
              onClick={handleOpenPaymentModal}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              Pay Now
            </button> */}
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(98, 0, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(98, 0, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(98, 0, 234, 0.3)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal 
        show={showPaymentModal} 
        onHide={() => !isPaying && setShowPaymentModal(false)} 
        centered
        backdrop="static"
        keyboard={false}
        className="payment-modal-override"
      >
        <Modal.Header closeButton={!isPaying}>
          <Modal.Title>Pay Course Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingCourses ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>No courses available for payment.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Course</p>
                <select
                  className="form-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={isPaying}
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} - ₹{course.price}/month
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex flex-column gap-2">
                <label className="text-sm text-gray-600">Months</label>
                <select
                  className="form-select"
                  value={selectedMonths}
                  onChange={(e) => setSelectedMonths(parseInt(e.target.value, 10) || 1)}
                  disabled={isPaying}
                >
                  {pricingModel === 'Monthly Subscription' 
                    ? monthlySubscriptionPricing.map((pricing) => (
                        <option key={pricing.months} value={pricing.months}>
                          {pricing.months} {pricing.months === 1 ? "Month" : "Months"}
                          {pricing.discount > 0 && ` (${pricing.discount}% off)`}
                        </option>
                      ))
                    : [1, 2, 3].map((month) => (
                        <option key={month} value={month}>
                          {month} {month === 1 ? "Month" : "Months"}
                        </option>
                      ))
                  }
                </select>
              </div>
              <div className="d-flex flex-column gap-2">
                <label className="text-sm text-gray-600">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isPaying}
                >
                  {availablePaymentMethods.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-light p-3 rounded">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <h3 className="m-0">₹ {calculatedAmount.toLocaleString("en-IN")}</h3>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">
                    Base Amount: ₹ {baseAmountBeforeDiscount.toLocaleString("en-IN")} ({monthlyFee.toLocaleString("en-IN")} × {selectedMonths} month{selectedMonths > 1 ? 's' : ''})
                  </p>
                  {discountPercentage > 0 && (
                    <p className="text-xs text-green-600 mb-1">
                      Discount ({discountPercentage}%): -₹ {discountAmount.toLocaleString("en-IN")}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-1">
                    Amount After Discount: ₹ {baseAmount.toLocaleString("en-IN")}
                  </p>
                  {gstPercentage > 0 && (
                    <p className="text-xs text-gray-500 mb-1">
                      GST ({gstRate}): ₹ {gstAmount.toLocaleString("en-IN")}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    Total: ₹ {calculatedAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end gap-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowPaymentModal(false)} 
            disabled={isPaying}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={isPaying || calculatedAmount <= 0 || !selectedCourse || isLoadingCourses}
            className="bg-purple-700 border-0"
          >
            {isPaying ? "Processing..." : "Pay Now"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SuspensionModal;

