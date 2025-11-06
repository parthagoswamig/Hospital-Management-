-- ========================================
-- AUTO CREATE DEPARTMENTS FOR ANY TENANT
-- ========================================
-- This script automatically creates departments for:
-- 1. ALL existing tenants that don't have departments
-- 2. Can be run multiple times safely (won't create duplicates)
-- 3. Perfect for new tenants!
-- ========================================

DO $$
DECLARE
  tenant_record RECORD;
  dept_count INTEGER;
BEGIN
  -- Loop through all active tenants
  FOR tenant_record IN 
    SELECT id, name FROM "Tenant" WHERE "isActive" = true
  LOOP
    -- Check if this tenant already has departments
    SELECT COUNT(*) INTO dept_count 
    FROM "Department" 
    WHERE "tenantId" = tenant_record.id;
    
    -- Only create departments if tenant has none
    IF dept_count = 0 THEN
      RAISE NOTICE 'Creating departments for: % (ID: %)', tenant_record.name, tenant_record.id;
      
      -- Insert departments for this tenant
      INSERT INTO "Department" (id, name, code, description, "tenantId", "isActive", "createdAt", "updatedAt")
      VALUES 
        -- Core Medical Departments
        (gen_random_uuid(), 'Emergency', 'EMER-' || tenant_record.id, 'Emergency and trauma care', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Cardiology', 'CARD-' || tenant_record.id, 'Heart and cardiovascular care', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Pediatrics', 'PEDI-' || tenant_record.id, 'Children healthcare', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Surgery', 'SURG-' || tenant_record.id, 'Surgical procedures', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'ICU', 'ICU-' || tenant_record.id, 'Intensive Care Unit', tenant_record.id, true, NOW(), NOW()),
        
        -- Diagnostic Departments
        (gen_random_uuid(), 'Radiology', 'RADI-' || tenant_record.id, 'Medical imaging', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Laboratory', 'LAB-' || tenant_record.id, 'Medical testing', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Pathology', 'PATH-' || tenant_record.id, 'Disease diagnosis', tenant_record.id, true, NOW(), NOW()),
        
        -- Specialty Departments
        (gen_random_uuid(), 'Orthopedics', 'ORTH-' || tenant_record.id, 'Bone and joint care', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Neurology', 'NEUR-' || tenant_record.id, 'Brain and nervous system', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'OB/GYN', 'OBGY-' || tenant_record.id, 'Women health and maternity', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Oncology', 'ONCO-' || tenant_record.id, 'Cancer treatment', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Psychiatry', 'PSYC-' || tenant_record.id, 'Mental health care', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Dermatology', 'DERM-' || tenant_record.id, 'Skin care', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Ophthalmology', 'OPHT-' || tenant_record.id, 'Eye care', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'ENT', 'ENT-' || tenant_record.id, 'Ear, Nose, and Throat', tenant_record.id, true, NOW(), NOW()),
        
        -- Support Departments
        (gen_random_uuid(), 'Pharmacy', 'PHAR-' || tenant_record.id, 'Medication management', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Physical Therapy', 'PHYS-' || tenant_record.id, 'Rehabilitation', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Nutrition', 'NUTR-' || tenant_record.id, 'Dietary services', tenant_record.id, true, NOW(), NOW()),
        
        -- Administrative Departments
        (gen_random_uuid(), 'Administration', 'ADMIN-' || tenant_record.id, 'Hospital administration', tenant_record.id, true, NOW(), NOW()),
        (gen_random_uuid(), 'Reception', 'RECP-' || tenant_record.id, 'Front desk', tenant_record.id, true, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
      
      RAISE NOTICE '✅ Created 21 departments for: %', tenant_record.name;
    ELSE
      RAISE NOTICE '⏭️  Skipped % - already has % departments', tenant_record.name, dept_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Department creation completed!';
  RAISE NOTICE '========================================';
END $$;

-- Show summary of all tenants and their departments
SELECT 
  t.name as "Hospital Name",
  t.id as "Tenant ID",
  COUNT(d.id) as "Total Departments",
  t."isActive" as "Active"
FROM "Tenant" t
LEFT JOIN "Department" d ON d."tenantId" = t.id
GROUP BY t.id, t.name, t."isActive"
ORDER BY t."createdAt" DESC;
