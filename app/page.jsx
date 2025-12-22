import Image from "next/image";
import { TrendingDown } from "lucide-react";
import AddProductForm from "@/components/AddProductForm";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { getProducts } from "./actions";
import ProductCard from "@/components/ProductCard";
export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = user ? await getProducts() : [];
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl px-2  flex justify-between items-center mx-auto ">
          <div className="flex items-center gap-3">
            <Image
              src={"/pricetrack_logo.png"}
              alt="Offer Ping logo"
              width={600}
              height={200}
              className="h-20 w-40"
            />
          </div>
          {/* Auth Button */}
          <AuthButton user={user} />
        </div>
      </header>
      <section>
        <div className="max-w-7xl mx-auto text-center">
          <div
            className="inline-flex gap-2 items-center 
          bg-gradient-to-r from-pink-100 to-orange-100
           text-pink-600 px-6 py-2 rounded-full text-sm 
           mb-6 mt-20 font-medium "
          >
            Made with ❤ by Shahnaz Fathima
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Buy Smart. Pay Less. Every Time.
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            We track price drops and offers for you from e-commerce site and
            alert you instantly so you never miss a great deal and save money
            effortlessly.
          </p>
          {/* Add Product Form */}
          {/* <AddProductForm user={user}/> */}
          <AddProductForm user={user} />
          {/* Features */}

          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block bg-gradient-to-br from-pink-200 to-orange-200 p-6 rounded-full mb-4">
                <TrendingDown size={48} className="text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start tracking your first product
              </h3>

              <p className="text-gray-600">
                Past a product link above to see its price drop and offers.
              </p>
            </div>
          )}
        </div>
      </section> 

      {user && products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Your Tracked Products</h3>
            <span>
              {products.length} {products.length === 1 ? "product" : "products"}
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 items-start">
            {products.map((product)=>(
              <ProductCard key={product.id} product={product}/>
            ))}
          </div>
        </section>
      )}

      {/* {user && products.length === 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
            <TrendingDown className="w-16 h-16 mx-auto text-gray-400 mb-4"/>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No products yet</h3>
            <p className="text-gray-600">Add your first product above to start </p>
          </div>
        </section>
      )} */}
    </main>
  );
}
