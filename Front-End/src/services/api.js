import axios from 'axios';

// Same Flask backend the legacy HTML/JS frontend talked to. Do not change.
// Configurable via VITE_API_URL for different deploy targets (staging,
// self-hosted, etc.) — falls back to the known-good production URL.
export const API_URL = import.meta.env.VITE_API_URL || 'https://thinkeasy-react.onrender.com/api';

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true, // session cookies for /login, /me, /logout, admin auth
  headers: { 'Content-Type': 'application/json' },
});

// Retries GET requests up to twice on network failure or a 502/503/504,
// with a short backoff — handles transient blips (cold starts on free
// hosting tiers, brief network drops) without the caller needing to know.
// Never retries non-GET requests, since those can have side effects.
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_RETRIES = 2;
client.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const isGet = (config?.method || 'get').toLowerCase() === 'get';
  const isRetryable = !error.response || RETRYABLE_STATUS.has(error.response.status);
  if (!config || !isGet || !isRetryable) return Promise.reject(error);

  config.__retryCount = config.__retryCount || 0;
  if (config.__retryCount >= MAX_RETRIES) return Promise.reject(error);
  config.__retryCount += 1;

  await new Promise((resolve) => setTimeout(resolve, 400 * config.__retryCount));
  return client(config);
});

// Normalizes the various response shapes the Flask API returns
// (plain array, {businesses:[...]}, {data:[...]}, etc.) into a plain array.
function toArray(data, ...keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  const firstArray = Object.values(data || {}).find((v) => Array.isArray(v));
  return firstArray || [];
}

/* ── Public read endpoints ─────────────────────────────────────────── */
export async function getCategories() {
  const { data } = await client.get('/public/categories');
  return toArray(data, 'categories', 'data');
}

export async function getBusinesses() {
  const { data } = await client.get('/public/businesses');
  return toArray(data, 'businesses', 'data');
}

export async function getBusiness(id) {
  const { data } = await client.get(`/business/${id}`);
  return data;
}

export async function getProducts() {
  const { data } = await client.get('/public/products');
  return toArray(data, 'products', 'data');
}

export async function getProduct(id) {
  const { data } = await client.get(`/product/${id}`);
  return data;
}

export async function getProductsByBusiness(businessId) {
  const { data } = await client.get(`/products/by-business/${businessId}`);
  return toArray(data, 'products', 'data');
}

export async function search(q) {
  const { data } = await client.get('/search', { params: { q } });
  return { businesses: data.businesses || [], products: data.products || [] };
}

/* ── Auth (customer) ───────────────────────────────────────────────── */
export async function login(email, password) {
  const { data } = await client.post('/login', { email, password });
  return data;
}

export async function signup(name, email, password, confirmPassword) {
  const { data } = await client.post('/signup', {
    name, email, password, confirm_password: confirmPassword,
  });
  return data;
}

export async function logout() {
  const { data } = await client.post('/logout');
  return data;
}

export async function getMe() {
  const { data } = await client.get('/me');
  return data;
}

/* ── Feedback ───────────────────────────────────────────────────────── */
export async function getFeedbackMeta() {
  const { data } = await client.get('/feedback/meta');
  return data;
}

export async function getFeedbackItem(id) {
  const { data } = await client.get(`/feedback/${id}`);
  return data;
}

export async function submitFeedback(payload) {
  const { data } = await client.post('/feedback', payload);
  return data;
}

export async function getTrendingFeedback(sort = 'popular', limit = 12) {
  const { data } = await client.get('/feedback/trending', { params: { sort, limit } });
  return data;
}

export async function getFeedbackVotes(voterToken) {
  const { data } = await client.get('/feedback/votes', { params: { voter_token: voterToken } });
  return data;
}

export async function voteFeedback(feedbackId, voterToken, action) {
  const { data } = await client.post('/feedback/vote', {
    feedback_id: feedbackId, voter_token: voterToken, action,
  });
  return data;
}

export default client;

/* ══════════════════════════════════════════════════════════════════
   ADMIN — completely separate session/auth from the customer endpoints
   above (session["admin_id"] vs session["user_id"] server-side). Same
   axios client works because both ride the same withCredentials cookie;
   Flask just keys off a different session field.
   ══════════════════════════════════════════════════════════════════ */

export async function adminLogin(username, password) {
  const { data } = await client.post('/admin/login', { username, password });
  return data;
}

export async function adminLogout() {
  const { data } = await client.post('/admin/logout');
  return data;
}

export async function adminSession() {
  const { data } = await client.get('/admin/session');
  return data;
}

// Admin list endpoints return ALL rows (including hidden) — distinct
// from the /public/* endpoints the customer-facing pages use.
export async function adminGetCategories() {
  const { data } = await client.get('/categories');
  return data;
}
export async function adminGetBusinesses() {
  const { data } = await client.get('/businesses');
  return data;
}
export async function adminGetProducts() {
  const { data } = await client.get('/products');
  return data;
}

export async function adminGetCategory(id) {
  const { data } = await client.get(`/category/${id}`);
  return data;
}
export async function adminAddCategory(payload) {
  const { data } = await client.post('/category', payload);
  return data;
}
export async function adminUpdateCategory(id, payload) {
  const { data } = await client.put(`/category/${id}`, payload);
  return data;
}
export async function adminHideCategory(id) {
  const { data } = await client.post(`/category/${id}/hide`);
  return data;
}
export async function adminUnhideCategory(id) {
  const { data } = await client.post(`/category/${id}/unhide`);
  return data;
}
export async function adminDeleteCategory(id) {
  const { data } = await client.delete(`/category/${id}`);
  return data;
}

export async function adminFeedbackStats() {
  const { data } = await client.get('/feedback/stats');
  return data;
}
export async function adminActivityLogs() {
  const { data } = await client.get('/activity-logs');
  return data;
}
// Admin: full feedback listing with search/filter/sort (login_required —
// distinct from the public /feedback/trending used by FeedbackCenter.jsx).
export async function adminListFeedback(params = {}) {
  const { data } = await client.get('/feedback', { params });
  return data;
}
export async function adminUpdateFeedbackStatus(id, status, adminResponse) {
  const { data } = await client.put(`/feedback/${id}/status`, { status, admin_response: adminResponse || undefined });
  return data;
}
export async function adminPinFeedback(id, pinned) {
  const { data } = await client.post(`/feedback/${id}/pin`, { pinned });
  return data;
}
export async function adminDeleteFeedback(id) {
  const { data } = await client.delete(`/feedback/${id}`);
  return data;
}
export async function adminBulkDeleteFeedback(ids) {
  const { data } = await client.post('/feedback/bulk', { ids, action: 'delete' });
  return data;
}

/* ── Admin: Businesses ─────────────────────────────────────────────── */
export async function adminGetBusiness(id) {
  const { data } = await client.get(`/business/${id}`);
  return data;
}
export async function adminAddBusiness(payload) {
  const { data } = await client.post('/business', payload);
  return data;
}
export async function adminUpdateBusiness(id, payload) {
  const { data } = await client.put(`/business/${id}`, payload);
  return data;
}
export async function adminHideBusiness(id) {
  const { data } = await client.post(`/business/${id}/hide`);
  return data;
}
export async function adminUnhideBusiness(id) {
  const { data } = await client.post(`/business/${id}/unhide`);
  return data;
}
export async function adminDeleteBusiness(id) {
  const { data } = await client.delete(`/business/${id}`);
  return data;
}

// Sources & government schemes are separate row-based sub-resources tied
// to a business_id, not part of the business JSON payload.
export async function getBusinessSources(businessId) {
  const { data } = await client.get(`/business/${businessId}/sources`);
  return data;
}
export async function addBusinessSource(businessId, payload) {
  const { data } = await client.post(`/business/${businessId}/sources`, payload);
  return data;
}
export async function updateBusinessSource(businessId, sourceId, payload) {
  const { data } = await client.put(`/business/${businessId}/sources/${sourceId}`, payload);
  return data;
}
export async function deleteBusinessSource(businessId, sourceId) {
  const { data } = await client.delete(`/business/${businessId}/sources/${sourceId}`);
  return data;
}

export async function getGovernmentSchemes(businessId) {
  const { data } = await client.get(`/business/${businessId}/schemes`);
  return data;
}
export async function addGovernmentScheme(businessId, payload) {
  const { data } = await client.post(`/business/${businessId}/schemes`, payload);
  return data;
}
export async function updateGovernmentScheme(businessId, schemeId, payload) {
  const { data } = await client.put(`/business/${businessId}/schemes/${schemeId}`, payload);
  return data;
}
export async function deleteGovernmentScheme(businessId, schemeId) {
  const { data } = await client.delete(`/business/${businessId}/schemes/${schemeId}`);
  return data;
}

/* ── Admin: Products ────────────────────────────────────────────────── */
export async function adminGetProduct(id) {
  const { data } = await client.get(`/product/${id}`);
  return data;
}
export async function adminAddProduct(payload) {
  const { data } = await client.post('/product', payload);
  return data;
}
export async function adminUpdateProduct(id, payload) {
  const { data } = await client.put(`/product/${id}`, payload);
  return data;
}
export async function adminHideProduct(id) {
  const { data } = await client.post(`/product/${id}/hide`);
  return data;
}
export async function adminUnhideProduct(id) {
  const { data } = await client.post(`/product/${id}/unhide`);
  return data;
}
export async function adminDeleteProduct(id) {
  const { data } = await client.delete(`/product/${id}`);
  return data;
}

/* ── Admin: Import Wizard ───────────────────────────────────────────── */
// Template downloads return a binary .xlsx — fetched as a blob so the
// browser can save it, not parsed as JSON.
export async function downloadImportTemplate(entity) {
  const res = await client.get(`/import/${entity}/template`, { responseType: 'blob' });
  return res.data;
}
export async function previewImport(entity, file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await client.post(`/import/${entity}/preview`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}
export async function commitImport(entity, file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await client.post(`/import/${entity}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}
