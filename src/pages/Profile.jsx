import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Shield, LogOut, Package, ArrowRight, ShoppingBag, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/store/authStore";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => logout();

  if (!user) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <User className="h-7 w-7 text-stone-400" />
        </div>
        <h2 className="text-xl font-bold text-stone-800 mb-2">Not logged in</h2>
        <p className="text-stone-400 mb-6 text-sm">Please login to view your profile.</p>
        <Button variant="secondary" asChild><Link to="/login">Login</Link></Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-12"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">My Profile</h1>
      <p className="text-stone-400 text-sm mb-6">Manage your account information</p>

      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-soft">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#D2691E] to-[#E8A04F] p-6 sm:p-8 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-white/30">
              <AvatarFallback className="text-xl">
                {user.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-white/80">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold uppercase bg-white/20 rounded-full px-2.5 py-0.5">
                <Shield className="h-3 w-3" />
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-stone-400" />
              <span className="text-stone-500 min-w-[80px]">Full Name</span>
              <span className="font-semibold text-stone-900">{user.name}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-stone-400" />
              <span className="text-stone-500 min-w-[80px]">Email</span>
              <span className="font-semibold text-stone-900">{user.email}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-stone-400" />
              <span className="text-stone-500 min-w-[80px]">Role</span>
              <span className="font-semibold text-stone-900 capitalize">{user.role}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <Package className="h-4 w-4 text-stone-400" />
              <span className="text-stone-500 min-w-[80px]">Member Since</span>
              <span className="font-semibold text-stone-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            {user.role === "customer" && (
              <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-stone-200 text-stone-700 hover:bg-stone-50" asChild>
                <Link to="/orders">
                  <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> My Orders</span>
                  <ArrowRight className="h-4 w-4 text-stone-400" />
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-between h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={handleLogout}
            >
              <span className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
