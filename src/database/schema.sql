-- إنشاء قاعدة البيانات


-- 1. جدول الأقسام
CREATE TABLE departments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manager_id INT UNSIGNED NULL COMMENT 'معرف المدير (من جدول employees)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول سياسات الدوام (الشفتات)
CREATE TABLE shift_policies (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT 'مثال: صباحي، مسائي، مرن',
    start_time TIME NOT NULL COMMENT 'وقت بدء الدوام الرسمي',
    end_time TIME NOT NULL COMMENT 'وقت انتهاء الدوام الرسمي',
    grace_minutes INT UNSIGNED DEFAULT 10 COMMENT 'هامش سماح بالدقائق قبل احتساب تأخير',
    break_duration INT UNSIGNED DEFAULT 60 COMMENT 'مدة الاستراحة بالدقائق',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول الموظفين (يرتبط بالأقسام وسياسة الدوام)
CREATE TABLE employees (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'كود الموظف الفريد',
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL COMMENT 'تخزين كلمة المرور بشكل آمن',
    role ENUM('ADMIN', 'MANAGER', 'EMPLOYEE') DEFAULT 'EMPLOYEE' NOT NULL COMMENT 'دور المستخدم',
    department_id INT UNSIGNED NULL,
    shift_policy_id INT UNSIGNED NULL,
    manager_id INT UNSIGNED NULL COMMENT 'المدير المباشر (يشير إلى id في نفس الجدول)',
    hire_date DATE NOT NULL,
    qr_static_token VARCHAR(255) UNIQUE NULL COMMENT 'رمز QR ثابت للموظف (احتياطي)',
    is_active BOOLEAN DEFAULT TRUE,
    off_days VARCHAR(100) NULL COMMENT 'أيام الإجازة الأسبوعية مثال: FRIDAY أو WEDNESDAY,THURSDAY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (shift_policy_id) REFERENCES shift_policies(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_code (employee_code),
    INDEX idx_email (email)
);

-- إضافة المفتاح الخارجي manager_id في جدول departments (لأن المدير موجود في employees)
ALTER TABLE departments
ADD FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 4. جدول المواقع الثابتة (رموز QR المعلقة عند المداخل أو المكاتب)
CREATE TABLE qr_static_locations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL COMMENT 'مثال: المدخل الرئيسي، مكتب المدير',
    location_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'كود قصير للربط',
    qr_value VARCHAR(255) UNIQUE NOT NULL COMMENT 'قيمة رمز QR الثابت (نص عشوائي طويل)',
    latitude DECIMAL(10,8) NULL COMMENT 'خط العرض (للموقع)',
    longitude DECIMAL(11,8) NULL COMMENT 'خط الطول',
    allowed_network_ssid VARCHAR(100) NULL COMMENT 'شبكة واي فاي المسموحة (اختياري)',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. جدول جلسات الحضور والانصراف
CREATE TABLE attendance_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED NOT NULL,
    date DATE NOT NULL COMMENT 'تاريخ يوم التسجيل',
    check_in_time TIMESTAMP NULL COMMENT 'توقيت الحضور',
    check_in_method ENUM('QR_DYNAMIC', 'QR_STATIC', 'MANUAL', 'GPS') NULL,
    check_in_location_id INT UNSIGNED NULL COMMENT 'معرف الموقع (من qr_static_locations) إذا تم المسح',
    check_in_qr_value VARCHAR(255) NULL COMMENT 'قيمة QR المستخدمة وقت الحضور (للتتبع)',
    check_out_time TIMESTAMP NULL COMMENT 'توقيت الانصراف',
    check_out_method ENUM('QR_DYNAMIC', 'QR_STATIC', 'MANUAL', 'GPS') NULL,
    check_out_location_id INT UNSIGNED NULL,
    check_out_qr_value VARCHAR(255) NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'VACATION') DEFAULT 'ABSENT',
    calculated_hours DECIMAL(5,2) NULL COMMENT 'عدد ساعات العمل الفعلية بعد خصم الاستراحة',
    overtime_hours DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (check_in_location_id) REFERENCES qr_static_locations(id) ON DELETE SET NULL,
    FOREIGN KEY (check_out_location_id) REFERENCES qr_static_locations(id) ON DELETE SET NULL,
    INDEX idx_date (date),
    INDEX idx_employee_date (employee_id, date)
);

-- 6. جدول الرموز الديناميكية المؤقتة (للجلسات القصيرة)
CREATE TABLE qr_dynamic_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL COMMENT 'قيمة عشوائية فريدة للرمز',
    expires_at TIMESTAMP NOT NULL COMMENT 'تنتهي بعد 30 ثانية مثلاً',
    used BOOLEAN DEFAULT FALSE COMMENT 'هل تم استخدام الرمز فعلاً؟',
    purpose ENUM('CHECK_IN', 'CHECK_OUT') DEFAULT 'CHECK_IN',
    scan_error VARCHAR(255) NULL COMMENT 'رسالة الخطأ إذا فشلت عملية المسح (لشاشة الشركة)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- 7. جدول طلبات الإجازات والأذونات
CREATE TABLE leave_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED NOT NULL,
    leave_type ENUM('ANNUAL', 'SICK', 'EMERGENCY', 'UNPAID', 'OTHER') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    approved_by INT UNSIGNED NULL COMMENT 'معرف المدير الذي وافق',
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- 8. جدول العطل الرسمية (للشركة ككل)
CREATE TABLE IF NOT EXISTS holidays (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'اسم العطلة مثال: عيد الفطر، اليوم الوطني',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE COMMENT 'هل تتكرر سنوياً؟ (للأعياد)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dates (start_date, end_date)
);

-- 10. جدول سجل التدقيق (Audit Log) لجميع عمليات الحضور والرموز
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED NULL,
    action VARCHAR(50) NOT NULL COMMENT 'مثال: CHECK_IN, CHECK_OUT, QR_GENERATED, LOGIN_FAILED',
    details JSON NULL COMMENT 'تفاصيل إضافية مثل IP، جهاز، قيمة QR، معرف قارئ',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_action (employee_id, action),
    INDEX idx_created (created_at)
);

-- 11. جدول الإعدادات العامة للنظام (اختياري)
CREATE TABLE system_settings (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NULL,
    description TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- إدخال بعض الإعدادات الافتراضية
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('qr_token_expiry_seconds', '30', 'صلاحية رمز QR الديناميكي بالثواني'),
('allow_gps_outside', 'false', 'السماح بتسجيل الحضور عبر GPS خارج نطاق الشركة؟'),
('default_shift_policy_id', '1', 'سياسة الدوام الافتراضية للموظفين الجدد');

-- 12. جدول الجلسات النشطة (لإدارة توكنات JWT مثلاً)
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED NOT NULL,
    jwt_token VARCHAR(500) NOT NULL,
    device_id VARCHAR(255) NULL COMMENT 'معرف فريد للجهاز',
    ip_address VARCHAR(45) NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_token (jwt_token(255)),
    INDEX idx_expires (expires_at)
);