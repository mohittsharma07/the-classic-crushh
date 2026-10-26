import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { VegBadge } from "../../components/VegBadge";
import { Star, ArrowUp, ArrowDown, Search } from "lucide-react";

export const AdminFeaturedPage: React.FC = () => {
  const { menuItems, featuredItemIds, updateFeaturedItemIds } = useData();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Reorder functions
  const moveItem = (index: number, direction: "up" | "down") => {
    const newIds = [...featuredItemIds];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newIds.length) return;

    const temp = newIds[index];
    newIds[index] = newIds[targetIdx];
    newIds[targetIdx] = temp;

    updateFeaturedItemIds(newIds);
    showToast("Featured order updated.");
  };

  const handleToggle = (itemId: string) => {
    if (featuredItemIds.includes(itemId)) {
      if (featuredItemIds.length <= 3) {
        showToast("Please keep at least 3 featured items for the homepage.", "info");
        return;
      }
      updateFeaturedItemIds(featuredItemIds.filter((id) => id !== itemId));
      showToast("Removed from Homepage Featured.");
    } else {
      if (featuredItemIds.length >= 6) {
        showToast("Maximum 6 featured items allowed on the homepage.", "info");
        return;
      }
      updateFeaturedItemIds([...featuredItemIds, itemId]);
      showToast("Added to Homepage Featured!");
    }
  };

  // Featured Item Objects in current active order
  const activeFeaturedItems = featuredItemIds
    .map((id) => menuItems.find((item) => item.id === id))
    .filter(Boolean);

  // Available Menu Items for toggling
  const filteredAllItems = menuItems.filter(
    (item) =>
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout
      pageTitle="Homepage Featured Items"
      pageSubtitle="Select and arrange the 3–6 signature dishes spotlighted on the customer landing page."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Currently Selected Featured Items (with Reordering) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#EFE9DE] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1C241E]">
                Active on Homepage ({featuredItemIds.length}/6)
              </h2>
              <p className="text-xs text-[#767E7A] font-light">
                Items appear in this exact order on the landing page.
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-4 space-y-3">
            {activeFeaturedItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#767E7A]">
                No featured items selected yet. Choose from the list on the right.
              </div>
            ) : (
              activeFeaturedItems.map((item, index) => {
                if (!item) return null;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-[#FCFAF7] rounded-xl border border-[#E5DFD5] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[#EFE9DE] text-[10px] font-mono font-bold text-[#755546] flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover shrink-0 border border-[#E5DFD5]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <VegBadge size="sm" />
                          <h4 className="font-serif font-bold text-sm text-[#1C241E] truncate">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#767E7A] font-serif font-bold">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>

                    {/* Order adjustment buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          index === 0
                            ? "opacity-30 cursor-not-allowed border-transparent"
                            : "hover:bg-[#EFE9DE] border-[#E5DFD5] text-[#575E5B] cursor-pointer"
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === activeFeaturedItems.length - 1}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          index === activeFeaturedItems.length - 1
                            ? "opacity-30 cursor-not-allowed border-transparent"
                            : "hover:bg-[#EFE9DE] border-[#E5DFD5] text-[#575E5B] cursor-pointer"
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggle(item.id)}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg ml-1 cursor-pointer"
                        title="Remove from featured"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 bg-[#FAF7F2] border-t border-[#EFE9DE] text-[11px] text-[#767E7A] font-light">
            💡 Recommended: Keep 4 items for a clean, balanced layout on mobile and desktop.
          </div>
        </div>

        {/* Right Column: All Menu Items with Checkbox Toggles */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#EFE9DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1C241E]">
                All Menu Items
              </h2>
              <p className="text-xs text-[#767E7A] font-light">
                Click any checkbox to toggle inclusion on the landing page.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="divide-y divide-[#EFE9DE] max-h-[600px] overflow-y-auto">
            {filteredAllItems.map((item) => {
              const isChecked = featuredItemIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    isChecked ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-[#FAF7F2]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by parent click
                      className="w-4 h-4 rounded text-[#26332A] focus:ring-[#26332A] cursor-pointer"
                    />

                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E5DFD5]"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <VegBadge size="sm" />
                        <h4 className="font-serif font-bold text-sm text-[#1C241E] truncate">
                          {item.name}
                        </h4>
                        {isChecked && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-600" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#767E7A] line-clamp-1 font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span className="font-serif font-bold text-sm text-[#1C241E] shrink-0">
                    ₹{item.price}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
