import React, { useState, useMemo } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { VegBadge } from "../../components/VegBadge";
import {
  type MenuItem,
  type MenuCategory,
  type MenuCategoryId,
} from "../../data/menuData";
import {
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  X,
  Star,
  Sparkles,
  AlertTriangle,
  Layers,
} from "lucide-react";

export const AdminMenuPage: React.FC = () => {
  const {
    menuItems,
    categories,
    uploadMenuItemImage,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    duplicateMenuItem,
    toggleItemAvailability,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleFeaturedItem,
    featuredItemIds,
  } = useData();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Item Modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Item Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] =
    useState<MenuCategoryId>("signature-desserts");
  const [formPrice, setFormPrice] = useState<number>(59);
  const [formPriceDisplay, setFormPriceDisplay] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsBestseller, setFormIsBestseller] = useState(false);
  const [formPrepNote, setFormPrepNote] = useState("");

  // Delete Item Confirmation Modal state
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Category Modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [catLabel, setCatLabel] = useState("");
  const [catDescription, setCatDescription] = useState("");

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Open Add Item Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory(categories[1]?.id || "signature-desserts");
    setFormPrice(59);
    setFormPriceDisplay("");
    setFormDescription("");
    setFormImage("/dark-white-delight.jpg");
    setFormIsAvailable(true);
    setFormIsFeatured(false);
    setFormIsBestseller(false);
    setFormPrepNote("");
    setIsItemModalOpen(true);
  };

  // Open Edit Item Modal
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormPriceDisplay(item.priceDisplay || "");
    setFormDescription(item.description);
    setFormImage(item.image);
    setFormIsAvailable(item.isAvailable !== false);
    setFormIsFeatured(featuredItemIds.includes(item.id));
    setFormIsBestseller(item.isBestseller || false);
    setFormPrepNote(item.prepNote || "");
    setIsItemModalOpen(true);
  };

  // Save Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) return;

    if (formImageFile && isUploadingImage) return;

    setIsUploadingImage(true);

    try {
      // Step 1: Upload the selected image first
      const finalImage = formImageFile
        ? await uploadMenuItemImage(formImageFile)
        : formImage.trim() || "/dark-white-delight.jpg";

      // Step 2: Save the item with the permanent image URL
      if (editingItem) {
        const updated: MenuItem = {
          ...editingItem,
          name: formName.trim(),
          category: formCategory,
          price: Number(formPrice),
          priceDisplay: formPriceDisplay.trim() || undefined,
          description: formDescription.trim(),
          image: finalImage,
          isAvailable: formIsAvailable,
          isBestseller: formIsBestseller,
          prepNote: formPrepNote.trim() || undefined,
        };

        await updateMenuItem(updated);

        if (formIsFeatured !== featuredItemIds.includes(editingItem.id)) {
          toggleFeaturedItem(editingItem.id);
        }

        showToast(`"${updated.name}" updated successfully.`);
      } else {
        await addMenuItem({
          name: formName.trim(),
          category: formCategory,
          price: Number(formPrice),
          priceDisplay: formPriceDisplay.trim() || undefined,
          description: formDescription.trim(),
          image: finalImage,
          isVegetarian: true,
          isAvailable: formIsAvailable,
          isBestseller: formIsBestseller,
          prepNote: formPrepNote.trim() || undefined,
        });

        showToast(`"${formName.trim()}" added to menu.`);
      }

      setIsItemModalOpen(false);
      setFormImageFile(null);
    } catch (error) {
      console.error("Menu item save error:", error);

      showToast(
        error instanceof Error
          ? error.message
          : "Menu item save nahi hua. Please try again.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteMenuItem(itemToDelete.id);
    showToast(`"${itemToDelete.name}" deleted.`);
    setItemToDelete(null);
  };

  // Category Save
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catLabel.trim()) return;

    if (editingCat) {
      updateCategory({
        ...editingCat,
        label: catLabel.trim(),
        shortLabel: catLabel.trim(),
        description: catDescription.trim() || "",
      });
      showToast(`Category "${catLabel}" updated.`);
    } else {
      const newId = catLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") as MenuCategoryId;
      addCategory({
        id: newId,
        label: catLabel.trim(),
        shortLabel: catLabel.trim(),
        description: catDescription.trim() || "",
      });
      showToast(`Category "${catLabel}" added.`);
    }
    setIsCatModalOpen(false);
  };

  const handleDeleteCategory = (catId: string) => {
    const res = deleteCategory(catId);
    if (res.success) {
      showToast("Category deleted successfully.");
    } else {
      alert(res.message);
    }
  };

  return (
    <AdminLayout
      pageTitle="Menu Management"
      pageSubtitle="Manage all dishes, prices, and categories visible to customers."
      actions={
        activeTab === "items" ? (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#26332A] hover:bg-[#1C241E] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingCat(null);
              setCatLabel("");
              setCatDescription("");
              setIsCatModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#26332A] hover:bg-[#1C241E] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )
      }
    >
      {/* Sub Tabs: All Items / Categories */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#E5DFD5] pb-3">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "items"
              ? "bg-[#26332A] text-white shadow-2xs"
              : "bg-white text-[#575E5B] hover:bg-[#EFE9DE] border border-[#E5DFD5]"
          }`}
        >
          <span>All Items ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "categories"
              ? "bg-[#26332A] text-white shadow-2xs"
              : "bg-white text-[#575E5B] hover:bg-[#EFE9DE] border border-[#E5DFD5]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>
            Categories ({categories.filter((c) => c.id !== "all").length})
          </span>
        </button>
      </div>

      {activeTab === "items" ? (
        <>
          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search dish by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#767E7A] hover:text-black cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#755546] font-medium whitespace-nowrap">
                Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              >
                <option value="all">All Categories ({menuItems.length})</option>
                {categories
                  .filter((c) => c.id !== "all")
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} (
                      {menuItems.filter((i) => i.category === cat.id).length})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Menu Items Table */}
          <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#755546] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EFE9DE]">
                  <tr>
                    <th className="py-3.5 px-4">Image</th>
                    <th className="py-3.5 px-4">Item Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4 text-center">Featured ⭐</th>
                    <th className="py-3.5 px-4 text-center">Availability</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DE]">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-[#767E7A] font-light"
                      >
                        No dishes found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isAvail = item.isAvailable !== false;
                      const isFeat = featuredItemIds.includes(item.id);
                      const catName =
                        categories.find((c) => c.id === item.category)?.label ||
                        item.category;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#FAF7F2]/60 transition-colors group"
                        >
                          {/* Image Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#EFE9DE] border border-[#E5DFD5] relative shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover object-center"
                                loading="lazy"
                              />
                              <div className="absolute top-0.5 left-0.5 bg-white/90 p-0.5 rounded">
                                <VegBadge size="sm" />
                              </div>
                            </div>
                          </td>

                          {/* Item Name & Details */}
                          <td className="py-3 px-4">
                            <div className="font-serif font-bold text-sm text-[#1C241E] flex items-center gap-2">
                              <span>{item.name}</span>
                              {item.isBestseller && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#575E5B] line-clamp-1 font-light max-w-xs mt-0.5">
                              {item.description}
                            </p>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-[#755546] font-medium whitespace-nowrap">
                            {catName}
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 font-serif font-bold text-sm text-[#1C241E] whitespace-nowrap">
                            {item.priceDisplay || `₹${item.price}`}
                          </td>

                          {/* Featured toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                toggleFeaturedItem(item.id);
                                showToast(
                                  isFeat
                                    ? `Removed "${item.name}" from Homepage Featured.`
                                    : `Added "${item.name}" to Homepage Featured!`,
                                );
                              }}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isFeat
                                  ? "bg-amber-50 text-amber-600 border-amber-300"
                                  : "text-[#9CA3AF] border-transparent hover:text-amber-500 hover:bg-amber-50"
                              }`}
                              title={
                                isFeat
                                  ? "Featured on Homepage"
                                  : "Click to feature on homepage"
                              }
                            >
                              <Star
                                className={`w-4 h-4 ${isFeat ? "fill-amber-500" : ""}`}
                              />
                            </button>
                          </td>

                          {/* Availability Toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                toggleItemAvailability(item.id);
                                showToast(
                                  isAvail
                                    ? `"${item.name}" marked as Unavailable (Sold Out).`
                                    : `"${item.name}" marked as Available!`,
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                                isAvail
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isAvail ? "bg-emerald-600" : "bg-rose-600"
                                }`}
                              />
                              <span>{isAvail ? "Available" : "Sold Out"}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-[#575E5B] hover:text-[#1C241E] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                                title="Edit item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  duplicateMenuItem(item.id);
                                  showToast(`Duplicated "${item.name}".`);
                                }}
                                className="p-1.5 text-[#575E5B] hover:text-[#1C241E] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                                title="Duplicate item"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setItemToDelete(item)}
                                className="p-1.5 text-[#9CA3AF] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Categories Management View */
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#EFE9DE] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1C241E]">
                Menu Categories
              </h2>
              <p className="text-xs text-[#767E7A] font-light">
                Organize menu sections for your customer browsing experience.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#EFE9DE]">
            {categories
              .filter((c) => c.id !== "all")
              .map((cat, idx) => {
                const count = menuItems.filter(
                  (i) => i.category === cat.id,
                ).length;

                return (
                  <div
                    key={cat.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] text-[11px] font-mono text-[#755546] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#1C241E]">
                          {cat.label}
                        </h3>
                        {cat.description && (
                          <p className="text-xs text-[#767E7A] font-light">
                            {cat.description}
                          </p>
                        )}
                        <span className="text-[10px] text-[#C59F54] font-semibold uppercase tracking-wider">
                          {count} {count === 1 ? "item" : "items"} assigned
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCat(cat);
                          setCatLabel(cat.label);
                          setCatDescription(cat.description || "");
                          setIsCatModalOpen(true);
                        }}
                        className="p-1.5 text-[#575E5B] hover:text-[#1C241E] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {isItemModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsItemModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5DFD5] overflow-hidden my-8 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#EFE9DE] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755546]">
                  {editingItem ? "Edit Item" : "New Item"}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C241E]">
                  {editingItem ? editingItem.name : "Add Menu Item"}
                </h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-[#767E7A] hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              {/* Item Name */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Pizza"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-sm text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                />
              </div>

              {/* Category & Price Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as MenuCategoryId)
                    }
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short, delicious description for customer menu..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                />
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Image Path / URL
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Upload Image From Computer
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormImageFile(file);
                      if (file) {
                        setFormImage(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                  {formImageFile && (
                    <p className="mt-1 text-xs text-[#767E7A]">
                      Selected: {formImageFile.name}
                    </p>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="/dark-white-delight.jpg or image url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                />

                {formImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formImage}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#E5DFD5]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/dark-white-delight.jpg";
                      }}
                    />
                    <span className="text-[10px] text-[#767E7A]">
                      Image Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Optional Prep Note & Price Display */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Prep Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Served warm / Student favourite"
                    value={formPrepNote}
                    onChange={(e) => setFormPrepNote(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                    Display Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹600 / kg"
                    value={formPriceDisplay}
                    onChange={(e) => setFormPriceDisplay(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-[#EFE9DE] space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-[#EFE9DE] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1C241E]">
                      Item Available Today
                    </span>
                    <span className="text-[10px] text-[#767E7A]">
                      (Customers can order)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A] focus:ring-[#26332A]"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-[#EFE9DE] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1C241E]">
                      Mark as Popular Bestseller
                    </span>
                    <span className="text-[10px] text-[#767E7A]">
                      (Shows badge)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsBestseller}
                    onChange={(e) => setFormIsBestseller(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A] focus:ring-[#26332A]"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-[#EFE9DE] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1C241E]">
                      Feature on Homepage
                    </span>
                    <span className="text-[10px] text-[#767E7A]">
                      (Signature dish)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A] focus:ring-[#26332A]"
                  />
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EFE9DE]">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 border border-[#D5C7B5] rounded-xl text-xs font-semibold uppercase tracking-wider text-[#575E5B] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="px-5 py-2 bg-[#26332A] hover:bg-[#1C241E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage ? "Uploading..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
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
              Delete &ldquo;{itemToDelete.name}&rdquo;?
            </h3>
            <p className="text-xs text-[#767E7A] mt-1 font-light leading-relaxed">
              This will remove the item from the customer menu immediately. You
              can re-add it anytime.
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-[#D5C7B5] rounded-xl text-xs font-semibold text-[#575E5B] hover:bg-[#FAF7F2] cursor-pointer"
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

      {/* Add / Edit Category Modal */}
      {isCatModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsCatModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#E5DFD5] p-6 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DE]">
              <h3 className="font-serif text-xl font-bold text-[#1C241E]">
                {editingCat ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-[#767E7A] hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveCategory}
              className="py-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisanal Waffles"
                  value={catLabel}
                  onChange={(e) => setCatLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short subtitle displayed above category on menu..."
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EFE9DE]">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-3.5 py-1.5 border border-[#D5C7B5] rounded-xl text-xs text-[#575E5B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#26332A] text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
