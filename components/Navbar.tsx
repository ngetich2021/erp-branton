'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { RiDashboard3Line } from "react-icons/ri";
import { BsPersonWalking } from "react-icons/bs";
import { MdOutlineLocalPharmacy } from "react-icons/md";
import { FaHospitalSymbol } from "react-icons/fa";
import { FaPeopleCarryBox } from "react-icons/fa6";
import { FaUserShield } from "react-icons/fa6";
import { BiMoneyWithdraw } from "react-icons/bi";
import { GiExpense } from "react-icons/gi";
import { MdVideogameAsset } from "react-icons/md";
import { MdPayments } from "react-icons/md";
import { IoIosNotificationsOutline } from "react-icons/io";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { useSession } from "next-auth/react";
import Profile from "./Profile";

const NavLinks = [
  { id: 1, title: "dashboard", href: "/dashboard", icon: <RiDashboard3Line size={32} /> },
  { id: 2, title: "patients", href: "/patients", icon: <BsPersonWalking size={32} /> },
  { id: 3, title: "pharmacy", href: "/pharmacy", icon: <MdOutlineLocalPharmacy size={32} /> },
  { id: 4, title: "hospitals", href: "/hospitals", icon: <FaHospitalSymbol size={32} /> },
  { id: 5, title: "staff", href: "/staff", icon: <FaPeopleCarryBox size={32} /> },
  { id: 6, title: "suppliers", href: "/suppliers", icon: <FaUserShield size={32} /> },
  { id: 7, title: "sales", href: "/sales", icon: <BiMoneyWithdraw size={32} /> },
  { id: 8, title: "expenses", href: "/expenses", icon: <GiExpense size={32} /> },
  { id: 9, title: "reports", href: "/reports", icon: <RiDashboard3Line size={32} /> },
  { id: 10, title: "assets", href: "/assets", icon: <MdVideogameAsset size={32} /> },
  { id: 11, title: "payments", href: "/payments", icon: <MdPayments size={32} /> },
];

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const isActive = (href: string) => pathname === href;

 const { data: session } = useSession();

 const [profile, setProfile] = useState(false);

  return (
    <nav className="flex gap-2 overflow-hidden">
      {/* Top bar */}
      <div className="h-24 w-full fixed top-0 left-0 flex justify-between items-center z-50 bg-white border-b border-gray-500 px-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 relative flex-shrink-0">
            <Image src="/branton_logo.png" alt="Logo" fill className="object-cover rounded-full p-2 border border-gray-600" />
          </div>
          <button onClick={toggleSidebar} className="xl:hidden text-gray-700 hover:text-gray-900">
            {isCollapsed ? <IoIosArrowForward size={32} /> : <IoIosArrowBack size={32} />}
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="relative">
            <IoIosNotificationsOutline size={28} className="text-gray-700" />
            <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white flex items-center justify-center">
              20
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 relative">
            {session && (
            <>
              <button
                onClick={() => setProfile(prev => !prev)}
                className="relative w-10 h-10"
              >
                <Image
                  src={session.user?.image ?? '/branton_logo.png'}
                  alt="User"
                  fill
                  className="object-cover rounded-full border border-gray-600"
                />
              </button>

              {profile && <Profile/>}
            </>
          )}
            </div>
            {session ? (
              <p className="hidden md:block font-bold text-sm text-nowrap text-gray-800">
                Hey, {session.user?.name}
              </p>
            ) : (
              'welcome'
            )}
          </div>
        </div>
      </div>

      {/* Sidebar – this is the line we fixed */}
      <div
        className={`fixed top-24 left-0 h-screen bg-white border-r border-gray-500 transition-all duration-300 flex flex-col ${
          isCollapsed ? "w-20" : "w-64"   // ← fixed: w-64 instead of w-30
        } z-40`}
      >
        <ul className="flex flex-col gap-2 py-6 px-4 flex-1 overflow-y-auto">
          {NavLinks.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                className={`flex items-center gap-4 rounded-lg px-3 py-3 transition-all ${
                  isActive(link.href)
                    ? "bg-blue-100 text-blue-700 font-bold shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex shrink-0">{link.icon}</div>
                {!isCollapsed && (
                  <span className="text-sm lg:text-base font-semibold capitalize">{link.title}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout – now always visible */}
        <div className="border-t border-gray-300 px-4 py-6">
          <button
            className="flex items-center gap-4 w-full rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-100 transition-all"
            onClick={() => console.log("Logout clicked – add your signOut here")}
          >
            <IoIosLogOut size={32} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm lg:text-base font-semibold">Logout</span>}
          </button>
        </div>
      </div>

      {/* Content padding */}
      <div className={`pt-24 transition-all duration-300 ${isCollapsed ? "pl-20" : "pl-64"}`}>
        {/* Your page content goes here */}
      </div>
    </nav>
  );
}