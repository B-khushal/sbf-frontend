import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSeasonalCampaign } from '@/contexts/SeasonalCampaignContext';
import { Gift, ArrowRight, Sparkles } from 'lucide-react';
import { getImageUrl } from '@/config';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  }
};

export const SeasonalCampaignHomeSection: React.FC = () => {
  const navigate = useNavigate();
  const { activeCampaigns } = useSeasonalCampaign();

  // Filter campaigns that should be shown on homepage and are active
  const homepageCampaigns = activeCampaigns.filter(
    (c) => c.enabled && c.navigation?.showInHomepage && c.slug !== 'valentine' && c.slug !== 'valentines-week'
  );

  if (homepageCampaigns.length === 0) return null;

  // Retrieve global homepage section settings from the first active campaign
  const primaryCampaign = homepageCampaigns[0];
  const sectionBadge = primaryCampaign?.general?.homepageSectionBadge || "Seasonal Celebrations";
  const sectionTitle = primaryCampaign?.general?.homepageSectionTitle || "Our Festive Specials";
  const sectionSubtitle = primaryCampaign?.general?.homepageSectionSubtitle || "Make every occasion unforgettable with our specially curated seasonal flower collections.";

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {sectionBadge}
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {homepageCampaigns.map((campaign) => {
            // Find hero banner or primary banner if available
            const heroBanner = campaign.banners?.find(
              (b) => b.enabled && (b.position === 'hero' || b.position === 'carousel')
            );
            const bannerImage = campaign.general?.cardImage
              ? getImageUrl(campaign.general.cardImage)
              : heroBanner?.image 
                ? getImageUrl(heroBanner.image)
                : "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop";

            const primaryColor = campaign.theme?.primaryColor || '#6d28d9';
            const secondaryColor = campaign.theme?.secondaryColor || '#4f46e5';

            // Customizable card details
            const cardTagText = campaign.general?.cardTagText || "Limited Campaign";
            const cardTitleText = campaign.general?.cardTitleText || `${campaign.name} Special`;
            const cardDescriptionText = campaign.general?.cardDescriptionText || campaign.seo?.metaDescription || `Order our premium collection of flowers and gifts customized specifically for ${campaign.name}.`;
            const cardButtonText = campaign.general?.cardButtonText || "Shop Now";

            return (
              <motion.div
                key={campaign.slug}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={cardVariants}
                className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-101 transition-all duration-500 group flex flex-col justify-end min-h-[350px] sm:min-h-[400px] border border-gray-100 cursor-pointer"
                onClick={() => navigate(`/occasions/${campaign.slug}`)}
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-103 transition-transform duration-700" style={{ backgroundImage: `url(${bannerImage})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent group-hover:from-black/90 transition-colors" />

                {/* Corner Decorative Aura */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-40 mix-blend-screen pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}
                />

                {/* Content */}
                <div className="relative z-10 p-6 sm:p-8 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md"
                      style={{ backgroundColor: `${primaryColor}30`, border: `1px solid ${primaryColor}50` }}
                    >
                      {cardTagText}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight group-hover:text-purple-200 transition-colors">
                    {cardTitleText}
                  </h3>
                  
                  <p className="text-white/70 text-xs sm:text-sm mb-6 max-w-md line-clamp-2">
                    {cardDescriptionText}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      className="px-5 py-2.5 font-bold rounded-xl text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 hover:scale-105 transition-transform"
                      style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, color: '#ffffff' }}
                    >
                      {cardButtonText}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
