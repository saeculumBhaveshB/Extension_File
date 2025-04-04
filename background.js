// Background script for Indiamart Lead Fetcher

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchLeads") {
    console.log("Received fetchLeads message from content script");
    // Always use direct fetch for paid customers
    directFetchLeads()
      .then((data) => {
        console.log(
          "Sending successful response back to content script:",
          data
        );
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("Direct fetch failed:", error);
        // If direct fetch fails, try XHR method
        alternativeXhrFetch()
          .then((data) => {
            console.log("Alternative XHR fetch successful:", data);
            sendResponse({ success: true, data });
          })
          .catch((altError) => {
            console.error("Alternative XHR fetch also failed:", altError);
            // Last resort: try the original method
            fetchLeadData(true)
              .then((data) => {
                console.log("Original fetch method successful:", data);
                sendResponse({ success: true, data });
              })
              .catch((origError) => {
                console.error("All fetch methods failed:", origError);
                sendResponse({
                  success: false,
                  error:
                    "All fetch methods failed. Please check console for details.",
                });
              });
          });
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
        // If the direct fetch method fails, try the alternative method
        console.log("Trying alternative XHR method...");
        alternativeXhrFetch()
          .then((data) => {
            console.log("Alternative XHR fetch successful:", data);
            sendResponse({ success: true, data });
          })
          .catch((altError) => {
            console.error("Alternative XHR fetch also failed:", altError);
            sendResponse({
              success: false,
              error:
                "All fetch methods failed. Please check console for details.",
            });
          });
      });
    return true; // Required for async sendResponse
  } else if (message.action === "xhrFetch") {
    console.log("Received xhrFetch message - using XHR fetch method directly");
    alternativeXhrFetch()
      .then((data) => {
        console.log("XHR fetch successful:", data);
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("XHR fetch failed:", error);
        // Try direct fetch as fallback
        directFetchLeads()
          .then((data) => {
            console.log("Direct fetch successful as fallback:", data);
            sendResponse({ success: true, data });
          })
          .catch((directError) => {
            console.error("All fetch methods failed:", directError);
            sendResponse({
              success: false,
              error:
                "All fetch methods failed. Please check console for details.",
            });
          });
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

    const indiamartCookies = await chrome.cookies.getAll({
      domain: "indiamart.com",
    });

    return {
      sellerCookies: cookies,
      indiamartCookies: indiamartCookies,
      allCookies: [...cookies, ...indiamartCookies],
    };
  } catch (error) {
    console.error("Error checking cookies:", error);
    throw error;
  }
}

// Function to get cookie header for API requests
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
      // Try to get cookies from all domains as a fallback
      const allDomainCookies = await chrome.cookies.getAll({});
      const filteredCookies = allDomainCookies.filter(
        (cookie) =>
          cookie.domain.includes("indiamart") ||
          cookie.name.includes("ImTkn") ||
          cookie.name.includes("xnHist") ||
          cookie.name.includes("G_ENABLED_IDPS") ||
          cookie.name.includes("im_iss") ||
          cookie.name.includes("ImSession")
      );

      if (filteredCookies.length > 0) {
        console.log(
          "Found some Indiamart-related cookies from all domains:",
          filteredCookies
        );
        return filteredCookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; ");
      }
    }

    console.log("All cookies found:", allCookies);
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

    if (!cookieHeader || cookieHeader.trim() === "") {
      console.error("No cookies available for API requests");
      throw new Error(
        "No cookies available. Please make sure you are logged in to Indiamart."
      );
    }

    // Fetch the count first
    console.log("Fetching lead count...");
    const countResponse = await fetch(
      "https://seller.indiamart.com/lmsreact/contactCount",
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
          "content-type": "application/json",
          cookie: cookieHeader,
          origin: "https://seller.indiamart.com",
          referer: "https://seller.indiamart.com/messagecentre",
          "sec-ch-ua": '"Chromium";v="112", "Google Chrome";v="112"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent": navigator.userAgent,
        },
        credentials: "include",
        body: JSON.stringify({}),
      }
    );

    console.log("Count API status:", countResponse.status);

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
      console.log("No leads found in the account");
      return { leads: [], totalCount: 0 };
    }

    // Now fetch the actual leads
    const batchSize = 25; // Using 25 as in the example
    const batchCount = Math.ceil(totalCount / batchSize);
    let allLeads = [];
    let lastContactDate = "";

    // Fetch first batch
    console.log("Fetching first batch of leads...");
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
          referer: "https://seller.indiamart.com/messagecentre",
          "sec-ch-ua": '"Chromium";v="112", "Google Chrome";v="112"',
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

    console.log("First batch API status:", firstBatchResponse.status);

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
            referer: "https://seller.indiamart.com/messagecentre",
            "sec-ch-ua": '"Chromium";v="112", "Google Chrome";v="112"',
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

// Alternative method using XMLHttpRequest instead of fetch
async function alternativeXhrFetch() {
  try {
    console.log("Starting alternative XHR fetch method");

    // Get cookie header
    const cookieHeader = await getCookieHeader();
    console.log("Using cookie header for XHR method:", cookieHeader);

    if (!cookieHeader || cookieHeader.trim() === "") {
      console.error("No cookies available for XHR API requests");
      throw new Error(
        "No cookies available. Please make sure you are logged in to Indiamart."
      );
    }

    // First get the count
    const countData = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            try {
              const response = JSON.parse(this.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error("Failed to parse count response: " + e.message));
            }
          } else {
            reject(
              new Error("Count request failed with status: " + this.status)
            );
          }
        }
      });

      xhr.open("POST", "https://seller.indiamart.com/lmsreact/contactCount");
      xhr.setRequestHeader("accept", "*/*");
      xhr.setRequestHeader(
        "accept-language",
        "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7"
      );
      xhr.setRequestHeader("content-type", "application/json");
      xhr.setRequestHeader("cookie", cookieHeader);
      xhr.setRequestHeader("origin", "https://seller.indiamart.com");
      xhr.setRequestHeader(
        "referer",
        "https://seller.indiamart.com/messagecentre"
      );
      xhr.setRequestHeader(
        "sec-ch-ua",
        '"Chromium";v="112", "Google Chrome";v="112"'
      );
      xhr.setRequestHeader("sec-ch-ua-mobile", "?0");
      xhr.setRequestHeader("sec-ch-ua-platform", '"macOS"');

      xhr.send(JSON.stringify({}));
    });

    console.log("Count API response (XHR):", countData);

    const totalCount =
      countData.total_unhidden_count || countData.total_count || 0;
    console.log(`Total leads to fetch (XHR): ${totalCount}`);

    if (totalCount === 0) {
      console.log("No leads found in the account (XHR)");
      return { leads: [], totalCount: 0 };
    }

    // Now fetch the actual leads
    const batchSize = 25;
    const batchCount = Math.ceil(totalCount / batchSize);
    let allLeads = [];
    let lastContactDate = "";

    // Fetch first batch
    console.log("Fetching first batch of leads (XHR)...");

    const firstBatchData = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            try {
              const response = JSON.parse(this.responseText);
              resolve(response);
            } catch (e) {
              reject(
                new Error("Failed to parse first batch response: " + e.message)
              );
            }
          } else {
            reject(
              new Error(
                "First batch request failed with status: " + this.status
              )
            );
          }
        }
      });

      xhr.open("POST", "https://seller.indiamart.com/lmsreact/getContactList");
      xhr.setRequestHeader("accept", "*/*");
      xhr.setRequestHeader(
        "accept-language",
        "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7"
      );
      xhr.setRequestHeader("content-type", "application/json");
      xhr.setRequestHeader("cookie", cookieHeader);
      xhr.setRequestHeader("origin", "https://seller.indiamart.com");
      xhr.setRequestHeader(
        "referer",
        "https://seller.indiamart.com/messagecentre"
      );
      xhr.setRequestHeader(
        "sec-ch-ua",
        '"Chromium";v="112", "Google Chrome";v="112"'
      );
      xhr.setRequestHeader("sec-ch-ua-mobile", "?0");
      xhr.setRequestHeader("sec-ch-ua-platform", '"macOS"');

      xhr.send(
        JSON.stringify({
          start: 1,
          end: batchSize,
          type: 0,
          last_contact_date: "",
        })
      );
    });

    console.log("First batch response (XHR):", firstBatchData);

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
        }/${batchCount} with lastContactDate: ${lastContactDate} (XHR)`
      );

      try {
        const batchData = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.withCredentials = true;

          xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
              if (this.status === 200) {
                try {
                  const response = JSON.parse(this.responseText);
                  resolve(response);
                } catch (e) {
                  reject(
                    new Error("Failed to parse batch response: " + e.message)
                  );
                }
              } else {
                reject(
                  new Error("Batch request failed with status: " + this.status)
                );
              }
            }
          });

          xhr.open(
            "POST",
            "https://seller.indiamart.com/lmsreact/getContactList"
          );
          xhr.setRequestHeader("accept", "*/*");
          xhr.setRequestHeader(
            "accept-language",
            "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7"
          );
          xhr.setRequestHeader("content-type", "application/json");
          xhr.setRequestHeader("cookie", cookieHeader);
          xhr.setRequestHeader("origin", "https://seller.indiamart.com");
          xhr.setRequestHeader(
            "referer",
            "https://seller.indiamart.com/messagecentre"
          );
          xhr.setRequestHeader(
            "sec-ch-ua",
            '"Chromium";v="112", "Google Chrome";v="112"'
          );
          xhr.setRequestHeader("sec-ch-ua-mobile", "?0");
          xhr.setRequestHeader("sec-ch-ua-platform", '"macOS"');

          xhr.send(
            JSON.stringify({
              start: batch * batchSize + 1,
              end: (batch + 1) * batchSize,
              type: 0,
              last_contact_date: lastContactDate,
            })
          );
        });

        console.log(`Batch ${batch + 1} response (XHR):`, batchData);

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
      } catch (error) {
        console.warn(`Batch ${batch + 1} failed (XHR):`, error);
        continue;
      }

      // Add a small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(
      `Successfully fetched ${allLeads.length} leads using XHR method`
    );

    // Save the leads to storage
    await chrome.storage.local.set({
      indiamartLeads: allLeads,
      lastFetchTime: new Date().toISOString(),
    });

    return { leads: allLeads, totalCount };
  } catch (error) {
    console.error("Error in alternative XHR fetch:", error);
    throw error;
  }
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Indiamart Lead Fetcher extension installed");
});
