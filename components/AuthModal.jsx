"use client"
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";

export function AuthModal({ isOpen, onClose }) {
  const supabase = createClient();
  const handleGoogleLogin = async () => {
    const { origin } = window.location;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In to continue</DialogTitle>
          <DialogDescription>
            Track product prices and get alerts on price drops
          </DialogDescription>
        </DialogHeader>
        <div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleLogin}
            size="lg"
          >
            <FcGoogle />
            Continue with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
