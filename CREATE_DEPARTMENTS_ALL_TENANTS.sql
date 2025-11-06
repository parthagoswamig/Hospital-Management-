-- ========================================
-- CREATE DEPARTMENTS FOR ALL TENANTS
-- ========================================
-- This will create basic departments for all your tenants
-- ========================================

DO $$
DECLARE
  tenant_ids TEXT[] := ARRAY[
    'cmhhyugcp0000l8049m307dru',  -- Our Democratic Hospital
    'cmhhdam440000iq2eshajnpo5',  -- Bishnupur Vaipo Hospital
    'cmh8p0g94001jv42wn7p3klnq',  -- Default Hospital
    'test-tenant-001'              -- Test Hospital
  ];
  tenant_id TEXT;
BEGIN
  FOREACH tenant_id IN ARRAY tenant_ids
  LOOP
    -- Insert basic departments for each tenant
    INSERT INTO "Department" (id, name, code, description, "tenantId", "isActive", "createdAt", "updatedAt")
    VALUES 
      -- Core Departments
      (gen_random_uuid(), 'Emergency', 'EMER-' || tenant_id, 'Emergency and trauma care', tenant_id, true, NOW(), NOW()),
      (gen_random_uuid(), 'Cardiology', 'CARD-' || tenant_id, 'Heart and cardiovascular care', tenant_id, true, NOW(), NOW()),
      (gen_random_uuid(), 'Pediatrics', 'PEDI-' || tenant_id, 'Children healthcare', tenant_id, true, NOW(), NOW()),
      (gen_random_uuid(), 'Surgery', 'SURG-' || tenant_id, 'Surgical procedures', tenant_id, true, NOW(), NOW()),
      (gen_random_uuid(), 'ICU', 'ICU-' || tenant_id, 'Intensive Care Unit', tenant_id, true, NOW(), NOW()),
      
      -- Diagnostic
      (gen_random_uuid(), 'Radiology', 'RADI-' || tenant_id, 'Medical imaging', tenant_id, true, NOW(), NOW()),
      (gen_random_uuid(), 'Laboratory', 'LAB-' || tenant_id, 'Medical testing', tenant_id, true, NOW(), NOW()),
      
      -- Support
      (gen_random_uuid(), 'Pharmacy', 'PHAR-' || tenant_id, 'Medication management', tenant_id, true, NOW(), NOW()),
      (gen_random_uuid(), 'Administration', 'ADMIN-' || tenant_id, 'Hospital administration', tenant_id, true, NOW(), NOW()),
      (gen_random_uuid(), 'Reception', 'RECP-' || tenant_id, 'Front desk', tenant_id, true, NOW(), NOW())
    ON CONFLICT (code) DO NOTHING;
    
    RAISE NOTICE 'Created departments for tenant: %', tenant_id;
  END LOOP;
END $$;

-- Verify all departments
SELECT 
  t.name as tenant_name,
  COUNT(d.id) as department_count
FROM "Tenant" t
LEFT JOIN "Department" d ON d."tenantId" = t.id
WHERE t.id IN (
  'cmhhyugcp0000l8049m307dru',
  'cmhhdam440000iq2eshajnpo5',
  'cmh8p0g94001jv42wn7p3klnq',
  'test-tenant-001'
)
GROUP BY t.id, t.name
ORDER BY t.name;

-- Show all departments
SELECT 
  t.name as tenant_name,
  d.name as department_name,
  d.code,
  d."isActive"
FROM "Department" d
JOIN "Tenant" t ON t.id = d."tenantId"
WHERE d."tenantId" IN (
  'cmhhyugcp0000l8049m307dru',
  'cmhhdam440000iq2eshajnpo5',
  'cmh8p0g94001jv42wn7p3klnq',
  'test-tenant-001'
)
ORDER BY t.name, d.name;
