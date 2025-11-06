-- ========================================
-- CREATE DEPARTMENTS FOR HOSPITAL
-- ========================================
-- 
-- INSTRUCTIONS:
-- 1. Replace '<your-tenant-id>' with your actual tenant ID
-- 2. Run this in Supabase SQL Editor
-- 3. Verify departments created successfully
--
-- To find your tenant ID, run:
-- SELECT id, name, slug FROM "Tenant";
-- ========================================

-- Replace this with your actual tenant ID
-- Example: 'cm2abc123def456ghi789'
DO $$
DECLARE
  v_tenant_id VARCHAR := '<your-tenant-id>'; -- CHANGE THIS!
BEGIN
  -- Insert departments
  INSERT INTO "Department" (id, name, code, description, "tenantId", "isActive", "createdAt", "updatedAt")
  VALUES 
    -- Cardiology Department
    (gen_random_uuid(), 'Cardiology', 'CARD', 'Heart and cardiovascular care', v_tenant_id, true, NOW(), NOW()),
    
    -- Emergency Department
    (gen_random_uuid(), 'Emergency', 'EMER', 'Emergency and trauma care', v_tenant_id, true, NOW(), NOW()),
    
    -- Pediatrics Department
    (gen_random_uuid(), 'Pediatrics', 'PEDI', 'Children healthcare', v_tenant_id, true, NOW(), NOW()),
    
    -- Radiology Department
    (gen_random_uuid(), 'Radiology', 'RADI', 'Medical imaging and diagnostics', v_tenant_id, true, NOW(), NOW()),
    
    -- Pharmacy Department
    (gen_random_uuid(), 'Pharmacy', 'PHAR', 'Medication management and dispensing', v_tenant_id, true, NOW(), NOW()),
    
    -- Laboratory Department
    (gen_random_uuid(), 'Laboratory', 'LAB', 'Medical testing and analysis', v_tenant_id, true, NOW(), NOW()),
    
    -- Surgery Department
    (gen_random_uuid(), 'Surgery', 'SURG', 'Surgical procedures and operations', v_tenant_id, true, NOW(), NOW()),
    
    -- ICU Department
    (gen_random_uuid(), 'ICU', 'ICU', 'Intensive Care Unit', v_tenant_id, true, NOW(), NOW()),
    
    -- Orthopedics Department
    (gen_random_uuid(), 'Orthopedics', 'ORTH', 'Bone and joint care', v_tenant_id, true, NOW(), NOW()),
    
    -- Neurology Department
    (gen_random_uuid(), 'Neurology', 'NEUR', 'Brain and nervous system care', v_tenant_id, true, NOW(), NOW()),
    
    -- Obstetrics & Gynecology
    (gen_random_uuid(), 'OB/GYN', 'OBGY', 'Women health and maternity care', v_tenant_id, true, NOW(), NOW()),
    
    -- Oncology Department
    (gen_random_uuid(), 'Oncology', 'ONCO', 'Cancer treatment and care', v_tenant_id, true, NOW(), NOW()),
    
    -- Psychiatry Department
    (gen_random_uuid(), 'Psychiatry', 'PSYC', 'Mental health care', v_tenant_id, true, NOW(), NOW()),
    
    -- Dermatology Department
    (gen_random_uuid(), 'Dermatology', 'DERM', 'Skin care and treatment', v_tenant_id, true, NOW(), NOW()),
    
    -- Ophthalmology Department
    (gen_random_uuid(), 'Ophthalmology', 'OPHT', 'Eye care and vision', v_tenant_id, true, NOW(), NOW()),
    
    -- ENT Department
    (gen_random_uuid(), 'ENT', 'ENT', 'Ear, Nose, and Throat care', v_tenant_id, true, NOW(), NOW()),
    
    -- Urology Department
    (gen_random_uuid(), 'Urology', 'UROL', 'Urinary system care', v_tenant_id, true, NOW(), NOW()),
    
    -- Nephrology Department
    (gen_random_uuid(), 'Nephrology', 'NEPH', 'Kidney care', v_tenant_id, true, NOW(), NOW()),
    
    -- Gastroenterology Department
    (gen_random_uuid(), 'Gastroenterology', 'GAST', 'Digestive system care', v_tenant_id, true, NOW(), NOW()),
    
    -- Pulmonology Department
    (gen_random_uuid(), 'Pulmonology', 'PULM', 'Lung and respiratory care', v_tenant_id, true, NOW(), NOW()),
    
    -- Endocrinology Department
    (gen_random_uuid(), 'Endocrinology', 'ENDO', 'Hormone and gland care', v_tenant_id, true, NOW(), NOW()),
    
    -- Rheumatology Department
    (gen_random_uuid(), 'Rheumatology', 'RHEU', 'Joint and autoimmune care', v_tenant_id, true, NOW(), NOW()),
    
    -- Anesthesiology Department
    (gen_random_uuid(), 'Anesthesiology', 'ANES', 'Anesthesia and pain management', v_tenant_id, true, NOW(), NOW()),
    
    -- Pathology Department
    (gen_random_uuid(), 'Pathology', 'PATH', 'Disease diagnosis and testing', v_tenant_id, true, NOW(), NOW()),
    
    -- Physical Therapy
    (gen_random_uuid(), 'Physical Therapy', 'PHYS', 'Rehabilitation and therapy', v_tenant_id, true, NOW(), NOW()),
    
    -- Nutrition Department
    (gen_random_uuid(), 'Nutrition', 'NUTR', 'Dietary and nutrition services', v_tenant_id, true, NOW(), NOW()),
    
    -- Administration
    (gen_random_uuid(), 'Administration', 'ADMIN', 'Hospital administration and management', v_tenant_id, true, NOW(), NOW()),
    
    -- Reception
    (gen_random_uuid(), 'Reception', 'RECP', 'Front desk and patient registration', v_tenant_id, true, NOW(), NOW()),
    
    -- Housekeeping
    (gen_random_uuid(), 'Housekeeping', 'HOUS', 'Facility maintenance and cleaning', v_tenant_id, true, NOW(), NOW()),
    
    -- Security
    (gen_random_uuid(), 'Security', 'SECU', 'Hospital security services', v_tenant_id, true, NOW(), NOW())
  ON CONFLICT (code) DO NOTHING;

  RAISE NOTICE 'Departments created successfully!';
END $$;

-- Verify departments were created
SELECT id, name, code, description 
FROM "Department" 
WHERE "tenantId" = '<your-tenant-id>'
ORDER BY name;
