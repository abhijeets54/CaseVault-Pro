import { z } from 'zod';

export const createCaseSchema = z.object({
  caseName: z
    .string()
    .min(3, 'Case name must be at least 3 characters')
    .max(200, 'Case name must be less than 200 characters'),
  caseOfficer: z.string().min(2, 'Officer name is required'),
  department: z.string().optional(),
  description: z.string().max(2000, 'Description too long').optional(),
});

export const updateCaseSchema = z.object({
  caseName: z.string().min(3).max(200).optional(),
  caseOfficer: z.string().min(2).optional(),
  department: z.string().optional(),
  description: z.string().max(2000).optional(),
  caseStatus: z.enum(['active', 'closed', 'archived']).optional(),
});

export const createTagSchema = z.object({
  caseId: z.string().uuid(),
  fileHash: z.string().min(32),
  tagName: z.string().min(1).max(50, 'Tag name must be less than 50 characters'),
  tagColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  notes: z.string().max(500).optional(),
});

export const searchSchema = z.object({
  query: z.string().max(500),
  fileType: z.string().optional(),
  minSize: z.number().min(0).optional(),
  maxSize: z.number().min(0).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export const generateReportSchema = z.object({
  caseId: z.string().uuid(),
  reportType: z.enum(['pdf', 'json', 'csv']),
  includeCOC: z.boolean(),
  fileHashes: z.array(z.string()).optional(),
});

export type CreateCaseFormData = z.infer<typeof createCaseSchema>;
export type UpdateCaseFormData = z.infer<typeof updateCaseSchema>;
export type CreateTagFormData = z.infer<typeof createTagSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type GenerateReportFormData = z.infer<typeof generateReportSchema>;
