// frontend/src/services/reviews.js
// ============================================
// REVIEWS API SERVICE
// ============================================

import { getApiUrl } from '../utils/apiBase';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ============================================
// PUBLIC: get approved reviews (with optional filters)
// filters: { rating, oasis, package, media }
// ============================================
export async function getPublicReviews(filters = {}) {
  const params = new URLSearchParams();
  if (filters.rating) params.set('rating', filters.rating);
  if (filters.oasis)  params.set('oasis', filters.oasis);
  if (filters.package) params.set('package', filters.package);
  if (filters.media)  params.set('media', 'true');

  const url = getApiUrl(`/api/reviews${params.toString() ? `?${params}` : ''}`);
  const res = await fetch(url);
  return res.json();
}

// ============================================
// CUSTOMER: submit a review (multipart/form-data)
// data: { bookingId, rating, text, isAnonymous, photos (File[]), video (File) }
// ============================================
export async function submitReview(data) {
  const form = new FormData();
  form.append('bookingId', data.bookingId);
  form.append('rating', data.rating);
  form.append('text', data.text);
  form.append('isAnonymous', data.isAnonymous ? 'true' : 'false');

  if (data.photos && data.photos.length > 0) {
    data.photos.forEach((file) => form.append('photos', file));
  }
  if (data.video) {
    form.append('video', data.video);
  }

  const res = await fetch(getApiUrl('/api/reviews'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: form,
  });
  return res.json();
}

// ============================================
// CUSTOMER: check if a booking has already been reviewed
// ============================================
export async function checkReviewed(bookingId) {
  const res = await fetch(getApiUrl(`/api/reviews/check/${bookingId}`), {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ============================================
// ADMIN: get all reviews
// ============================================
export async function getAllReviewsAdmin() {
  const res = await fetch(getApiUrl('/api/reviews/admin'), {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ============================================
// ADMIN: approve or hide a review
// ============================================
export async function updateReviewStatus(id, status) {
  const res = await fetch(getApiUrl(`/api/reviews/${id}/status`), {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// ============================================
// ADMIN: delete a review
// ============================================
export async function deleteReview(id) {
  const res = await fetch(getApiUrl(`/api/reviews/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}