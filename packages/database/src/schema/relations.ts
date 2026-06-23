import { relations } from 'drizzle-orm/relations';
import { siteContent, faq, stats, testimonials, storeSettings } from './tables';

export const siteContentRelations = relations(siteContent, () => ({}));
export const faqRelations = relations(faq, () => ({}));
export const statsRelations = relations(stats, () => ({}));
export const testimonialsRelations = relations(testimonials, () => ({}));
export const storeSettingsRelations = relations(storeSettings, () => ({}));
