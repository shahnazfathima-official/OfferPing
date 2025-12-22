"use client";
import { deleteProduct } from "@/app/actions";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { Badge } from "./ui/badge";
import PriceChart from "./PriceChart";
const ProductCard = ({ product }) => {
  const [showChart, setShowChart] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!confirm("Remove this product from tracking?")) return;
    setDeleting(true);
    const result = await deleteProduct(product.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Product deleted successfully!");
      setUrl("");
    }
    setDeleting(false);
  };
  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
      <CardHeader className={"pb-3"}>
        <div className="flex gap-4">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className=" w-20 h-20 object-cover rounded-md border"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-pink-600">
                {product.currency} {product.current_price}
              </span>
              <Badge className="gap-1" variant="secondary">
                <TrendingDown className="w-3 h-3" />
                Tracking
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="gap-1"
          >
            {showChart ? (
              <>
                <ChevronUp />
                Hide Chart
              </>
            ) : (
              <>
                <ChevronDown />
                Show Chart
              </>
            )}
          </Button>
          <Button className="gap-1 " size="sm" asChild variant="outline">
            <Link href={product.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View Product
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={deleting}
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-100 gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
        </div>
      </CardContent>
      {showChart && (
        <CardFooter className="flex-col gap-2">
        <PriceChart productId={product.id}/>
      </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
