-- ========================================
-- CREATE DEPARTMENTS FOR YOUR HOSPITAL
-- ========================================
-- 
-- Your Tenant IDs:
-- cmhhyugcp0000l8049m307dru - Our Democratic Hospital (Latest)
-- cmhhdam440000iq2eshajnpo5 - Bishnupur Vaipo Hospital
-- cmh8p0g94001jv42wn7p3klnq - Default Hospital
-- test-tenant-001 - Test Hospital
--
-- This script will create departments for the LATEST tenant
-- Change the tenant ID below if you want to use a different one
-- ========================================

-- Create departments for "Our Democratic Hospital"
INSERT INTO "Department" (id, name, code, description, "tenantId", "isActive", "createdAt", "updatedAt")
VALUES 
  -- Core Medical Departments
  (gen_random_uuid(), 'Cardiology', 'CARD', 'Heart and cardiovascular care', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Emergency', 'EMER', 'Emergency and trauma care', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Pediatrics', 'PEDI', 'Children healthcare', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Surgery', 'SURG', 'Surgical procedures', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'ICU', 'ICU', 'Intensive Care Unit', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  
  -- Diagnostic Departments
  (gen_random_uuid(), 'Radiology', 'RADI', 'Medical imaging and diagnostics', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Laboratory', 'LAB', 'Medical testing and analysis', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Pathology', 'PATH', 'Disease diagnosis and testing', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  
  -- Specialty Departments
  (gen_random_uuid(), 'Orthopedics', 'ORTH', 'Bone and joint care', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Neurology', 'NEUR', 'Brain and nervous system care', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'OB/GYN', 'OBGY', 'Women health and maternity care', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Oncology', 'ONCO', 'Cancer treatment and care', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Psychiatry', 'PSYC', 'Mental health care', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Dermatology', 'DERM', 'Skin care and treatment', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Ophthalmology', 'OPHT', 'Eye care and vision', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'ENT', 'ENT', 'Ear, Nose, and Throat care', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  
  -- Support Departments
  (gen_random_uuid(), 'Pharmacy', 'PHAR', 'Medication management', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Physical Therapy', 'PHYS', 'Rehabilitation and therapy', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Nutrition', 'NUTR', 'Dietary and nutrition services', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  
  -- Administrative Departments
  (gen_random_uuid(), 'Administration', 'ADMIN', 'Hospital administration', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW()),
  (gen_random_uuid(), 'Reception', 'RECP', 'Front desk and registration', 'cmhhyugcp0000l8049m307dru', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Verify departments were created
SELECT 
  id, 
  name, 
  code, 
  description,
  "isActive"
FROM "Department" 
WHERE "tenantId" = 'cmhhyugcp0000l8049m307dru'
ORDER BY name;

-- Count departments
SELECT COUNT(*) as total_departments 
FROM "Department" 
WHERE "tenantId" = 'cmhhyugcp0000l8049m307dru';
