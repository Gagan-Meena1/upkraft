import React, { useEffect, useMemo, useState } from "react";
import { IndianRupee, ArrowRight, BarChart3, Eye } from "lucide-react";
import Link from "next/link";
import "./MyCourse.css";
import { Button, Modal } from "react-bootstrap";
import Student01 from "@/assets/student-01.png";
import Image from "next/image";
import "./MyCourse.css";
import { toast } from "react-hot-toast";

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  price: number;
  curriculum: {
    sessionNo: number;
    topic: string;
    tangibleOutcome: string;
  }[];
  tutorName?: string;
  instructor?: string; // Add this if not present
}

interface CourseCardProps {
  course: Course;
  userData: any;
  viewPerformanceRoutes: Record<string, string>;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  userData,
  viewPerformanceRoutes,
}) => {
  const [tutorData, setTutorData] = useState(course.tutorName || "");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isPaying, setIsPaying] = useState(false);
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

  const shouldShowPayNow = useMemo(
    () => Boolean(userData?.category === "Student" && userData?.academyId),
    [userData]
  );

  const monthlyFee = typeof course.price === "number" ? course.price : 0;
  
  // Calculate GST amount
  const parseGSTRate = (rate: string): number => {
    if (rate === 'No GST') return 0;
    const numericRate = parseFloat(rate.replace('%', ''));
    return isNaN(numericRate) ? 0 : numericRate;
  };

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

  useEffect(() => {
    async function fetchTutorName() {
      const instructorId = course.instructor || (course as any).instructorId;
      if (!course.tutorName && instructorId) {
        try {
          const res = await fetch(
            `/Api/tutorInfoForStudent?tutorId=${instructorId}`
          );
          const data = await res.json();
          setTutorData(data?.tutor);
        } catch {
          setTutorData("N/A");
        }
      } else if (!course.tutorName) {
        setTutorData("N/A");
      }
    }
    fetchTutorName();
  }, [course.tutorName, course.instructor, (course as any).instructorId]);

  // Fetch payment methods and tax settings for student's academy
  useEffect(() => {
    if (shouldShowPayNow && userData?.academyId) {
      const fetchPaymentMethods = async () => {
        try {
          const response = await fetch("/Api/student/paymentMethods");
          if (response.ok) {
            const data = await response.json();
            console.log("Initial payment methods fetch:", data);
            if (data.success && data.paymentMethods?.selectedMethods) {
              setAvailablePaymentMethods(data.paymentMethods.selectedMethods);
              // Set default payment method to preferredMethod if available, otherwise first method
              const preferredMethod = data.paymentMethods.preferredMethod;
              if (preferredMethod && 
                  data.paymentMethods.selectedMethods.includes(preferredMethod)) {
                setPaymentMethod(preferredMethod);
                console.log("Initial payment method set to preferred:", preferredMethod);
              } else if (data.paymentMethods.selectedMethods.length > 0) {
                setPaymentMethod(data.paymentMethods.selectedMethods[0]);
                console.log("Initial payment method set to first available:", data.paymentMethods.selectedMethods[0]);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching payment methods:", error);
        }
      };

      const fetchTaxSettings = async () => {
        try {
          const response = await fetch("/Api/student/taxSettings");
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.taxSettings?.defaultGSTRate) {
              setGstRate(data.taxSettings.defaultGSTRate);
            }
          }
        } catch (error) {
          console.error("Error fetching tax settings:", error);
        }
      };

      const fetchPackagePricing = async () => {
        try {
          const response = await fetch("/Api/student/packagePricing");
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.packagePricingSettings) {
              setPricingModel(data.packagePricingSettings.pricingModel || 'Monthly Subscription');
              if (data.packagePricingSettings.monthlySubscriptionPricing && 
                  Array.isArray(data.packagePricingSettings.monthlySubscriptionPricing) &&
                  data.packagePricingSettings.monthlySubscriptionPricing.length > 0) {
                setMonthlySubscriptionPricing(data.packagePricingSettings.monthlySubscriptionPricing);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching package pricing:", error);
        }
      };

      fetchPaymentMethods();
      fetchTaxSettings();
      fetchPackagePricing();
    }
  }, [shouldShowPayNow, userData?.academyId]);

  const handleOpenPaymentModal = async () => {
    setSelectedMonths(1);
    
    // Fetch payment methods and tax settings
    try {
      const [paymentMethodsResponse, taxSettingsResponse] = await Promise.all([
        fetch("/Api/student/paymentMethods"),
        fetch("/Api/student/taxSettings")
      ]);
      
      // Handle payment methods
      if (paymentMethodsResponse.ok) {
        const data = await paymentMethodsResponse.json();
        console.log("Student payment methods API response:", data);
        
        if (data.success && data.paymentMethods?.selectedMethods) {
          setAvailablePaymentMethods(data.paymentMethods.selectedMethods);
          
          // Set to preferred method if available, otherwise first method
          const preferredMethod = data.paymentMethods.preferredMethod;
          console.log("Preferred method from API:", preferredMethod);
          console.log("Available methods:", data.paymentMethods.selectedMethods);
          
          if (preferredMethod && 
              data.paymentMethods.selectedMethods.includes(preferredMethod)) {
            setPaymentMethod(preferredMethod);
            console.log("Setting payment method to preferred:", preferredMethod);
          } else if (data.paymentMethods.selectedMethods.length > 0) {
            const firstMethod = data.paymentMethods.selectedMethods[0];
            setPaymentMethod(firstMethod);
            console.log("Preferred method not available, using first method:", firstMethod);
          } else {
            setPaymentMethod("UPI");
            console.log("No methods available, using default: UPI");
          }
        } else {
          console.warn("Payment methods data structure unexpected:", data);
          // Fallback to first available method or UPI
          if (availablePaymentMethods.length > 0) {
            setPaymentMethod(availablePaymentMethods[0]);
          } else {
            setPaymentMethod("UPI");
          }
        }
      } else {
        console.error("Failed to fetch payment methods:", paymentMethodsResponse.status, paymentMethodsResponse.statusText);
        // Fallback to first available method or UPI
        if (availablePaymentMethods.length > 0) {
          setPaymentMethod(availablePaymentMethods[0]);
        } else {
          setPaymentMethod("UPI");
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
      console.error("Error fetching payment methods or tax settings:", error);
      // Fallback to first available method or UPI
      if (availablePaymentMethods.length > 0) {
        setPaymentMethod(availablePaymentMethods[0]);
      } else {
        setPaymentMethod("UPI");
      }
    }
    
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!course?._id) return;
    setIsPaying(true);
    try {
      const response = await fetch("/Api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course._id,
          months: selectedMonths,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Payment failed");
      }

      toast.success("Payment successful!");
      setShowPaymentModal(false);
    } catch (error: any) {
      toast.error(error?.message || "Unable to process payment");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="assignments-list-com">
      <div className="assignments-list-box !mb-3 !pb-3">
        <div className="w-100">
          <h3 className="!text-[18px] !mb-3">{course.title}</h3>
        </div>
        <div className="assignments-list d-flex align-items-center gap-2 flex-wrap w-100 justify-content-between">
          <div className="left-assignment  d-flex align-items-center gap-xl-4 gap-2 flex-wrap">
            <ul className="d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0 full-width-mobile">
              {/* <li className="d-flex align-items-center gap-2">
                <span className="student-text">Started From :</span>
                <span className="student-txt">
                  <strong>25 July</strong>
                </span>
              </li> */}
              <li className="d-flex align-items-center gap-2">
                <span className="student-text">Duration :</span>
                <span className="student-txt">
                  <strong>{course.duration}</strong>
                </span>
              </li>
              {/* <li className="d-flex align-items-center gap-2"> */}
                {/* <span className="student-text">Fees :</span> */}
                {/* <span className="student-txt">
                  <strong>Rs {course.price}</strong>
                </span> */}
              {/* </li> */}
              <li className="d-flex align-items-center gap-2">
                <span className="student-text">Sessions :</span>
                <span className="student-txt ">
                  <strong>{course.curriculum.length} Sessions</strong>
                </span>
              </li>
            </ul>
            <div className="student-img-name d-flex align-items-center justify-content-between full-width-mobile gap-2">
              <p>Tutor : </p>
              <div className="d-flex align-items-center  gap-1">
                  <Image
                  width={24}
                  height={24}
                  src={tutorData?.profileImage || Student01}
                  alt=""
                />
                <span className="name">{tutorData?.username || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="right-assignment my-course-student-right mt-xxl-0 mt-3">
            <div className="student-assignment my-course-student d-flex align-items-center flex-wrap gap-xl-4 gap-2">
              <ul className="d-flex !align-items-center w-full-width gap-2 list-unstyled flex-wrap m-0 p-0">
                <li>
                  <Link
                    href={`/student/courses/courseDetails?courseId=${course._id}`}
                  >
                    <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 !px-4 !py-3 !rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Eye size={18} />
                      Details
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href={`/student/courseQuality?courseId=${course._id}`}>
                    <button className="w-full bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 !px-4 !py-3 !rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <BarChart3 size={18} />
                      Quality
                    </button>
                  </Link>
                </li>
                {/* {shouldShowPayNow && (
                  <li>
                    <button
                      className="w-full bg-white border border-green-200 text-green-700 hover:bg-green-50 !px-4 !py-3 !rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      onClick={handleOpenPaymentModal}
                    >
                      <IndianRupee size={18} />
                      Pay Now
                    </button>
                  </li>
                )} */}
                <li>
                  <Link
                    href={`${
                      viewPerformanceRoutes[
                        course.category as keyof typeof viewPerformanceRoutes
                      ] || "/student/performance/viewPerformance"
                    }?courseId=${course._id}&studentId=${userData._id}`}
                    className="group/btn"
                  >
                    <button className="w-full flex items-center justify-between !px-4 !py-3 !bg-purple-700 !hover:bg-purple-600 text-white !rounded-lg transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                      <span className="font-medium">View Performance</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay Course Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column gap-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Course</p>
              <h4 className="m-0">{course.title}</h4>
            </div>
            <div className="d-flex flex-column gap-2">
              <label className="text-sm text-gray-600">Months</label>
              <select
                className="form-select"
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(parseInt(e.target.value, 10) || 1)}
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
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)} disabled={isPaying}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={isPaying || calculatedAmount <= 0}
            className="bg-purple-700 border-0"
          >
            {isPaying ? "Processing..." : "Pay Now"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseCard;
