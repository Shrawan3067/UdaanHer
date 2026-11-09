import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Phone,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  Users,
  Activity,
  Ambulance,
  ArrowRight,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { language } = useLanguage();

  // Hero Slider State
  const heroSlides = [
    {
      titleEn: "You can make a difference",
      titleHi: "आप एक बड़ा बदलाव ला सकते हैं",
      descEn:
        "Your financial gift empowers rural women and community welfare initiatives across Madhya Pradesh and India.",
      descHi:
        "आपका आर्थिक सहयोग मध्य प्रदेश और पूरे भारत में जरूरतमंद परिवारों और महिलाओं तक त्वरित मानवीय सहायता पहुंचाता है।",
      ctaEn: "Donate Now",
      ctaHi: "अभी दान करें",
      ctaHref: "/donate",
      image:
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1920&q=80",
    },
    {
      titleEn: "Emergency Relief & 24/7 First Aid",
      titleHi: "आपातकालीन राहत एवं 24/7 प्राथमिक चिकित्सा",
      descEn:
        "Mobilizing 75,000+ grassroots volunteers and ambulance linkages across Indian operational districts.",
      descHi:
        "मानवीय आपदाओं व स्वास्थ्य आपात स्थितियों में 75,000+ स्वयंसेवकों व एम्बुलेंस नेटवर्क की त्वरित तैनाती।",
      ctaEn: "Explore Programs",
      ctaHi: "कार्यक्रम देखें",
      ctaHref: "/schemes",
      image:
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1920&q=80",
    },
    {
      titleEn: "Rural Women Self-Help Enterprises",
      titleHi: "ग्रामीण महिला स्व-सहायता उद्यम व आजीविका",
      descEn:
        "Unlocking catalytic seed funding, digital literacy, and zero-fee welfare entitlement access for 500+ SHGs.",
      descHi:
        "500 से अधिक स्व-सहायता समूहों के लिए बीज पूंजी, डिजिटल साक्षरता और सरकारी कल्याण योजनाओं की सीधी पहुंच।",
      ctaEn: "Find My Scheme",
      ctaHi: "पात्रता खोजें",
      ctaHref: "/eligibility",
      image:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1920&q=80",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prevHeroSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const nextHeroSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // Donation Widget state matching Page 2 of PDF
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] =
    useState<string>("General Donation");
  const [selectedPaymentType, setSelectedPaymentType] =
    useState<string>("UPI / QR");

  // Tab state for "How you can help today"
  const [activeTab, setActiveTab] = useState<
    "individual" | "planned" | "corporate"
  >("individual");

  const quickAmounts = [100, 500, 1000, 5000];

  const handleAmountClick = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setCustomAmount(val);
    if (val) {
      setSelectedAmount(parseInt(val, 10));
    }
  };

  return (
    <div className="flex flex-col w-full bg-white text-[#1A1A1A]">
      {/* ========================================================= */}
      {/* SECTION 1: HERO SLIDER (PAGE 1 OF PDF)                   */}
      {/* ========================================================= */}
      <section className="relative w-full h-[520px] lg:h-[620px] overflow-hidden bg-gray-900 group font-poppins">
        {/* Background Image with Dark Contrast Overlay */}
        <img
          key={heroSlides[currentSlide].image}
          src={heroSlides[currentSlide].image}
          alt={heroSlides[currentSlide].titleEn}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70 transition-opacity duration-700 animate-fadeIn"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-6 lg:px-12 flex flex-col justify-center font-poppins">
          <div
            className="max-w-2xl space-y-5 animate-fadeIn font-poppins"
            key={currentSlide}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-xs text-white text-xs uppercase font-extrabold tracking-wider font-poppins">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>
                {language === "HI"
                  ? "मानवीय सहायता मिशन"
                  : "Humanitarian Welfare Mission"}
              </span>
            </div>

            <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl text-white font-extrabold tracking-tight leading-tight">
              {language === "HI"
                ? heroSlides[currentSlide].titleHi
                : heroSlides[currentSlide].titleEn}
            </h1>

            <p className="font-poppins text-gray-200 text-base sm:text-lg lg:text-xl font-normal leading-relaxed">
              {language === "HI"
                ? heroSlides[currentSlide].descHi
                : heroSlides[currentSlide].descEn}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 font-poppins">
              <Link
                to={heroSlides[currentSlide].ctaHref}
                className="font-poppins inline-flex items-center justify-center bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold text-base px-8 py-3.5 rounded-lg shadow-lg hover-lift transition-all cursor-pointer"
              >
                {language === "HI"
                  ? heroSlides[currentSlide].ctaHi
                  : heroSlides[currentSlide].ctaEn}
              </Link>
              <Link
                to="/schemes"
                className="font-poppins inline-flex items-center justify-center bg-white/20 hover:bg-white/30 text-white font-bold text-base px-6 py-3.5 rounded-lg backdrop-blur-xs transition-all border border-white/30 hover:border-white/50"
              >
                {language === "HI" ? "सभी सेवाएं देखें" : "All Services"}
              </Link>
            </div>
          </div>
        </div>

        {/* Slider Navigation Chevrons */}
        <button
          type="button"
          onClick={prevHeroSlide}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-[#EA3C36] text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer z-20 shadow-md border border-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={nextHeroSlide}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-[#EA3C36] text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer z-20 shadow-md border border-white/20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? "w-8 bg-[#EA3C36]"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: PROGRAMS & SERVICES (PAGE 1 OF PDF)           */}
      {/* ========================================================= */}
      <section className="w-full py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Eyebrow & Title */}
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs uppercase tracking-widest text-[#EA3C36] font-bold">
              {language === "HI"
                ? "हम किस क्षेत्र में सक्रिय हैं"
                : "WHAT ARE WE ACTIVE ON"}
            </span>
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                {language === "HI"
                  ? "कार्यक्रम एवं सेवाएं"
                  : "Programs & Services"}
              </h2>
            </div>
            {/* Slider arrows */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-[#EA3C36] hover:border-[#EA3C36] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-[#EA3C36] hover:border-[#EA3C36] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Services Cards from PDF */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: First Aid Training (Cyan/Teal circular badge) */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs hover-lift transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-[#00A3C4] flex items-center justify-center text-white mb-6 shadow-xs">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  First Aid Training
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your donation will enable us to train people on first aid in
                  rural and urban setting, equipping them to take timely
                  responses and adequate measures to safely carry out first aid
                  response.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  to="/schemes"
                  className="text-xs font-bold text-[#00A3C4] hover:underline flex items-center gap-1"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Junior and Youth Engagement (Deep Blue circular badge) */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs hover-lift transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white mb-6 shadow-xs">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Junior and Youth Engagement
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Grassroots women volunteers and youth animators are the
                  backbone of UdaanHer: Giving women wings to fly. They work directly in villages and Gram
                  Panchayats across India, ensuring no eligible woman is left
                  behind without entitlements.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  to="/schemes"
                  className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Emergency Response (Red circular badge) */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs hover-lift transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-[#EA3C36] flex items-center justify-center text-white mb-6 shadow-xs">
                  <Ambulance className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Emergency Response &amp; Healthcare
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Safe transfer to medical facilities and emergency maternal
                  care are vital for saving lives. UdaanHer coordinates with
                  108/102 emergency ambulance networks and district hospitals
                  across operational Indian districts.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  to="/schemes"
                  className="text-xs font-bold text-[#EA3C36] hover:underline flex items-center gap-1"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Centered "See More" Button */}
          <div className="text-center mt-12">
            <Link
              to="/schemes"
              className="inline-flex items-center justify-center bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold text-sm px-8 py-2.5 rounded-lg shadow-sm hover-lift transition-all"
            >
              See More
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: WE ARE ALWAYS WHERE OTHER NEED HELP (PAGE 1-2) */}
      {/* ========================================================= */}
      <section className="w-full bg-[#EA3C36] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Red Content (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              We are Always Where Other Need Help
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
              The mission of UdaanHer is to give women wings to fly: empower Indian women, relieve human
              suffering, and foster grassroots autonomy through women Self-Help
              Groups (SHGs), direct government welfare scheme navigation, and
              verified community support across India.
            </p>
          </div>

          {/* Right White Overlapping Card with Counters (5 cols) */}
          <div className="lg:col-span-5 bg-white text-[#1A1A1A] p-8 sm:p-12 flex flex-col justify-center relative border-r-8 border-[#EA3C36] shadow-xl">
            {/* Subtle decorative dot pattern */}
            <div className="absolute top-4 right-4 grid grid-cols-6 gap-1 opacity-20 pointer-events-none">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              ))}
            </div>

            <div className="space-y-6">
              {/* Stat 1 */}
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
                  1,105,528<span className="text-[#EA3C36]">+</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Women &amp; rural families assisted across Indian districts
                </p>
              </div>

              {/* Stat 2 */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
                  75,000<span className="text-[#EA3C36]">+</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Grassroots SHG volunteers ready to take action
                </p>
              </div>

              {/* Stat 3 */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
                  500<span className="text-[#EA3C36]">+</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Women-led Self-Help Groups equipped with micro-capital
                </p>
              </div>

              {/* Stat 4 */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
                  18,500<span className="text-[#EA3C36]">+</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Mothers supported with nutritional baskets &amp; DBT benefits
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: WHERE YOUR MONEY GOES (PAGE 2 OF PDF)          */}
      {/* ========================================================= */}
      <section className="w-full py-16 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
            How your help matters
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A]">
            Where Your Money Goes
          </h2>

          {/* Cute Donation Jar Graphic */}
          <div className="flex justify-center py-4">
            <div className="relative w-20 h-24 bg-red-50 border-2 border-[#EA3C36] rounded-b-2xl rounded-t-lg flex flex-col items-center justify-center shadow-xs">
              <div className="w-12 h-2 bg-[#EA3C36] rounded-t-sm -mt-1 mb-2" />
              <Heart className="w-6 h-6 text-[#EA3C36] fill-[#EA3C36] animate-pulse" />
              <span className="text-[10px] font-bold text-[#EA3C36] mt-1">
                92%
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg text-gray-700 font-semibold max-w-xl mx-auto leading-relaxed">
            <span className="text-[#EA3C36] font-bold">
              92% of the donation
            </span>{" "}
            will go to core services, program and rest 8% will go the operation,
            management, logistics.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: YOUR GIFT COULD CHANGE SOMEONE'S LIFE & DONATION WIDGET */}
      {/* (PAGE 2 OF PDF)                                           */}
      {/* ========================================================= */}
      <section className="w-full py-16 bg-gray-900 relative overflow-hidden">
        {/* Background Dark Overlay */}
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=80"
          alt="Children receiving support"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Your Gift Could Change Someone's Life */}
            <div className="lg:col-span-6 space-y-6 text-white">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white font-bold tracking-tight leading-tight">
                Your Gift Could Change Someone's Life
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                The mission of UdaanHer is to give women wings to fly: empower women, relieve distress,
                and provide 100% transparent Section 80G tax-exempt support for
                vulnerable rural families across India.
              </p>

              {/* Ways to Help Divider & Methods */}
              <div className="pt-4 border-t border-white/20 space-y-4">
                <span className="text-xs uppercase tracking-widest text-[#EA3C36] font-bold">
                  WAYS TO HELP
                </span>

                <div className="space-y-4 text-sm text-gray-200">
                  {/* Method 1 */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white shrink-0">
                      <CreditCard className="w-4 h-4 text-[#EA3C36]" />
                    </div>
                    <span>
                      Instant UPI / QR Code transfers (GPay, PhonePe, Paytm)
                    </span>
                  </div>

                  {/* Method 2 */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white shrink-0">
                      <Building className="w-4 h-4 text-[#EA3C36]" />
                    </div>
                    <span>Direct Bank to Bank NEFT / RTGS Transfer</span>
                  </div>

                  {/* Method 3 */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white shrink-0">
                      <Smartphone className="w-4 h-4 text-[#EA3C36]" />
                    </div>
                    <span>
                      Domestic Debit / Credit Card with Instant 80G Receipt
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Donation Card from PDF */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-[#1A1A1A] space-y-5">
                <h3 className="text-xl font-bold text-[#1A1A1A]">
                  Donation Amount
                </h3>

                {/* Currency & Tax Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Currency &amp; Tax Status
                  </label>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#EA3C36] bg-red-50/60 text-xs">
                    <span className="font-bold text-[#EA3C36] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#EA3C36]" />₹
                      Indian Rupee (INR)
                    </span>
                    <span className="font-semibold text-gray-600 text-[11px]">
                      Section 80G Tax-Exempt
                    </span>
                  </div>
                </div>

                {/* Select Campaign */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Select Campaign
                  </label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#EA3C36] focus:outline-hidden"
                  >
                    <option value="General Donation">General Donation</option>
                    <option value="Disaster Relief Fund">
                      Disaster Relief Fund
                    </option>
                    <option value="First Aid & Health Kiosks">
                      First Aid & Health Kiosks
                    </option>
                    <option value="Women & Youth Livelihood">
                      Women & Youth Livelihood
                    </option>
                  </select>
                </div>

                {/* Select or enter an amount */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600">
                    Select or enter an amount
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amt) => {
                      const isSelected =
                        selectedAmount === amt && !customAmount;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAmountClick(amt)}
                          className={`py-2 rounded-lg text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#EA3C36] bg-red-50 text-[#EA3C36]"
                              : "border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          ₹{amt}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full mt-2 px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:border-[#EA3C36] focus:outline-hidden placeholder:text-gray-400"
                  />
                </div>

                {/* Payment Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600">
                    Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["UPI / QR", "Card (Debit/Credit)", "Net Banking"].map(
                      (method) => {
                        const isSelected = selectedPaymentType === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setSelectedPaymentType(method)}
                            className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#EA3C36] bg-red-50 text-[#EA3C36]"
                                : "border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {method}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Continue CTA Button */}
                <Link
                  to={`/donate?amount=${selectedAmount}`}
                  className="w-full inline-flex items-center justify-center bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold py-3.5 rounded-lg text-sm tracking-wide shadow-md hover-lift transition-all"
                >
                  CONTINUE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: HOW YOU CAN HELP TODAY (PAGE 2 OF PDF)         */}
      {/* ========================================================= */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
              Ways to Support UdaanHer India
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A]">
              How you can help today
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-8 justify-center overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("individual")}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === "individual"
                    ? "border-[#EA3C36] text-[#EA3C36]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Individual Giving
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("planned")}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === "planned"
                    ? "border-[#EA3C36] text-[#EA3C36]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Planned Giving and Major Gifts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("corporate")}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === "corporate"
                    ? "border-[#EA3C36] text-[#EA3C36]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Corporate &amp; Foundation Partnerships
              </button>
            </div>
          </div>

          {/* Action Buttons Box */}
          <div className="p-8 rounded-xl border border-gray-200 bg-white flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/donate"
              className="bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold px-8 py-3 rounded-lg text-sm shadow-xs transition-all hover-lift"
            >
              Donate Online
            </Link>
            <Link
              to="/donate?method=bank"
              className="bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold px-8 py-3 rounded-lg text-sm shadow-xs transition-all hover-lift"
            >
              Bank Transfer
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: OUR PROGRAMS BLOGS (PAGE 3 OF PDF)             */}
      {/* ========================================================= */}
      <section className="w-full py-16 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-10">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A]">
              Our Programs Blogs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Blog Card 1 */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs hover-lift transition-all">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
                alt="Health training"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 space-y-3">
                <span className="text-[11px] font-bold text-[#EA3C36] uppercase tracking-wider">
                  HEALTH &amp; HYGIENE
                </span>
                <h3 className="text-lg font-bold text-[#1A1A1A]">
                  Scaling Rural Health Clinics in Remote Districts
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  How mobile first aid teams reach vulnerable households across
                  high altitude and flood-prone terrain.
                </p>
                <div className="pt-2">
                  <Link
                    to="/campaigns"
                    className="text-xs font-bold text-[#EA3C36] hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>

            {/* Blog Card 2 */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs hover-lift transition-all">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                alt="Youth engagement"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 space-y-3">
                <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider">
                  YOUTH VOLUNTEERING
                </span>
                <h3 className="text-lg font-bold text-[#1A1A1A]">
                  Empowering 75,000+ Young Leaders for Emergency Action
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Youth collectives undergoing nationwide disaster management
                  and rapid blood donation mobilization.
                </p>
                <div className="pt-2">
                  <Link
                    to="/campaigns"
                    className="text-xs font-bold text-[#EA3C36] hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>

            {/* Blog Card 3 */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs hover-lift transition-all">
              <img
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80"
                alt="Disaster relief"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 space-y-3">
                <span className="text-[11px] font-bold text-[#00A3C4] uppercase tracking-wider">
                  COMMUNITY RELIEF
                </span>
                <h3 className="text-lg font-bold text-[#1A1A1A]">
                  Bundelkhand &amp; Sehore Women Relief: Rebuilding Dignity
                  &amp; Livelihood
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Delivering non-food relief kits, clean water solutions, and
                  micro-livelihood setups to 715+ rural women-led households.
                </p>
                <div className="pt-2">
                  <Link
                    to="/campaigns"
                    className="text-xs font-bold text-[#EA3C36] hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: SPONSORS / CORPORATE PARTNERS (PAGE 3 OF PDF)  */}
      {/* ========================================================= */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
              Sponsors
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A]">
              Corporate Partners
            </h2>
          </div>

          {/* Carousel with Navigation Arrows */}
          <div className="flex items-center justify-between gap-6 pt-4">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#EA3C36] hover:bg-[#D32F2F] text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Partner Logos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-4xl items-center">
              <div className="h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-4">
                <span className="font-extrabold text-gray-500 tracking-wider">
                  UNICEF
                </span>
              </div>
              <div className="h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-4">
                <span className="font-extrabold text-gray-500 tracking-wider">
                  WHO
                </span>
              </div>
              <div className="h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-4">
                <span className="font-extrabold text-gray-500 tracking-wider">
                  IFRC
                </span>
              </div>
              <div className="h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-4">
                <span className="font-extrabold text-gray-500 tracking-wider">
                  NABARD
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#EA3C36] hover:bg-[#D32F2F] text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
