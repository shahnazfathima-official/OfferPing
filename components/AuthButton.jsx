"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import { LogOut } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { signOut } from "@/app/actions";

const AuthButton = ({ user }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  if (user) {
    return (
      <form action={signOut}>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="gap-2 border"
        >
            
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </form>
    );
  }
  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="default"
        className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-full hover:from-pink-600 hover:to-orange-600 w-25 h-10"
        size="sm"
      >
        <LogIn />
        Sign In
      </Button>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default AuthButton;
