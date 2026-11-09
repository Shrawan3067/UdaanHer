const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "/api/v1";

class ApiClient {
  private getToken(): string | null {
    return (
      localStorage.getItem("udaanher_token") ||
      localStorage.getItem("sakhisetu_token")
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if the response is a binary stream or CSV
    const contentType = response.headers.get("content-type");
    if (
      contentType &&
      (contentType.includes("application/pdf") ||
        contentType.includes("text/csv"))
    ) {
      return (await response.blob()) as unknown as T;
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage =
        data.error?.message || response.statusText || "Request failed";
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.code = data.error?.code;
      error.details = data.error?.details;
      throw error;
    }

    return data.data;
  }

  // --- Auth ---
  async login(credentials: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    return this.request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>("/auth/me");
  }

  // --- Schemes ---
  async getSchemes(params?: {
    search?: string;
    category?: string;
    district?: string;
    need?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== "")
          searchParams.append(key, String(val));
      });
    }
    return this.request<{ schemes: any[]; pagination: any }>(
      `/schemes?${searchParams.toString()}`,
    );
  }

  async getSchemeBySlug(slug: string) {
    return this.request<{ scheme: any; relatedSchemes: any[] }>(
      `/schemes/${slug}`,
    );
  }

  async askSchemeQuestion(payload: { question: string; district?: string }) {
    return this.request<{
      query: string;
      detectedDistrict: string;
      detectedNeed: string;
      rulesUsed: string[];
      matches: any[];
      disclaimer: string;
      helplineOffer: string;
    }>('/schemes/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Eligibility ---
  async matchEligibility(answers: any) {
    return this.request<any>("/eligibility/match", {
      method: "POST",
      body: JSON.stringify(answers),
    });
  }

  async requestHelplineCallback(data: {
    name: string;
    phone: string;
    district: string;
    schemeCode?: string;
    notes?: string;
  }) {
    return this.request<any>("/eligibility/request-callback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async requestCallback(data: {
    applicantName: string;
    phoneNumber: string;
    preferredTime?: string;
    district: string;
    villagePanchayat?: string;
    notes?: string;
  }) {
    return this.requestHelplineCallback({
      name: data.applicantName,
      phone: data.phoneNumber,
      district: data.district,
      notes:
        `${data.villagePanchayat ? `Village: ${data.villagePanchayat}. ` : ""}${data.notes || ""}`.trim(),
    });
  }

  // --- Campaigns ---
  async getPublicCampaigns() {
    return this.request<any[]>("/campaigns");
  }

  async getCampaignBySlug(slug: string) {
    return this.request<any>(`/campaigns/${slug}`);
  }

  // --- Donations & Mock Payments ---
  async createDonation(data: any) {
    return this.request<any>("/donations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async processMockPayment(data: {
    donationId: string;
    method: "UPI" | "CARD" | "NET_BANKING";
    outcome: "SUCCESS" | "FAILED" | "PENDING";
    isForeignCard?: boolean;
  }) {
    return this.request<any>("/payments/mock/process", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDonationById(id: string) {
    return this.request<any>(`/donations/${id}`);
  }

  async getMyDonations() {
    return this.request<any[]>("/donations/me");
  }

  // --- Receipts ---
  async getReceiptById(id: string) {
    return this.request<any>(`/receipts/${id}`);
  }

  getReceiptDownloadUrl(id: string): string {
    return `${API_BASE_URL}/receipts/${id}/download`;
  }

  async downloadReceiptPdfBlob(receiptId: string): Promise<Blob> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/receipts/${receiptId}/download`, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to download receipt PDF");
    return res.blob();
  }

  // --- Admin Endpoints ---
  async getAdminDashboard() {
    return this.request<any>("/admin/dashboard");
  }

  async getAdminDonations(params?: {
    search?: string;
    status?: string;
    campaignId?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== "")
          searchParams.append(key, String(val));
      });
    }
    return this.request<{ donations: any[]; pagination: any }>(
      `/admin/donations?${searchParams.toString()}`,
    );
  }

  async getAdminCampaigns() {
    return this.request<any[]>("/admin/campaigns");
  }

  async createAdminCampaign(data: any) {
    return this.request<any>("/admin/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAdminCampaign(id: string, data: any) {
    return this.request<any>(`/admin/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getAdminScheme(id: string) {
    return this.request<any>(`/admin/schemes/${id}`);
  }

  async createAdminScheme(data: any) {
    return this.request<any>("/admin/schemes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAdminScheme(id: string, data: any) {
    return this.request<any>(`/admin/schemes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async publishAdminScheme(id: string) {
    return this.request<any>(`/admin/schemes/${id}/publish`, {
      method: "POST",
    });
  }

  async archiveAdminScheme(id: string) {
    return this.request<any>(`/admin/schemes/${id}/archive`, {
      method: "POST",
    });
  }

  async deleteAdminScheme(id: string) {
    return this.request<any>(`/admin/schemes/${id}`, { method: "DELETE" });
  }

  // --- Admin AI Review ---
  async generateAISchemeSummary(schemeId: string, data?: { officialNoticeText?: string }) {
    return this.request<any>(`/admin/ai/scheme-summary/${schemeId}`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    });
  }

  async generateAISummary(schemeId: string, data?: { officialNoticeText?: string }) {
    return this.generateAISchemeSummary(schemeId, data);
  }

  async listAIReviews(status?: string) {
    const url = status
      ? `/admin/ai/reviews?status=${status}`
      : "/admin/ai/reviews";
    return this.request<any[]>(url);
  }

  async updateAIReviewDraft(
    id: string,
    data: { generatedHindiSummary?: string; generatedEnglishSummary?: string },
  ) {
    return this.request<any>(`/admin/ai/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async approveAIReview(id: string) {
    return this.request<any>(`/admin/ai/reviews/${id}/approve`, {
      method: "POST",
    });
  }

  async rejectAIReview(id: string) {
    return this.request<any>(`/admin/ai/reviews/${id}/reject`, {
      method: "POST",
    });
  }

  // --- Admin Reports ---
  async getCampaignsReport() {
    return this.request<any[]>("/admin/reports/campaigns");
  }

  async getForm10BDReport(financialYear?: string) {
    const url = financialYear
      ? `/admin/reports/form-10bd?financialYear=${financialYear}`
      : "/admin/reports/form-10bd";
    return this.request<any[]>(url);
  }

  getForm10BDCsvUrl(financialYear?: string): string {
    const url = financialYear
      ? `${API_BASE_URL}/admin/reports/form-10bd?format=csv&financialYear=${financialYear}`
      : `${API_BASE_URL}/admin/reports/form-10bd?format=csv`;
    return url;
  }

  // --- Automation & Reminders ---
  async getAutomationStatus() {
    return this.request<{ success: boolean; data: any }>("/admin/automation/status");
  }

  async triggerAutomation() {
    return this.request<{ success: boolean; message: string; data: any }>("/admin/automation/trigger", {
      method: "POST",
    });
  }

  async triggerAutomationSuite() {
    return this.triggerAutomation();
  }
}

export const api = new ApiClient();
