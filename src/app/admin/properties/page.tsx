'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Star,
  MapPin,
  IndianRupee,
  CheckCircle,
  XCircle,
  Loader2,
  ImageIcon,
  Video,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PropertyMedia {
  id: string;
  propertyId: string;
  url: string;
  type: string;
  caption: string | null;
  isCover: boolean;
  sortOrder: number;
  createdAt: string;
}

interface Property {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  pricePerNight: number;
  taxPercent: number;
  discountPercent: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  isActive: boolean;
  amenities: string;
  checkInTime: string;
  checkOutTime: string;
  createdAt: string;
  updatedAt: string;
  media: PropertyMedia[];
}

type ActiveTab = 'details' | 'pricing' | 'media';

const DEFAULT_FORM = {
  name: '',
  description: '',
  address: '',
  googleMapsUrl: '',
  pricePerNight: 5000,
  taxPercent: 18,
  discountPercent: 0,
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  sqft: '',
  isActive: true,
  amenities: '[]',
  checkInTime: '12:00',
  checkOutTime: '11:00',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCoverPhoto(media: PropertyMedia[]): PropertyMedia | undefined {
  return media.find((m) => m.isCover && m.type === 'PHOTO') ?? media.find((m) => m.type === 'PHOTO');
}

function effectiveRate(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState<typeof DEFAULT_FORM>({ ...DEFAULT_FORM });

  // Media state (for the currently-open modal)
  const [modalMedia, setModalMedia] = useState<PropertyMedia[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : '');

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/properties', {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load properties');
      setProperties(data.properties);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Open Modal ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingProperty(null);
    setForm({ ...DEFAULT_FORM });
    setModalMedia([]);
    setActiveTab('details');
    setShowModal(true);
  };

  const openEdit = (p: Property) => {
    setEditingProperty(p);
    setForm({
      name: p.name,
      description: p.description || '',
      address: p.address || '',
      googleMapsUrl: p.googleMapsUrl || '',
      pricePerNight: p.pricePerNight,
      taxPercent: p.taxPercent,
      discountPercent: p.discountPercent,
      maxGuests: p.maxGuests,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqft: p.sqft != null ? String(p.sqft) : '',
      isActive: p.isActive,
      amenities: p.amenities,
      checkInTime: p.checkInTime,
      checkOutTime: p.checkOutTime,
    });
    setModalMedia([...p.media]);
    setActiveTab('details');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProperty(null);
    setError('');
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Property name is required');
      setActiveTab('details');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        pricePerNight: Number(form.pricePerNight),
        taxPercent: Number(form.taxPercent),
        discountPercent: Number(form.discountPercent),
        maxGuests: Number(form.maxGuests),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        sqft: form.sqft !== '' ? Number(form.sqft) : null,
      };

      const url = '/api/admin/properties';
      const method = editingProperty ? 'PUT' : 'POST';
      const body = editingProperty ? { id: editingProperty.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      await fetchProperties();
      closeModal();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/properties?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── Media Upload ──────────────────────────────────────────────────────────

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!editingProperty) {
      setError('Save the property first before uploading media.');
      return;
    }

    setUploadingMedia(true);
    setError('');

    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('docType', 'property');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token()}` },
          body: fd,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

        const mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'PHOTO';
        const isFirstPhoto = modalMedia.filter((m) => m.type === 'PHOTO').length === 0 && mediaType === 'PHOTO';

        const saveRes = await fetch('/api/admin/properties/media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({
            propertyId: editingProperty.id,
            url: uploadData.url,
            type: mediaType,
            isCover: isFirstPhoto,
            sortOrder: modalMedia.length,
          }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.error || 'Failed to save media');

        setModalMedia((prev) => [...prev, saveData.media]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Upload error');
      }
    }

    setUploadingMedia(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetCover = async (mediaId: string) => {
    if (!editingProperty) return;
    try {
      const res = await fetch('/api/admin/properties/media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ id: mediaId, propertyId: editingProperty.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set cover');
      setModalMedia((prev) =>
        prev.map((m) => ({ ...m, isCover: m.id === mediaId }))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!editingProperty) return;
    try {
      const res = await fetch('/api/admin/properties/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ id: mediaId, propertyId: editingProperty.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete media');
      setModalMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-stone-900">Properties</h1>
          <p className="text-stone-400 text-xs mt-0.5">Manage listings, media and pricing</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs gap-1.5">
          <Plus size={15} />
          Add Property
        </button>
      </div>

      {/* Error Banner */}
      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-700 text-xs font-semibold">
          <XCircle size={14} />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white border border-stone-200/60 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon size={22} className="text-amber-700" />
          </div>
          <p className="font-bold text-stone-800 text-sm">No properties yet</p>
          <p className="text-stone-400 text-xs mt-1">Click "Add Property" to create your first listing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((p) => {
            const cover = getCoverPhoto(p.media);
            const discounted = effectiveRate(p.pricePerNight, p.discountPercent);
            return (
              <div
                key={p.id}
                className="bg-white border border-stone-200/60 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* Cover Photo */}
                <div className="relative h-40 bg-stone-100">
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt={p.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon size={32} className="text-stone-300" />
                    </div>
                  )}
                  {/* Active badge */}
                  <div className="absolute top-2 right-2">
                    {p.isActive ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold shadow">
                        <CheckCircle size={9} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-stone-500 text-white rounded-full text-[10px] font-bold shadow">
                        <XCircle size={9} /> Inactive
                      </span>
                    )}
                  </div>
                  {/* Media count */}
                  {p.media.length > 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white rounded-full text-[10px] font-semibold">
                      {p.media.length} media
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-stone-900 text-sm leading-tight">{p.name}</h3>

                  {p.address && (
                    <p className="flex items-center gap-1 text-stone-400 text-xs">
                      <MapPin size={11} className="flex-shrink-0" />
                      <span className="truncate">{p.address}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-stone-900 font-black text-sm">
                      <IndianRupee size={12} />
                      {discounted.toLocaleString('en-IN')}
                      <span className="text-stone-400 font-normal text-xs">/night</span>
                    </span>
                    {p.discountPercent > 0 && (
                      <span className="text-[10px] line-through text-stone-400">
                        ₹{p.pricePerNight.toLocaleString('en-IN')}
                      </span>
                    )}
                    {p.discountPercent > 0 && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        {p.discountPercent}% off
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                    <span>{p.bedrooms} bed</span>
                    <span className="text-stone-200">·</span>
                    <span>{p.bathrooms} bath</span>
                    <span className="text-stone-200">·</span>
                    <span>max {p.maxGuests} guests</span>
                    {p.sqft && (
                      <>
                        <span className="text-stone-200">·</span>
                        <span>{p.sqft} sqft</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 btn-secondary text-xs py-1.5"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="flex-1 btn-danger text-xs py-1.5"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-playfair font-bold text-stone-900 text-base">
                {editingProperty ? 'Edit Property' : 'New Property'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-stone-100 px-6">
              {(['details', 'pricing', 'media'] as ActiveTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === t
                      ? 'text-amber-800 border-amber-700'
                      : 'text-stone-400 border-transparent hover:text-stone-700'
                  }`}
                >
                  {t}
                  {t === 'media' && !editingProperty && (
                    <span className="ml-1 text-[9px] text-stone-300">(save first)</span>
                  )}
                </button>
              ))}
            </div>

            {/* Error inside modal */}
            {error && (
              <div className="mx-6 mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2 text-red-700 text-xs font-semibold">
                <XCircle size={13} />
                {error}
              </div>
            )}

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

              {/* ── Details Tab ──────────────────────────────────────────── */}
              {activeTab === 'details' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">
                      Property Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Sweet Nest — Cosy Studio"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Description</label>
                    <textarea
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Describe the property..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Address</label>
                    <input
                      className="input-field"
                      placeholder="123, MG Road, Bangalore"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Google Maps URL</label>
                    <input
                      className="input-field"
                      placeholder="https://maps.google.com/..."
                      value={form.googleMapsUrl}
                      onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 mb-1 block">Check-in Time</label>
                      <input
                        type="time"
                        className="input-field"
                        value={form.checkInTime}
                        onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 mb-1 block">Check-out Time</label>
                      <input
                        type="time"
                        className="input-field"
                        value={form.checkOutTime}
                        onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 mb-1 block">Max Guests</label>
                      <input
                        type="number"
                        min={1}
                        className="input-field"
                        value={form.maxGuests}
                        onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 mb-1 block">Bedrooms</label>
                      <input
                        type="number"
                        min={0}
                        className="input-field"
                        value={form.bedrooms}
                        onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 mb-1 block">Bathrooms</label>
                      <input
                        type="number"
                        min={0}
                        className="input-field"
                        value={form.bathrooms}
                        onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Sqft (optional)</label>
                    <input
                      type="number"
                      min={0}
                      className="input-field"
                      placeholder="e.g. 850"
                      value={form.sqft}
                      onChange={(e) => setForm({ ...form, sqft: e.target.value })}
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between bg-stone-50 rounded-xl p-3">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Active Listing</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Visible to users when active</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        form.isActive ? 'bg-amber-700' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.isActive ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Pricing Tab ───────────────────────────────────────────── */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">
                      Price per Night (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="input-field"
                      value={form.pricePerNight}
                      onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Tax %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      className="input-field"
                      value={form.taxPercent}
                      onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Discount %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      className="input-field"
                      value={form.discountPercent}
                      onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    />
                  </div>

                  {/* Pricing Preview */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5 text-xs">
                    <p className="font-bold text-amber-900 text-sm">Pricing Preview</p>
                    <div className="flex justify-between text-stone-600">
                      <span>Base price</span>
                      <span className="font-semibold">₹{Number(form.pricePerNight).toLocaleString('en-IN')}</span>
                    </div>
                    {Number(form.discountPercent) > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount ({form.discountPercent}%)</span>
                        <span className="font-semibold">
                          − ₹{((Number(form.pricePerNight) * Number(form.discountPercent)) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-stone-900 border-t border-amber-200 pt-1.5">
                      <span>Effective rate</span>
                      <span>
                        ₹{effectiveRate(Number(form.pricePerNight), Number(form.discountPercent)).toLocaleString('en-IN')}/night
                      </span>
                    </div>
                    {Number(form.taxPercent) > 0 && (
                      <div className="flex justify-between text-stone-500">
                        <span>+ GST ({form.taxPercent}%)</span>
                        <span>
                          ₹{((effectiveRate(Number(form.pricePerNight), Number(form.discountPercent)) * Number(form.taxPercent)) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-amber-900 border-t border-amber-200 pt-1.5 text-sm">
                      <span>Guest pays (per night)</span>
                      <span>
                        ₹{(effectiveRate(Number(form.pricePerNight), Number(form.discountPercent)) * (1 + Number(form.taxPercent) / 100)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Media Tab ─────────────────────────────────────────────── */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  {!editingProperty ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-xs text-amber-800 font-semibold">
                      Save the property details first, then come back to upload media.
                    </div>
                  ) : (
                    <>
                      {/* Upload Button */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                          onChange={handleMediaUpload}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingMedia}
                          className="btn-secondary w-full text-xs gap-2"
                        >
                          {uploadingMedia ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Upload size={14} />
                          )}
                          {uploadingMedia ? 'Uploading...' : 'Upload Photos / Videos'}
                        </button>
                        <p className="text-[10px] text-stone-400 text-center mt-1">
                          JPG, PNG, MP4 supported. Max 5 MB per file.
                        </p>
                      </div>

                      {/* Media Grid */}
                      {modalMedia.length === 0 ? (
                        <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center">
                          <ImageIcon size={24} className="text-stone-300 mx-auto mb-2" />
                          <p className="text-xs text-stone-400">No media yet. Upload photos or videos above.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {modalMedia.map((m) => (
                            <div
                              key={m.id}
                              className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                                m.isCover ? 'border-amber-500' : 'border-stone-200'
                              }`}
                            >
                              {m.type === 'VIDEO' ? (
                                <div className="absolute inset-0 bg-stone-800 flex items-center justify-center">
                                  <Video size={20} className="text-white/70" />
                                </div>
                              ) : (
                                <Image
                                  src={m.url}
                                  alt={m.caption || 'Property photo'}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              )}

                              {/* Cover badge */}
                              {m.isCover && (
                                <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-0.5">
                                  <Star size={8} />
                                </div>
                              )}

                              {/* Type badge */}
                              <div className="absolute top-1 right-1 bg-black/50 text-white rounded px-1 py-0.5 text-[8px] font-bold">
                                {m.type}
                              </div>

                              {/* Actions overlay */}
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-end justify-center gap-1 p-1.5 opacity-0 hover:opacity-100">
                                {m.type === 'PHOTO' && !m.isCover && (
                                  <button
                                    onClick={() => handleSetCover(m.id)}
                                    className="p-1 bg-amber-500 text-white rounded-full"
                                    title="Set as cover"
                                  >
                                    <Star size={10} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteMedia(m.id)}
                                  className="p-1 bg-red-500 text-white rounded-full"
                                  title="Delete"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-stone-100">
              <button onClick={closeModal} className="btn-secondary text-xs flex-1">
                Cancel
              </button>
              {activeTab !== 'media' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary text-xs flex-1"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                  {saving ? 'Saving...' : editingProperty ? 'Save Changes' : 'Create Property'}
                </button>
              )}
              {activeTab === 'media' && editingProperty && (
                <button onClick={closeModal} className="btn-primary text-xs flex-1">
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-stone-900 text-base">Delete Property?</h3>
                <p className="text-xs text-stone-500 mt-1">
                  <span className="font-semibold text-stone-800">{deleteTarget.name}</span> and all its media
                  will be permanently deleted. This cannot be undone.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setError(''); }}
                className="btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="btn-danger flex-1 text-xs"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
