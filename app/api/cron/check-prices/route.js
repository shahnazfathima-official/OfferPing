import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropAlert } from "@/lib/email";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) throw productsError;

    console.log(`Found ${products.length} products to check`);

    const results = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      alertsSent: 0,
    };

    const debugInfo = [];

    for (const product of products) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.js:37',message:'Processing product',data:{productId:product.id,url:product.url,currentPrice:product.current_price},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        debugInfo.push({ step: 'start', productId: product.id, url: product.url, oldPrice: product.current_price });
        
        const productData = await scrapeProduct(product.url);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.js:40',message:'Scrape completed',data:{productId:product.id,productData:productData,hasCurrentPrice:!!productData?.currentPrice},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        debugInfo.push({ step: 'scrape_complete', productId: product.id, productData: productData, hasCurrentPrice: !!productData?.currentPrice });

        if (!productData.currentPrice) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.js:44',message:'Missing currentPrice - marking as failed',data:{productId:product.id,productData:productData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          debugInfo.push({ step: 'missing_price', productId: product.id, reason: 'No currentPrice in scraped data', productData: productData });
          results.failed++;
          continue;
        }

        //const newPrice = parseFloat(productData.currentPrice);
        const newPrice = Number(
          productData.currentPrice.replace(/[^\d.]/g, "")
        );
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.js:51',message:'Price parsed',data:{productId:product.id,rawPrice:productData.currentPrice,parsedNewPrice:newPrice,isNaN:isNaN(newPrice)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        debugInfo.push({ step: 'price_parsed', productId: product.id, rawPrice: productData.currentPrice, parsedNewPrice: newPrice, isNaN: isNaN(newPrice) });

        const oldPrice = parseFloat(product.current_price);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.js:54',message:'Price comparison values',data:{productId:product.id,oldPrice:oldPrice,newPrice:newPrice,priceEqual:oldPrice===newPrice,priceDropped:newPrice<oldPrice},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        debugInfo.push({ step: 'price_comparison', productId: product.id, oldPrice: oldPrice, newPrice: newPrice, priceEqual: oldPrice === newPrice, priceDropped: newPrice < oldPrice });

        await supabase
          .from("products")
          .update({
            current_price: newPrice,
            currency: productData.currencyCode || product.currency,
            name: productData.productName || product.name,
            image_url: productData.productImageUrl || product.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (oldPrice !== newPrice) {
          await supabase.from("price_history").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          results.priceChanges++;

          if (newPrice < oldPrice) {
            const {
              data: { user },
            } = await supabase.auth.admin.getUserById(product.user_id);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.js:76',message:'Price drop detected - checking user',data:{productId:product.id,userId:product.user_id,hasUser:!!user,hasEmail:!!user?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            debugInfo.push({ step: 'price_drop_detected', productId: product.id, userId: product.user_id, hasUser: !!user, hasEmail: !!user?.email });

            if (user?.email) {
              const emailResult = await sendPriceDropAlert(
                user.email,
                product,
                oldPrice,
                newPrice
              );
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.js:85',message:'Email send result',data:{productId:product.id,emailResult:emailResult,success:emailResult?.success},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
              debugInfo.push({ step: 'email_sent', productId: product.id, emailResult: emailResult, success: emailResult?.success });

              if (emailResult.success) {
                results.alertsSent++;
              }
            } else {
              debugInfo.push({ step: 'email_skipped', productId: product.id, reason: 'No user email found', hasUser: !!user });
            }
          }
        }

        results.updated++;
        debugInfo.push({ step: 'completed', productId: product.id });
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.js:98',message:'Error processing product',data:{productId:product?.id,error:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error(`Error processing product ${product.id}:`, error);
        debugInfo.push({ step: 'error', productId: product?.id, error: error?.message, errorStack: error?.stack?.split('\n').slice(0, 3) });
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
      debug: debugInfo,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Price check endpoint is working. Use POST to trigger.",
  });
}

// curl.exe -X POST https://getofferping.vercel.app/api/cron/check-prices -H "Authorization: Bearer 49e003f3ee7db3d8844ffc887bee5eabef5a40a4855bf84ea2de35632828c901"
