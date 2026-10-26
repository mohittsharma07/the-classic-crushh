import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { Save, ArrowRight, RefreshCw } from "lucide-react";

export const AdminHomepagePage: React.FC = () => {
  const { homepageContent, updateHomepageContent, featuredItemIds } = useData();
  const { showToast } = useToast();

  const [heroTitle, setHeroTitle] = useState(homepageContent.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(homepageContent.heroSubtitle);
  const [heroDescription, setHeroDescription] = useState(homepageContent.heroDescription);
  const [heroImage, setHeroImage] = useState(homepageContent.heroImage);

  const [storyHeading, setStoryHeading] = useState(homepageContent.storyHeading);
  const [storyDescription, setStoryDescription] = useState(homepageContent.storyDescription);
  const [storyImage, setStoryImage] = useState(homepageContent.storyImage);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHomepageContent({
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      heroDescription: heroDescription.trim(),
      heroImage: heroImage.trim(),
      storyHeading: storyHeading.trim(),
      storyDescription: storyDescription.trim(),
      storyImage: storyImage.trim(),
    });
    showToast("Homepage content saved and live on customer site!");
  };

  const resetHeroImageToFlatlay = () => {
    setHeroImage("/hero-indian-cafe.jpg");
    showToast("Reset to default Indian cafe flat-lay hero image.");
  };

  return (
    <AdminLayout
      pageTitle="Homepage Content Management"
      pageSubtitle="Edit the hero banner, brand intro, and story teaser visible on the main landing page."
    >
      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* HERO SECTION CARD */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#EFE9DE] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755546]">
                Section 1
              </span>
              <h2 className="font-serif text-xl font-bold text-[#1C241E]">
                Hero Banner
              </h2>
            </div>
            <span className="text-xs text-[#767E7A] font-light">First impression above the fold</span>
          </div>

          <div className="p-6 space-y-5 text-xs">
            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1.5">
                  Hero Brand Heading
                </label>
                <input
                  type="text"
                  required
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-sm font-serif font-bold text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1.5">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  required
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs font-semibold uppercase tracking-wider text-[#755546] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1.5">
                Hero Tagline / Quote
              </label>
              <input
                type="text"
                required
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-sm italic font-serif text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />
            </div>

            {/* Hero Image & Live Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold uppercase tracking-wider text-[#3E4340]">
                  Hero Image Path / URL
                </label>
                <button
                  type="button"
                  onClick={resetHeroImageToFlatlay}
                  className="text-[11px] text-[#755546] hover:text-[#1C241E] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to Indian Cafe Flat-lay</span>
                </button>
              </div>

              <input
                type="text"
                required
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />

              {heroImage && (
                <div className="mt-3 relative aspect-21/9 rounded-xl overflow-hidden bg-[#2FA4B8] border border-[#E5DFD5]">
                  <img
                    src={heroImage}
                    alt="Hero Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-white px-4">
                      <span className="font-serif text-2xl font-bold tracking-widest uppercase block drop-shadow-md">
                        {heroTitle}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[#FDE68A] font-semibold block mt-0.5">
                        {heroSubtitle}
                      </span>
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                    Live Preview
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FEATURED LINK CARD */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755546] block mb-0.5">
              Section 2: Signatures
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1C241E]">
              Homepage Featured Items ({featuredItemIds.length} items active)
            </h3>
            <p className="text-xs text-[#767E7A] font-light">
              Manage the 3–6 signature dishes displayed immediately below the brand intro.
            </p>
          </div>

          <Link
            to="/admin/featured"
            className="px-4 py-2 border border-[#D5C7B5] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold uppercase tracking-wider text-[#1C241E] flex items-center gap-1.5 transition-colors"
          >
            <span>Manage Signatures</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* STORY TEASER SECTION CARD */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#EFE9DE]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755546]">
              Section 3
            </span>
            <h2 className="font-serif text-xl font-bold text-[#1C241E]">
              Story Teaser
            </h2>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1.5">
                Story Teaser Headline
              </label>
              <input
                type="text"
                required
                value={storyHeading}
                onChange={(e) => setStoryHeading(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-sm font-serif font-bold text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1.5">
                Short Description
              </label>
              <textarea
                rows={3}
                required
                value={storyDescription}
                onChange={(e) => setStoryDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1.5">
                Story Image Path / URL
              </label>
              <input
                type="text"
                required
                value={storyImage}
                onChange={(e) => setStoryImage(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />

              {storyImage && (
                <div className="mt-3 relative h-40 rounded-xl overflow-hidden bg-[#EFE9DE] border border-[#E5DFD5]">
                  <img
                    src={storyImage}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E5DFD5] shadow-lg flex items-center justify-between">
          <p className="text-xs text-[#767E7A] font-light">
            All edits update live immediately on the customer landing page.
          </p>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#26332A] hover:bg-[#1C241E] text-[#FAF7F2] text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
