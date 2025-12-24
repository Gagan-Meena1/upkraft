"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoHeader from "@/assets/LogoHeader copy.png";
import BannerBottomBox from "../../components/learners/BannerBottomBox";
import Faq from "../../components/learners/Faq";
import "../../../styles/style.css";
import logoo from "@/assets/logoo.jpeg";
import ExclusiveBenefitsdemo from "@/app/components/learners/ExclusiveBenefitsdemo";
import StudentForm from "@/app/components/learners/StudentForm";
import rsl1 from "@/assets/rsl1.png";
import trinitylogo from "@/assets/trinitylogo.png";
import linee1 from "@/assets/linee1.png";
import linee2 from "@/assets/linee2.png";
import linee3 from "@/assets/linee3.png";
import linee4 from "@/assets/linee4.png";
import linee5 from "@/assets/linee5.png";
import demoimg from "@/assets/demoimg.jpeg";

export default function AdminDemoPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    company: "",
    countryCode: "+91",
    phone: "",
    requirements: "",
    demoDate: "",
    demoTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Minimum date allowed (24 hours from now)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    return tomorrow.toISOString().split("T")[0];
  };

  // Generate 30-minute time slots between 10:00 and 20:00
  const generateTimeSlots = () => {
    const slots: { value: string; label: string }[] = [];
    for (let hour = 10; hour <= 20; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === 20 && min > 0) break;
        const value = `${String(hour).padStart(2, "0")}:${String(min).padStart(
          2,
          "0"
        )}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const label = `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
        slots.push({ value, label });
      }
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        userType: "AdminDemo",
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.workEmail,
        company: form.company,
        countryCode: form.countryCode,
        phone: form.phone,
        requirements: form.requirements,
        demoDate: form.demoDate || null,
        demoTime: form.demoTime || null,
      };
      const res = await fetch("/Api/demo-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Demo request submitted. We will contact you soon.");
        setForm({
          firstName: "",
          lastName: "",
          workEmail: "",
          company: "",
          countryCode: "+91",
          phone: "",
          requirements: "",
          demoDate: "",
          demoTime: "",
        });
      } else {
        setError(data.message || "Failed to submit demo request");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={LogoHeader.src}
              alt="UpKraft Logo"
              width={128}
              height={128}
              className=""
            />
            {/* <span className="font-semibold text-lg text-gray-800">UpKraft</span> */}
          </Link>
          {/* <div className="flex items-center gap-6">
            <nav className="hidden sm:flex gap-6 text-sm font-medium text-gray-600">
              <a className="hover:text-blue-600 transition-colors" href="#">
                Products
              </a>
              <a className="hover:text-blue-600 transition-colors" href="#">
                Resources
              </a>
            </nav>
            <button className="hidden md:inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
              Book a demo
            </button>
          </div> */}
        </div>
      </header>

      <main className="w-full flex-grow flex items-center relative">
        {/* background image layer with reduced opacity */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-center bg-no-repeat bg-cover pointer-events-none z-0 bg-[#6106CB]"
          style={{ backgroundImage: `url(})` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left content */}
            <div className="text-white">
              <h3 className="!text-sm uppercase font-semibold mb-4 text- tracking-wider">
                Schedule a Demo
              </h3>
              <h1 className="!text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                Learn Music the Smart Way with UpKraft
              </h1>
              <p className="text-white !mb-10 text-lg leading-relaxed">
                <ul>
                <li className="pb-3 pr-1">• Personalised learning </li>
                <li className="pb-3">• Expert teachers </li>
                <li className="pb-3">• AI Music Companion to help you practice between classes and learn <span className="pl-3">faster</span></li>
                </ul>
              </p>
              <h2 className="!text-2xl font-bold !mb-6 text-white">
                Why Choose UpKraft?
              </h2>
              <ul className="gap-3 !pl-0 md:mt-4 flex flex-col text-white text-base">
                <li className="flex items-start gap-3">
                  <Image
                    src={linee1.src}
                    alt="Line"
                    width={20}
                    height={20}
                    color="black">
                  </Image>
                  
                  <span>
                    POCSO Certified, Verified Tutors</span>
                </li>
                <li className="flex items-start gap-3">
                  <Image
                    src={linee2.src}
                    alt="Line"
                    width={20}
                    height={20}
                    color="black"
                    className="pt-2">
                  </Image>
                  <span className="flex items-center gap-3">
                    <span>Clear Pathway for Certifications</span>
                    <span className="inline-flex items-center gap-3 ml-3  px-2 py-1 rounded-full">
                      <Image
                        src={rsl1.src}
                        alt="Rsl Logo"
                        width={50}
                        height={50}
                        className="bg-amber-50 rounded p-2"
                      />
                      <Image
                        src={trinitylogo.src}
                        alt="Trinity Logo"
                        width={50}
                        height={50}
                        className="bg-amber-50 rounded px-1"
                      />
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3 !pb-3">
                  <Image
                    src={linee3.src}
                    alt="Line"
                    width={20}
                    height={20}
                    color="black">
                  </Image>
                  <span>
Personalised Learning for Every Age & Goal
                  </span>
                </li>
                <li className="flex items-start gap-3 pb-3">
                 <Image
                    src={linee4.src}
                    alt="Line"
                    width={20}
                    height={20}
                    color="black">
                  </Image>
                  <span>
Al-Powered Practice for Faster Mastery
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Image
                    src={linee5.src}
                    alt="Line"
                    width={20}
                    height={20}
                    color="black">
                  </Image>
                  <span>Transparent Progress Dashboards</span>
                </li>
                {/* <li className="flex items-start gap-3">
                  <svg
                    className="flex-none mt-1 h-5 w-5 text-green-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Piano, Guitar, Vocals, Keyboard & more</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="flex-none mt-1 h-5 w-5 text-green-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Flexible scheduling with 24/7 access</span>
                </li> */}
              </ul>
            </div>

            {/* Right form */}
            {/* <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Get a demo
              </h2>
              <p className="text-sm text-gray-600 mb-8">
                We're here to answer all your questions!
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <input
                    aria-label="First name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First Name *"
                    className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    aria-label="Last name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Last Name *"
                    className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <input
                  aria-label="Work email"
                  name="workEmail"
                  type="email"
                  value={form.workEmail}
                  onChange={handleChange}
                  required
                  placeholder="Work Email *"
                  className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  aria-label="Company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                  placeholder="Company *"
                  className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-0 items-center">
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                    className="border-gray-300 rounded-l-md px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 border-r-0"
                  >
                    <option>+91</option>
                    <option>+1</option>
                    <option>+44</option>
                  </select>
                  <input
                    aria-label="Phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="Phone *"
                    className="flex-1 border-gray-300 rounded-r-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">
                      Preferred Demo Date
                    </label>
                    <input
                      type="date"
                      name="demoDate"
                      value={form.demoDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="!w-full !border !border-gray-300 !rounded-md px-3 py-2.5 focus:!outline-none focus:!ring-2 focus:!ring-blue-400"
                      placeholder="dd-mm-yyyy"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">
                      Preferred Demo Time
                    </label>
                    <select
                      name="demoTime"
                      value={form.demoTime}
                      onChange={handleChange}
                      className="!w-full !border !border-gray-300 !rounded-md px-3 py-2.5 focus:!outline-none focus:!ring-2 focus:!ring-blue-400"
                    >
                      <option value="">Select time</option>
                      {generateTimeSlots().map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  aria-label="Your Requirements"
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  placeholder="Your Requirements"
                  rows={3}
                  className="w-full border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {message && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 !rounded-md">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 !rounded-md">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 font-semibold !rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-all duration-300 "
                >
                  {loading ? "Requesting..." : "Request a Demo"}
                </button>
              </form>
            </div> */}
            <div className="flex justify-center bg-white rounded-xl shadow-2xl">
              <StudentForm />
            </div>
          </div>
        </div>
      </main>
<section className="my-12 px-8">
        <BannerBottomBox />
      </section>
      <section className="">
        <ExclusiveBenefitsdemo />
      </section>

      

      <section className="px-8 faq-sec">
        <Faq />
      </section>
    </div>
  );
}
