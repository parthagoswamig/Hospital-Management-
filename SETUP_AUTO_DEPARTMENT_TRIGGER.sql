-- ========================================
-- AUTOMATIC DEPARTMENT CREATION TRIGGER
-- ========================================
-- This creates a database trigger that automatically
-- creates departments whenever a new tenant is created!
-- 
-- Benefits:
-- ✅ Fully automatic - no manual work needed
-- ✅ Works for ALL new tenants
-- ✅ Runs immediately when tenant is created
-- ✅ Set it up once, forget about it!
-- ========================================

-- Step 1: Create the function that creates departments
CREATE OR REPLACE FUNCTION create_default_departments_for_tenant()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default departments for the new tenant
  INSERT INTO "Department" (id, name, code, description, "tenantId", "isActive", "createdAt", "updatedAt")
  VALUES 
    -- Core Medical Departments
    (gen_random_uuid(), 'Emergency', 'EMER-' || NEW.id, 'Emergency and trauma care', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Cardiology', 'CARD-' || NEW.id, 'Heart and cardiovascular care', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Pediatrics', 'PEDI-' || NEW.id, 'Children healthcare', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Surgery', 'SURG-' || NEW.id, 'Surgical procedures', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'ICU', 'ICU-' || NEW.id, 'Intensive Care Unit', NEW.id, true, NOW(), NOW()),
    
    -- Diagnostic Departments
    (gen_random_uuid(), 'Radiology', 'RADI-' || NEW.id, 'Medical imaging and diagnostics', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Laboratory', 'LAB-' || NEW.id, 'Medical testing and analysis', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Pathology', 'PATH-' || NEW.id, 'Disease diagnosis and testing', NEW.id, true, NOW(), NOW()),
    
    -- Specialty Departments
    (gen_random_uuid(), 'Orthopedics', 'ORTH-' || NEW.id, 'Bone and joint care', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Neurology', 'NEUR-' || NEW.id, 'Brain and nervous system care', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'OB/GYN', 'OBGY-' || NEW.id, 'Women health and maternity care', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Oncology', 'ONCO-' || NEW.id, 'Cancer treatment and care', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Psychiatry', 'PSYC-' || NEW.id, 'Mental health care', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Dermatology', 'DERM-' || NEW.id, 'Skin care and treatment', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Ophthalmology', 'OPHT-' || NEW.id, 'Eye care and vision', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'ENT', 'ENT-' || NEW.id, 'Ear, Nose, and Throat care', NEW.id, true, NOW(), NOW()),
    
    -- Support Departments
    (gen_random_uuid(), 'Pharmacy', 'PHAR-' || NEW.id, 'Medication management and dispensing', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Physical Therapy', 'PHYS-' || NEW.id, 'Rehabilitation and therapy', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Nutrition', 'NUTR-' || NEW.id, 'Dietary and nutrition services', NEW.id, true, NOW(), NOW()),
    
    -- Administrative Departments
    (gen_random_uuid(), 'Administration', 'ADMIN-' || NEW.id, 'Hospital administration and management', NEW.id, true, NOW(), NOW()),
    (gen_random_uuid(), 'Reception', 'RECP-' || NEW.id, 'Front desk and patient registration', NEW.id, true, NOW(), NOW())
  ON CONFLICT (code) DO NOTHING;
  
  -- Log the action
  RAISE NOTICE '✅ Auto-created 21 departments for new tenant: % (ID: %)', NEW.name, NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS auto_create_departments_trigger ON "Tenant";

CREATE TRIGGER auto_create_departments_trigger
  AFTER INSERT ON "Tenant"
  FOR EACH ROW
  EXECUTE FUNCTION create_default_departments_for_tenant();

-- Step 3: Verify trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'auto_create_departments_trigger';

-- ========================================
-- SUCCESS! 
-- ========================================
-- From now on, whenever a new tenant is created,
-- 21 departments will be automatically created!
-- 
-- Test it:
-- INSERT INTO "Tenant" (id, name, slug, "isActive")
-- VALUES (gen_random_uuid(), 'Test Hospital', 'test-hospital', true);
-- 
-- Then check:
-- SELECT * FROM "Department" WHERE "tenantId" = '<new-tenant-id>';
-- ========================================
