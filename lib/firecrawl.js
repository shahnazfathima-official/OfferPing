import Firecrawl from "@mendable/firecrawl-js";

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function scrapeProduct(url) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firecrawl.js:5',message:'Starting scrape',data:{url:url,hasApiKey:!!process.env.FIRECRAWL_API_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY environment variable is not set");
    }
    const result = await firecrawl.scrape(url, {
      formats: [
        {
          type: "json",
          schema: {
            type: "object",
            required: ["productName", "currentPrice"],
            properties: {
              productName: {
                type: "string",
              },
              currentPrice: {
                type: "string",
              },
              currencyCode: {
                type: "string",
              },
              productImageUrl: {
                type: "string",
              },
            },
          },
          prompt:
            "Extract the product name as 'productName' , current price as a number as 'currentPrice' , currency code (USD, EUR, etc) as 'currencyCode', and product image URL as 'productImageUrl' if available",
        },
      ],
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firecrawl.js:34',message:'Firecrawl response received',data:{url:url,hasResult:!!result,hasJson:!!result?.json,extractedData:result?.json},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const extractedData= result.json;
    if(!extractedData || !extractedData.productName){
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firecrawl.js:37',message:'Missing productName in extracted data',data:{url:url,extractedData:extractedData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw new Error(`No data extracted from URL. Extracted data: ${JSON.stringify(extractedData)}`);
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firecrawl.js:40',message:'Scrape successful',data:{url:url,extractedData:extractedData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return extractedData;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1a998204-ec27-4d8f-b73e-fc9e0bf28785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firecrawl.js:42',message:'Firecrawl scrape error',data:{url:url,error:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("Firecrawl scrape error:",error);
    throw new Error(`Failed to scrape product:${error.message}`);
  }
}
