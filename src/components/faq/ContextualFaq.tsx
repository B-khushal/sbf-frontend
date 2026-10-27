import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import faqService, { FaqItem } from '@/services/faqService';

interface ContextualFaqProps {
  location?: 'home' | 'category' | 'product' | 'contact' | 'cakes' | 'combos' | string;
  categorySlug?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}

export const ContextualFaq: React.FC<ContextualFaqProps> = ({
  location,
  categorySlug,
  title = 'Frequently Asked Questions',
  subtitle,
  limit = 6,
  className = '',
}) => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const data = await faqService.getFaqs({
          location,
          category: categorySlug,
          limit,
        });
        if (isMounted) {
          // If less than 3 returned for specific location, fetch general top FAQs
          if (data.length < 3 && location !== 'home') {
            const fallback = await faqService.getFaqs({ limit: 4 });
            setFaqs(data.length > 0 ? data : fallback);
          } else {
            setFaqs(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load contextual FAQs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFaqs();
    return () => {
      isMounted = false;
    };
  }, [location, categorySlug, limit]);

  if (!loading && faqs.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Accordions */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-gray-200/80 animate-pulse" />
            ))}
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs transition-all data-[state=open]:border-rose-300 data-[state=open]:shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="px-5 py-4 sm:px-6 hover:no-underline text-left group">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-rose-800 transition-colors pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 sm:px-6 text-gray-700 text-sm sm:text-base leading-relaxed border-t border-gray-50 pt-3">
                  <div
                    className="prose prose-sm max-w-none text-gray-700 space-y-2"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                  <div className="mt-3 pt-2 text-xs text-rose-700">
                    <Link to={`/faq#${faq.slug}`} className="hover:underline font-medium inline-flex items-center gap-1">
                      <span>View in full FAQ</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Bottom CTA to /faq and WhatsApp */}
        <div className="mt-8 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>
            Have more questions about deliveries, payment, or customization?
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/faq"
              className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-800 hover:underline"
            >
              <span>Explore all FAQs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => {
                const msg = encodeURIComponent("Hi Spring Blossoms Florist! I have a question.");
                window.open(`https://wa.me/9949683222?text=${msg}`, '_blank');
              }}
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContextualFaq;
