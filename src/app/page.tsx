"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCredentials } from "@/lib/features/auth/authSlice";
import api from "@/lib/api";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import logo from "../../public/asserts/logo.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
  });

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const user = response.data;
        dispatch(setCredentials({ user }));
        router.push("/dashboard");
      } else {
        const response = await api.post("/auth/register", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          password: formData.password,
          userType: "APPLICANT",
        });

        if (response.data.id) {
          const user = response.data;
          dispatch(setCredentials({ user }));
          router.push("/dashboard");
        } else {
          setIsLogin(true);
          setError("Account created successfully! Please sign in.");
        }
      }
    } catch (err: unknown) {
      console.error("Auth Error:", err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left side - Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[#c0392b]">
        {/* Background Accents */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl w-fit border border-white/20">
            <div className="bg-white p-2 rounded-lg">
              <Image
                src={logo}
                alt="NBU Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight uppercase tracking-wider">
                NBU Applicant
              </p>
              <p className="text-white/70 text-xs font-medium tracking-widest uppercase">
                Portal Gateway
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h1 className="text-white text-6xl font-extrabold leading-tight tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Build Your <span className="text-white/60">Legacy</span> with Us.
          </h1>
          <p className="text-white/80 text-xl font-medium leading-relaxed mb-8">
            Join a community of excellence. Start your journey today at Nigerian
            British University and unlock your full potential.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <GraduationCap className="text-white/60 w-6 h-6" />
              <span className="text-white/80 text-sm font-medium">
                World-Class Education
              </span>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="text-white/60 w-6 h-6" />
              <span className="text-white/80 text-sm font-medium">
                Secure Application
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          Nigerian British University © 2026. Admissions Office.
        </div>
      </div>

      {/* Right side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-y-auto">
        <div className="w-full max-w-[480px] py-12 animate-in fade-in zoom-in-95 duration-500">
          {/* Mobile Header */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="bg-white px-8 py-4 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col items-center">
              <Image
                src={logo}
                alt="NBU Logo"
                width={100}
                height={50}
                className="object-contain mb-2"
              />
              <p className="text-[#c0392b] font-bold text-xs uppercase tracking-[0.2em]">
                Applicant Portal
              </p>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[44px] font-[900] text-[#0f172a] tracking-[-0.04em] leading-tight mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-[#64748b] text-[18px] font-medium">
              {isLogin
                ? "Sign in to continue your application or manage your profile."
                : "Fill in the details below to start your journey with NBU."}
            </p>
          </div>

          {error && (
            <div
              className={`mb-8 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 border ${
                error.includes("successfully")
                  ? "bg-green-50 border-green-100"
                  : "bg-red-50 border-red-100"
              }`}
            >
              {error.includes("successfully") ? (
                <CheckCircle2 className="text-green-600 w-5 h-5 mt-0.5" />
              ) : (
                <AlertCircle className="text-red-600 w-5 h-5 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-semibold text-sm ${error.includes("successfully") ? "text-green-900" : "text-red-900"}`}
                >
                  {error.includes("successfully")
                    ? "Success"
                    : "Authentication Error"}
                </p>
                <p
                  className={`text-sm mt-0.5 ${error.includes("successfully") ? "text-green-700/80" : "text-red-700/80"}`}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {!isLogin && (
              <div className="space-y-7 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <label
                      htmlFor="firstName"
                      className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-[0.1em] ml-1"
                    >
                      First Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#94a3b8] group-focus-within:text-[#c0392b] transition-colors" />
                      <input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full h-[60px] pl-12 pr-4 bg-[#f8fafc] border border-transparent rounded-[14px] text-[#1e293b] text-[15px] font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#c0392b]/5 focus:border-[#c0392b]/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label
                      htmlFor="lastName"
                      className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-[0.1em] ml-1"
                    >
                      SurName
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#94a3b8] group-focus-within:text-[#c0392b] transition-colors" />
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full h-[60px] pl-12 pr-4 bg-[#f8fafc] border border-transparent rounded-[14px] text-[#1e293b] text-[15px] font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#c0392b]/5 focus:border-[#c0392b]/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label
                    htmlFor="middleName"
                    className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-[0.1em] ml-1"
                  >
                    Other Name (Optional)
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#94a3b8] group-focus-within:text-[#c0392b] transition-colors" />
                    <input
                      id="middleName"
                      type="text"
                      placeholder="Quincy"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      className="w-full h-[60px] pl-12 pr-4 bg-[#f8fafc] border border-transparent rounded-[14px] text-[#1e293b] text-[15px] font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#c0392b]/5 focus:border-[#c0392b]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label
                htmlFor="email"
                className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-[0.1em] ml-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#94a3b8] group-focus-within:text-[#c0392b] transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="anita2@yopmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-[60px] pl-12 pr-4 bg-[#eff6ff] border border-transparent rounded-[14px] text-[#1e293b] text-[15px] font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#c0392b]/5 focus:border-[#c0392b]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label
                  htmlFor="password"
                  className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-[0.1em]"
                >
                  Security Key
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-[#c0392b] text-[11px] font-bold hover:underline"
                  >
                    RECOVER ACCESS?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#94a3b8] group-focus-within:text-[#c0392b] transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-[60px] pl-12 pr-12 bg-[#f8fafc] border border-transparent rounded-[14px] text-[#1e293b] text-[15px] font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#c0392b]/5 focus:border-[#c0392b]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[64px] bg-[#c0392b] hover:bg-[#a93226] text-white font-[800] text-[17px] rounded-[16px] shadow-[0_12px_24px_-8px_rgba(192,57,43,0.3)] hover:shadow-[0_16px_32px_-8px_rgba(192,57,43,0.4)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isLogin ? "Sign In to Portal" : "Begin Your Journey"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setFormData({ ...formData, password: "" });
            }}
            className="w-full mt-10 py-5 px-6 rounded-[18px] border-2 border-dashed border-[#e2e8f0] text-[#64748b] hover:border-[#c0392b] hover:text-[#c0392b] hover:bg-[#fff1f2] transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-[14px] font-semibold">
              {isLogin ? "New applicant?" : "Already possess an account?"}
            </span>
            <span className="text-[14px] font-[800] uppercase tracking-tight">
              {isLogin ? "Establish Identity" : "Log In"}
            </span>
          </button>

          <div className="mt-12 flex items-center justify-center gap-2.5 p-4.5 bg-[#f8fafc] rounded-[16px] border border-[#f1f5f9] select-none">
            <ShieldCheck className="text-[#94a3b8] w-[18px] h-[18px]" />
            <p className="text-[#c0392b] text-[10px] font-black uppercase tracking-[0.35em]">
              SECURE ADMISSIONS GATEWAY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
