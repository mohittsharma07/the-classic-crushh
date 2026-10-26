import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData, type GalleryRecord } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
} from "lucide-react";
export const AdminGalleryPage: React.FC = () => {
  const {
    galleryItems,
    uploadGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    toggleGalleryVisibility,
  } = useData();

  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryRecord | null>(null);

  // Form state
  const [formUrl, setFormUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formCaption, setFormCaption] = useState("");
  const [formCategory, setFormCategory] = useState("Table Moments");
  const [formAspect, setFormAspect] = useState<"landscape" | "portrait">(
    "landscape",
  );

  const categoryOptions = [
    "Table Moments",
    "Signature Desserts",
    "Hot From Oven",
    "Beverages",
    "Daily Counter",
    "Cafe Interior",
    "Street Comforts",
    "Behind the Scenes",
  ];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormUrl("/dark-white-delight.jpg");
    setSelectedFile(null);
    setFormCaption("");
    setFormCategory("Table Moments");
    setFormAspect("landscape");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryRecord) => {
    setEditingItem(item);
    setFormUrl(item.url);
    setSelectedFile(null);
    setFormCaption(item.caption);
    setFormCategory(item.category);
    setFormAspect(item.aspect);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCaption.trim()) {
      showToast("Please enter a photo caption.");
      return;
    }

    if (!editingItem && !selectedFile) {
      showToast("Please select a photo to upload.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingItem) {
        const updatedItem: GalleryRecord = {
          ...editingItem,
          caption: formCaption.trim(),
          category: formCategory,
          aspect: formAspect,
        };

        if (selectedFile) {
          await deleteGalleryItem(editingItem.id);

          await uploadGalleryItem(selectedFile, {
            caption: formCaption.trim(),
            category: formCategory,
            aspect: formAspect,
            isVisible: editingItem.isVisible,
          });
        } else {
          await updateGalleryItem(updatedItem);
        }

        showToast("Gallery photo updated successfully.");
      } else {
        await uploadGalleryItem(selectedFile!, {
          caption: formCaption.trim(),
          category: formCategory,
          aspect: formAspect,
          isVisible: true,
        });

        showToast("Photo uploaded successfully!");
      }

      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Gallery save failed:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Could not save gallery photo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteGalleryItem(itemToDelete.id);
    showToast("Photo removed from gallery.");
    setItemToDelete(null);
  };

  return (
    <AdminLayout
      pageTitle="Gallery Management"
      pageSubtitle="Upload, caption, and curate photographs shown on the customer /gallery page."
      actions={
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#26332A] hover:bg-[#1C241E] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Photo</span>
        </button>
      }
    >
      {/* Photo Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 shadow-2xs flex flex-col justify-between ${
              item.isVisible
                ? "border-[#E5DFD5]"
                : "border-stone-300 opacity-60 bg-stone-50"
            }`}
          >
            {/* Image Thumbnail */}
            <div>
              <div className="relative aspect-4/3 w-full bg-[#EFE9DE] overflow-hidden">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/dark-white-delight.jpg";
                  }}
                />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#755546] shadow-2xs">
                  {item.category}
                </div>

                {/* Visibility Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs ${
                      item.isVisible
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-800 text-white"
                    }`}
                  >
                    {item.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* Caption & Details */}
              <div className="p-4">
                <h4 className="font-serif font-bold text-base text-[#1C241E] line-clamp-1">
                  {item.caption}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#767E7A]">
                  <span>Category: {item.category}</span>
                  <span>•</span>
                  <span>{item.aspect}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 border-t border-[#EFE9DE] flex items-center justify-between bg-[#FAF7F2]/60">
              <button
                onClick={() => {
                  toggleGalleryVisibility(item.id);
                  showToast(
                    item.isVisible
                      ? "Photo hidden from customer gallery."
                      : "Photo now visible on customer gallery!",
                  );
                }}
                className={`inline-flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                  item.isVisible
                    ? "text-stone-600 hover:text-black"
                    : "text-emerald-700 font-bold"
                }`}
              >
                {item.isVisible ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Make Visible</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-[#575E5B] hover:text-[#1C241E] hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Edit details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setItemToDelete(item)}
                  className="p-1.5 text-[#9CA3AF] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5DFD5] p-6 my-8 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DE]">
              <h3 className="font-serif text-2xl font-bold text-[#1C241E]">
                {editingItem ? "Edit Photo" : "Upload / Add Photo"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#767E7A] hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs">
              {/* Image Upload */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Choose Photo *
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  required={!editingItem && !selectedFile}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;

                    if (file && file.size > 8 * 1024 * 1024) {
                      showToast("Image must be smaller than 8 MB.");
                      e.target.value = "";
                      setSelectedFile(null);
                      return;
                    }

                    setSelectedFile(file);
                  }}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs"
                />

                <p className="mt-1 text-[11px] text-[#767E7A]">
                  JPG, PNG, WebP or AVIF · Maximum 8 MB
                </p>

                {(selectedFile || formUrl) && (
                  <div className="mt-2 relative aspect-16/10 rounded-xl overflow-hidden bg-[#EFE9DE] border border-[#E5DFD5]">
                    <img
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : formUrl
                      }
                      alt="Photo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Caption / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freshly baked golden puffs with green chutney"
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                />
              </div>

              {/* Category & Aspect */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={formAspect}
                    onChange={(e) =>
                      setFormAspect(e.target.value as "landscape" | "portrait")
                    }
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EFE9DE]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D5C7B5] rounded-xl text-xs font-semibold text-[#575E5B] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#26332A] text-white rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Uploading..." : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#E5DFD5] p-6 text-center animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C241E]">
              Delete this photo?
            </h3>
            <p className="text-xs text-[#767E7A] mt-1 font-light leading-relaxed">
              &ldquo;{itemToDelete.caption}&rdquo; will be permanently deleted
              from the gallery.
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-[#D5C7B5] rounded-xl text-xs font-semibold text-[#575E5B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
