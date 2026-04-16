const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const OTP_REQUEST_TIMEOUT_MS = 20000;

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || "Request failed";
    const detail = data?.error ? `: ${data.error}` : "";
    throw new Error(`${message}${detail}`);
  }

  return data;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Unable to reach server. Please check API URL, CORS settings, and network connectivity.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestSignupOtp(payload) {
  const response = await fetchWithTimeout(`${API_BASE}/auth/signup/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, OTP_REQUEST_TIMEOUT_MS);

  return parseResponse(response);
}

export async function verifySignupOtp(payload) {
  const response = await fetch(`${API_BASE}/auth/signup/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function requestForgotPasswordOtp(payload) {
  const response = await fetchWithTimeout(
    `${API_BASE}/auth/forgot-password/request-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    OTP_REQUEST_TIMEOUT_MS
  );

  return parseResponse(response);
}

export async function resetForgotPassword(payload) {
  const response = await fetchWithTimeout(
    `${API_BASE}/auth/forgot-password/reset`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    OTP_REQUEST_TIMEOUT_MS
  );

  return parseResponse(response);
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function getMe(token) {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function getPendingAdminRequests(token) {
  const response = await fetch(`${API_BASE}/auth/admin-requests`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function approveAdminRequest(userId, token) {
  const response = await fetch(`${API_BASE}/auth/admin-requests/${userId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function getAdminUsers(token) {
  const response = await fetch(`${API_BASE}/admin/users`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function updateAdminUserStatus(userId, status, token) {
  const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  });

  return parseResponse(response);
}

export async function deleteAndBlockUser(userId, token) {
  const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function getPendingAuctionListings(token) {
  const response = await fetch(`${API_BASE}/admin/auctions/pending`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function approveAuctionListing(auctionId, token) {
  const response = await fetch(`${API_BASE}/admin/auctions/${auctionId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function rejectAuctionListing(auctionId, token) {
  const response = await fetch(`${API_BASE}/admin/auctions/${auctionId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function getApprovedAuctions() {
  const response = await fetch(`${API_BASE}/auctions/approved`, {
    headers: { "Content-Type": "application/json" },
  });

  return parseResponse(response);
}

export async function getMyAuctionListings(token) {
  const response = await fetch(`${API_BASE}/auctions/mine`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function getMyBidAuctions(token) {
  const response = await fetch(`${API_BASE}/auctions/my-bids`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function createAuctionListing(payload, token) {
  const response = await fetch(`${API_BASE}/auctions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function getMyNotifications(token) {
  const response = await fetch(`${API_BASE}/notifications/me`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function createEscrowOrder(auctionId, token) {
  const response = await fetch(`${API_BASE}/payments/create-escrow-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ auctionId }),
  });

  return parseResponse(response);
}

export async function confirmEscrowPayment(payload, token) {
  const response = await fetch(`${API_BASE}/payments/confirm-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function requestEscrowRelease(transactionId, token) {
  const response = await fetch(`${API_BASE}/payments/${transactionId}/request-release`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function releaseEscrowFunds(transactionId, token) {
  const response = await fetch(`${API_BASE}/payments/${transactionId}/release`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}

export async function raiseEscrowDispute(transactionId, reason, token) {
  const response = await fetch(`${API_BASE}/payments/${transactionId}/dispute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ reason }),
  });

  return parseResponse(response);
}

export async function getMyEscrowTransactions(token) {
  const response = await fetch(`${API_BASE}/payments/me`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  return parseResponse(response);
}
