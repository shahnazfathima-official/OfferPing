"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { addProduct } from "@/app/actions";
import { toast } from "sonner";

// const AddProductForm = ({ user }) => {
const AddProductForm = ({user}) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal]=useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!user){
      setShowAuthModal(true);
      return;
    }
    setLoading(true);
    const formData= new FormData();
    formData.append("url",url);
    const result= await addProduct(formData);
    if(result.error){
      toast.error(result.error);
      }
      else{
        toast.success(result.message ||"Product tracked successfully!");
        setUrl("");
      }
      setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product URL (Flipkart, Amazon, etc)"
            className="h-12 text-base flex-1 "
            required
            disabled={loading}
          />
          <Button
            className="h-10 sm:h-12 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Track Price"
            )}
          </Button>
        </div>
      </form>
      <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
            />
    </>
  );
};

export default AddProductForm;
