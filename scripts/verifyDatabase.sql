-- ============================================
-- RevenuePilot AI - Database Verification
-- ============================================
-- Run this AFTER running schema.sql to verify
-- everything was created correctly
-- ============================================

-- ============================================
-- 1. CHECK TABLES EXIST
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '1. Checking Tables';
    RAISE NOTICE '============================================';
    
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'Found % tables', table_count;
    
    IF table_count >= 5 THEN
        RAISE NOTICE '✅ All tables created successfully';
    ELSE
        RAISE NOTICE '❌ Missing tables! Expected 5, found %', table_count;
    END IF;
END $$;

-- List all tables
SELECT 
    '📊 ' || table_name as "Tables Created"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 2. CHECK INDEXES
-- ============================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '2. Checking Indexes';
    RAISE NOTICE '============================================';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Found % indexes', index_count;
    
    IF index_count >= 15 THEN
        RAISE NOTICE '✅ All indexes created successfully';
    ELSE
        RAISE NOTICE '⚠️  Expected at least 15 indexes, found %', index_count;
    END IF;
END $$;

-- List indexes by table
SELECT 
    tablename as "Table",
    COUNT(*) as "Index Count"
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 3. CHECK RLS POLICIES
-- ============================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '3. Checking RLS Policies';
    RAISE NOTICE '============================================';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Found % RLS policies', policy_count;
    
    IF policy_count >= 14 THEN
        RAISE NOTICE '✅ All RLS policies created successfully';
    ELSE
        RAISE NOTICE '⚠️  Expected at least 14 policies, found %', policy_count;
    END IF;
END $$;

-- List policies by table
SELECT 
    tablename as "Table",
    COUNT(*) as "Policy Count"
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 4. CHECK TRIGGERS
-- ============================================

DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '4. Checking Triggers';
    RAISE NOTICE '============================================';
    
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    RAISE NOTICE 'Found % triggers', trigger_count;
    
    IF trigger_count >= 3 THEN
        RAISE NOTICE '✅ All triggers created successfully';
    ELSE
        RAISE NOTICE '⚠️  Expected at least 3 triggers, found %', trigger_count;
    END IF;
END $$;

-- List triggers
SELECT 
    event_object_table as "Table",
    trigger_name as "Trigger Name",
    event_manipulation as "Event"
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 5. CHECK FUNCTIONS
-- ============================================

DO $$
DECLARE
    function_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '5. Checking Functions';
    RAISE NOTICE '============================================';
    
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f';
    
    RAISE NOTICE 'Found % functions', function_count;
    
    IF function_count >= 2 THEN
        RAISE NOTICE '✅ All functions created successfully';
    ELSE
        RAISE NOTICE '⚠️  Expected at least 2 functions, found %', function_count;
    END IF;
END $$;

-- List functions
SELECT 
    proname as "Function Name",
    pg_get_function_result(oid) as "Returns"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
ORDER BY proname;

-- ============================================
-- 6. CHECK FOREIGN KEYS
-- ============================================

DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '6. Checking Foreign Keys';
    RAISE NOTICE '============================================';
    
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public'
    AND constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE 'Found % foreign keys', fk_count;
    
    IF fk_count >= 6 THEN
        RAISE NOTICE '✅ All foreign keys created successfully';
    ELSE
        RAISE NOTICE '⚠️  Expected at least 6 foreign keys, found %', fk_count;
    END IF;
END $$;

-- List foreign keys
SELECT 
    tc.table_name as "Table",
    tc.constraint_name as "Constraint",
    kcu.column_name as "Column",
    ccu.table_name as "References Table"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.constraint_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================
-- 7. CHECK VIEWS
-- ============================================

DO $$
DECLARE
    view_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '7. Checking Views';
    RAISE NOTICE '============================================';
    
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public';
    
    RAISE NOTICE 'Found % views', view_count;
    
    IF view_count >= 2 THEN
        RAISE NOTICE '✅ All views created successfully';
    ELSE
        RAISE NOTICE '⚠️  Expected at least 2 views, found %', view_count;
    END IF;
END $$;

-- List views
SELECT 
    '📈 ' || table_name as "Views Created"
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 8. TEST TABLE STRUCTURE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '8. Testing Table Structure';
    RAISE NOTICE '============================================';
END $$;

-- Check projects table
SELECT 
    column_name as "Column",
    data_type as "Type",
    is_nullable as "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'projects'
ORDER BY ordinal_position;

-- Check generated_results table
SELECT 
    column_name as "Column",
    data_type as "Type",
    is_nullable as "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'generated_results'
ORDER BY ordinal_position;

-- ============================================
-- 9. FINAL SUMMARY
-- ============================================

DO $$
DECLARE
    tables_ok BOOLEAN;
    indexes_ok BOOLEAN;
    policies_ok BOOLEAN;
    triggers_ok BOOLEAN;
    functions_ok BOOLEAN;
    fks_ok BOOLEAN;
    views_ok BOOLEAN;
    all_ok BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'VERIFICATION SUMMARY';
    RAISE NOTICE '============================================';
    
    -- Check each component
    SELECT COUNT(*) >= 5 INTO tables_ok FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    SELECT COUNT(*) >= 15 INTO indexes_ok FROM pg_indexes WHERE schemaname = 'public';
    SELECT COUNT(*) >= 14 INTO policies_ok FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) >= 3 INTO triggers_ok FROM information_schema.triggers WHERE trigger_schema = 'public';
    SELECT COUNT(*) >= 2 INTO functions_ok FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.prokind = 'f';
    SELECT COUNT(*) >= 6 INTO fks_ok FROM information_schema.table_constraints WHERE constraint_schema = 'public' AND constraint_type = 'FOREIGN KEY';
    SELECT COUNT(*) >= 2 INTO views_ok FROM information_schema.views WHERE table_schema = 'public';
    
    all_ok := tables_ok AND indexes_ok AND policies_ok AND triggers_ok AND functions_ok AND fks_ok AND views_ok;
    
    RAISE NOTICE '';
    IF tables_ok THEN RAISE NOTICE '✅ Tables: OK'; ELSE RAISE NOTICE '❌ Tables: FAILED'; END IF;
    IF indexes_ok THEN RAISE NOTICE '✅ Indexes: OK'; ELSE RAISE NOTICE '❌ Indexes: FAILED'; END IF;
    IF policies_ok THEN RAISE NOTICE '✅ RLS Policies: OK'; ELSE RAISE NOTICE '❌ RLS Policies: FAILED'; END IF;
    IF triggers_ok THEN RAISE NOTICE '✅ Triggers: OK'; ELSE RAISE NOTICE '❌ Triggers: FAILED'; END IF;
    IF functions_ok THEN RAISE NOTICE '✅ Functions: OK'; ELSE RAISE NOTICE '❌ Functions: FAILED'; END IF;
    IF fks_ok THEN RAISE NOTICE '✅ Foreign Keys: OK'; ELSE RAISE NOTICE '❌ Foreign Keys: FAILED'; END IF;
    IF views_ok THEN RAISE NOTICE '✅ Views: OK'; ELSE RAISE NOTICE '❌ Views: FAILED'; END IF;
    
    RAISE NOTICE '';
    IF all_ok THEN
        RAISE NOTICE '🎉 ALL CHECKS PASSED!';
        RAISE NOTICE '';
        RAISE NOTICE 'Your database is ready to use!';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '1. Test the application';
        RAISE NOTICE '2. Create a test project';
        RAISE NOTICE '3. Generate some content';
        RAISE NOTICE '4. Verify everything works';
    ELSE
        RAISE NOTICE '⚠️  SOME CHECKS FAILED!';
        RAISE NOTICE '';
        RAISE NOTICE 'Please review the errors above and:';
        RAISE NOTICE '1. Re-run the schema.sql file';
        RAISE NOTICE '2. Check for any error messages';
        RAISE NOTICE '3. Contact support if issues persist';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
END $$;
