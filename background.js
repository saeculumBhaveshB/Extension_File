// Background script for Indiamart Lead Fetcher

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchLeads") {
    console.log("Received fetchLeads message from content script");
    fetchLeadData(message.forceBypassLoginCheck)
      .then((data) => {
        console.log(
          "Sending successful response back to content script:",
          data
        );
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("Sending error response back to content script:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async sendResponse
  } else if (message.action === "checkCookies") {
    console.log("Received checkCookies message from content script");
    checkCookies()
      .then((cookies) => {
        sendResponse({ success: true, cookies });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async sendResponse
  } else if (message.action === "directFetch") {
    console.log("Received directFetch message - using direct fetch method");
    directFetchLeads()
      .then((data) => {
        console.log("Direct fetch successful:", data);
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("Direct fetch failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async sendResponse
  }
});

// Function to check cookies
async function checkCookies() {
  try {
    const cookies = await chrome.cookies.getAll({
      domain: "seller.indiamart.com",
    });
    console.log("Cookies for seller.indiamart.com:", cookies);

    // If no cookies are found, try with a different domain
    if (cookies.length === 0) {
      const altCookies = await chrome.cookies.getAll({
        domain: "indiamart.com",
      });
      console.log("Alternative cookies from indiamart.com:", altCookies);
      return [...cookies.map((c) => c.name), ...altCookies.map((c) => c.name)];
    }

    return cookies.map((c) => c.name);
  } catch (error) {
    console.error("Error checking cookies:", error);
    throw error;
  }
}

// Function to get all cookies as a header string
async function getCookieHeader() {
  try {
    const sellerCookies = await chrome.cookies.getAll({
      domain: "seller.indiamart.com",
    });

    const indiamartCookies = await chrome.cookies.getAll({
      domain: "indiamart.com",
    });

    const allCookies = [...sellerCookies, ...indiamartCookies];

    if (allCookies.length === 0) {
      console.warn("No cookies found for Indiamart domains");
    }

    return allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
  } catch (error) {
    console.error("Error getting cookie header:", error);
    return "";
  }
}

// Direct fetch method using the exact cURL parameters from the example
async function directFetchLeads() {
  try {
    console.log("Starting direct fetch using cURL parameters");

    // First, get the count using the exact cURL parameters
    const cookieHeader = await getCookieHeader();
    console.log("Using cookie header:", cookieHeader);

    // Fetch the count first
    const countResponse = await fetch(
      "https://seller.indiamart.com/lmsreact/contactCount",
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
          "content-length": "0",
          "content-type": "application/json",
          cookie: cookieHeader,
          origin: "https://seller.indiamart.com",
          priority: "u=1, i",
          referer: "https://seller.indiamart.com/messagecentre",
          "sec-ch-ua":
            '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent": navigator.userAgent,
        },
        credentials: "include",
      }
    );

    if (!countResponse.ok) {
      const errorText = await countResponse.text();
      console.error("Count API error:", errorText);
      throw new Error(
        `Count API failed: ${countResponse.status} - ${errorText}`
      );
    }

    const countData = await countResponse.json();
    console.log("Count API response:", countData);

    const totalCount =
      countData.total_unhidden_count || countData.total_count || 0;
    console.log(`Total leads to fetch: ${totalCount}`);

    if (totalCount === 0) {
      return { leads: [], totalCount: 0 };
    }

    // Now fetch the actual leads
    const batchSize = 25; // Using 25 as in the example
    const batchCount = Math.ceil(totalCount / batchSize);
    let allLeads = [];
    let lastContactDate = "";

    // Fetch first batch
    const firstBatchResponse = await fetch(
      "https://seller.indiamart.com/lmsreact/getContactList",
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
          "content-type": "application/json",
          cookie: cookieHeader,
          origin: "https://seller.indiamart.com",
          priority: "u=1, i",
          referer: "https://seller.indiamart.com/messagecentre",
          "sec-ch-ua":
            '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent": navigator.userAgent,
        },
        body: JSON.stringify({
          start: 1,
          end: batchSize,
          type: 0,
          last_contact_date: "",
        }),
        credentials: "include",
      }
    );

    if (!firstBatchResponse.ok) {
      const errorText = await firstBatchResponse.text();
      console.error("First batch API error:", errorText);
      throw new Error(
        `First batch API failed: ${firstBatchResponse.status} - ${errorText}`
      );
    }

    const firstBatchData = await firstBatchResponse.json();
    console.log("First batch response:", firstBatchData);

    if (firstBatchData.data && Array.isArray(firstBatchData.data)) {
      allLeads = [...firstBatchData.data];

      // Get last contact date if available
      if (
        firstBatchData.data.length > 0 &&
        firstBatchData.data[firstBatchData.data.length - 1].contact_date
      ) {
        lastContactDate =
          firstBatchData.data[firstBatchData.data.length - 1].contact_date;
      }
    }

    // Fetch remaining batches if needed
    for (let batch = 1; batch < batchCount; batch++) {
      console.log(
        `Fetching batch ${
          batch + 1
        }/${batchCount} with lastContactDate: ${lastContactDate}`
      );

      const batchResponse = await fetch(
        "https://seller.indiamart.com/lmsreact/getContactList",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
            "content-type": "application/json",
            cookie: cookieHeader,
            origin: "https://seller.indiamart.com",
            priority: "u=1, i",
            referer: "https://seller.indiamart.com/messagecentre",
            "sec-ch-ua":
              '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": navigator.userAgent,
          },
          body: JSON.stringify({
            start: batch * batchSize + 1,
            end: (batch + 1) * batchSize,
            type: 0,
            last_contact_date: lastContactDate,
          }),
          credentials: "include",
        }
      );

      if (!batchResponse.ok) {
        console.warn(`Batch ${batch + 1} failed: ${batchResponse.status}`);
        continue;
      }

      const batchData = await batchResponse.json();
      console.log(`Batch ${batch + 1} response:`, batchData);

      if (batchData.data && Array.isArray(batchData.data)) {
        allLeads = [...allLeads, ...batchData.data];

        // Update last contact date if available
        if (
          batchData.data.length > 0 &&
          batchData.data[batchData.data.length - 1].contact_date
        ) {
          lastContactDate =
            batchData.data[batchData.data.length - 1].contact_date;
        }
      }

      // Add a small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(
      `Successfully fetched ${allLeads.length} leads using direct method`
    );

    // Save the leads to storage
    await chrome.storage.local.set({
      indiamartLeads: allLeads,
      lastFetchTime: new Date().toISOString(),
    });

    return { leads: allLeads, totalCount };
  } catch (error) {
    console.error("Error in direct fetch:", error);
    throw error;
  }
}

// Function to fetch the total count of leads
async function fetchLeadCount() {
  try {
    console.log("Fetching lead count...");

    // Log the cookies for debugging
    const cookies = await chrome.cookies.getAll({
      domain: "seller.indiamart.com",
    });
    console.log(
      "Available cookies:",
      cookies.map((c) => c.name)
    );

    // If no cookies are found, try with a different domain
    if (cookies.length === 0) {
      const altCookies = await chrome.cookies.getAll({
        domain: "indiamart.com",
      });
      console.log(
        "Alternative cookies from indiamart.com:",
        altCookies.map((c) => c.name)
      );
    }

    const response = await fetch(
      "https://seller.indiamart.com/lmsreact/contactCount",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
          Origin: "https://seller.indiamart.com",
          Referer: "https://seller.indiamart.com/messagecentre",
          "User-Agent": navigator.userAgent,
        },
        credentials: "include", // Include cookies
      }
    );

    console.log("Lead count response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(
        `Failed to fetch lead count: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Lead count data:", data);

    // Check if the response contains the expected data
    if (!data || typeof data !== "object") {
      console.error("Unexpected response format:", data);
      throw new Error("Unexpected response format from Indiamart API");
    }

    // Extract the total count from the response
    const totalCount = data.total_unhidden_count || 0;
    console.log(`Total unhidden count: ${totalCount}`);

    // If total_unhidden_count is not available, try other fields
    if (totalCount === 0 && data.total_count) {
      console.log(`Using total_count instead: ${data.total_count}`);
      return data.total_count;
    }

    return totalCount;
  } catch (error) {
    console.error("Error fetching lead count:", error);
    throw error;
  }
}

// Function to fetch lead data in batches
async function fetchLeadData(forceBypassLoginCheck = false) {
  try {
    // First, get the total count of leads
    const totalCount = await fetchLeadCount();
    console.log(`Total leads to fetch: ${totalCount}`);

    if (totalCount === 0) {
      console.log("No leads to fetch, returning empty array");
      return { leads: [], totalCount: 0 };
    }

    // Calculate how many batches we need to fetch (100 leads per batch)
    const batchSize = 100;
    const batchCount = Math.ceil(totalCount / batchSize);
    let allLeads = [];
    let lastContactDate = "";

    // Fetch leads in batches
    for (let batch = 0; batch < batchCount; batch++) {
      const start = batch * batchSize + 1;
      const end = Math.min((batch + 1) * batchSize, totalCount);

      console.log(
        `Fetching batch ${batch + 1}/${batchCount} (leads ${start}-${end})`
      );

      const batchLeads = await fetchLeadBatch(start, end, lastContactDate);
      console.log(`Received ${batchLeads.length} leads in batch ${batch + 1}`);

      if (batchLeads.length > 0) {
        allLeads = [...allLeads, ...batchLeads];

        // Update lastContactDate for the next batch if needed
        if (batchLeads.length > 0 && batch < batchCount - 1) {
          const lastLead = batchLeads[batchLeads.length - 1];
          if (lastLead && lastLead.contact_date) {
            lastContactDate = lastLead.contact_date;
            console.log(`Updated lastContactDate to: ${lastContactDate}`);
          }
        }
      } else {
        console.warn(
          `Batch ${batch + 1} returned no leads, may need to check API response`
        );
      }

      // Add a small delay between batches to avoid rate limiting
      if (batch < batchCount - 1) {
        console.log("Adding delay between batches...");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(
      `Successfully fetched ${allLeads.length} leads out of ${totalCount} total`
    );

    // Save the leads to storage
    await chrome.storage.local.set({
      indiamartLeads: allLeads,
      lastFetchTime: new Date().toISOString(),
    });
    console.log("Saved leads to storage");

    return { leads: allLeads, totalCount };
  } catch (error) {
    console.error("Error fetching lead data:", error);
    throw error;
  }
}

// Function to fetch a batch of leads
async function fetchLeadBatch(start, end, lastContactDate = "") {
  try {
    console.log(
      `Fetching lead batch from ${start} to ${end} with lastContactDate: ${lastContactDate}`
    );

    const requestBody = {
      start,
      end,
      type: 0,
      last_contact_date: lastContactDate,
    };

    console.log("Request body:", requestBody);

    const response = await fetch(
      "https://seller.indiamart.com/lmsreact/getContactList",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
          Origin: "https://seller.indiamart.com",
          Referer: "https://seller.indiamart.com/messagecentre",
          "User-Agent": navigator.userAgent,
        },
        body: JSON.stringify(requestBody),
        credentials: "include", // Include cookies
      }
    );

    console.log(`Batch ${start}-${end} response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(
        `Failed to fetch lead batch: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log(`Batch ${start}-${end} response data:`, data);

    if (!data) {
      console.warn(`Batch ${start}-${end}: No data returned`);
      return [];
    }

    // Check different possible response formats
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.leads && Array.isArray(data.leads)) {
      return data.leads;
    } else {
      console.warn(`Batch ${start}-${end}: Unexpected response format:`, data);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching lead batch ${start}-${end}:`, error);
    throw error;
  }
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Indiamart Lead Fetcher extension installed");
});
