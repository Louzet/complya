import { z } from 'zod';

// Slug valide : minuscules, chiffres, tirets uniquement
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  slug: z
    .string()
    .min(2, 'Le slug doit contenir au moins 2 caractères')
    .max(50, 'Le slug ne peut pas dépasser 50 caractères')
    .regex(slugRegex, 'Le slug ne peut contenir que des minuscules, chiffres et tirets')
    .trim(),
});

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
