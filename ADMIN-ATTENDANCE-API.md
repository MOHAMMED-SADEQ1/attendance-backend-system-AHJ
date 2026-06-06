# Attendance System — توثيق API لوحة تحكم المدير

> **Base URL:** `http://localhost:3000/api`  
> **المصادقة:** `Bearer <token>` في Header  
> **Admin فقط:** المسارات التي تتطلب `ADMIN`  
> **Admin/Manager:** مسارات يشترك فيها المدير ومساعديه  
> **تنسيق الساعات:** الاستجابة تعرض الساعات بنظام 60 (مثلاً `"8.30"` = 8 ساعات و30 دقيقة). عند الإرسال (PATCH) يُستخدم النظام العشري (مثلاً `8.50` = 8.5 ساعة).

---

## 0. المصادقة (Auth)

### POST /auth/login
تسجيل دخول المدير.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "employee": {
    "id": 1,
    "employeeCode": "ADM001",
    "fullName": "المدير العام",
    "email": "admin@example.com",
    "role": "ADMIN",
    "departmentId": 1
  }
}
```

**الأخطاء:** `401` البريد أو كلمة المرور غير صحيحة

### GET /auth/profile
عرض بيانات المستخدم الحالي — يستخدم للتحقق من صحة التوكن.

### POST /auth/logout
تسجيل خروج وإنهاء الجلسة.

### PATCH /auth/password
تغيير كلمة المرور الشخصية (للمستخدم المسجل حالياً).
- **الصلاحية:** أي مستخدم مسجل (ADMIN, MANAGER, EMPLOYEE)

**Request:**
```json
{
  "currentPassword": "قديم123",
  "newPassword": "جديد456"
}
```

**Response 200:**
```json
{
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

**الأخطاء:** `401` كلمة المرور الحالية غير صحيحة

---

## 1. 📊 لوحة التحكم (Dashboard)

### GET /admin/dashboard/stats
إحصائيات عامة.
- **الصلاحية:** ADMIN, MANAGER

**Response:**
```json
{
  "totalEmployees": 10,
  "activeEmployees": 8,
  "inactiveEmployees": 2,
  "managers": 2,
  "pendingLeaves": 3
}
```

### GET /admin/dashboard/today
ملخص اليوم.
- **الصلاحية:** ADMIN, MANAGER

**Response:**
```json
{
  "date": "2026-05-23",
  "totalActiveEmployees": 8,
  "pendingLeaves": 3
}
```

---

## 2. 👥 الموظفين (Employees)

### GET /employees
قائمة جميع الموظفين.
- **الصلاحية:** ADMIN, MANAGER
- **ملاحظة:** MANAGER لا يرى موظفين بصلاحية ADMIN

### GET /employees/:id
عرض موظف معين.
- **الصلاحية:** ADMIN يشاهد الجميع، MANAGER يرى مرؤوسيه، EMPLOYEE نفسه فقط

### POST /admin/employees
إضافة موظف جديد.
- **الصلاحية:** ADMIN, MANAGER
- **ملاحظة:** MANAGER يمكنه إضافة موظفين بصلاحية EMPLOYEE فقط (لا يمكنه إضافة ADMIN أو MANAGER)

**Request:**
```json
{
  "employeeCode": "EMP003",
  "fullName": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "0501234567",
  "password": "123456",
  "role": "EMPLOYEE",
  "departmentId": 1,
  "shiftPolicyId": 1,
  "managerId": 1,
  "hireDate": "2026-05-16",
  "offDays": "FRIDAY,SATURDAY"
}
```

| الحقل | النوع | إجباري | الوصف |
|-------|-------|--------|-------|
| employeeCode | string | ✅ | كود الموظف الفريد |
| fullName | string | ✅ | الاسم الكامل |
| email | string | ✅ | البريد الإلكتروني (فريد) |
| password | string | ✅ | كلمة المرور (6 أحرف) |
| hireDate | string | ✅ | تاريخ التعيين `YYYY-MM-DD` |
| phone | string | | رقم الجوال |
| role | string | | `ADMIN`, `MANAGER`, `EMPLOYEE` |
| departmentId | number | | معرف القسم |
| shiftPolicyId | number | | معرف سياسة الدوام |
| managerId | number | | معرف المدير المباشر |
| offDays | string | | أيام الإجازة الأسبوعية `FRIDAY` أو `FRIDAY,SATURDAY` |

### PATCH /admin/employees/:id
تعديل بيانات موظف.
- **الصلاحية:** ADMIN, MANAGER
- **ملاحظة:** MANAGER لا يمكنه تعديل موظف ADMIN أو MANAGER ولا تعيين صلاحية ADMIN أو MANAGER
- إرسال الحقول المراد تعديلها فقط (كلها اختيارية)

### DELETE /admin/employees/:id
حذف موظف.
- **الصلاحية:** ADMIN فقط

### PATCH /admin/employees/:id/toggle-active
تفعيل/إيقاف حساب موظف.
- **الصلاحية:** ADMIN فقط

### PATCH /admin/employees/:id/password
إعادة تعيين كلمة مرور موظف.
- **الصلاحية:** ADMIN, MANAGER
- **ملاحظة:** MANAGER لا يمكنه إعادة تعيين كلمة مرور ADMIN أو MANAGER

**Request:**
```json
{
  "password": "جديد456"
}
```

**Response 200:**
```json
{
  "message": "تم إعادة تعيين كلمة المرور بنجاح"
}
```

---

## 3. 🏢 الأقسام (Departments)

### GET /admin/departments
قائمة الأقسام.
- **الصلاحية:** ADMIN, MANAGER

### GET /admin/departments/:id
عرض قسم معين.
- **الصلاحية:** ADMIN, MANAGER

### POST /admin/departments
إضافة قسم جديد.
- **الصلاحية:** ADMIN فقط

**Request:**
```json
{
  "name": "تقنية المعلومات",
  "managerId": 1
}
```

### PATCH /admin/departments/:id
تعديل قسم.
- **الصلاحية:** ADMIN فقط

### DELETE /admin/departments/:id
حذف قسم.
- **الصلاحية:** ADMIN فقط

---

## 4. ⏰ سياسات الدوام (Shift Policies)

### GET /admin/shift-policies
قائمة سياسات الدوام.
- **الصلاحية:** ADMIN, MANAGER

### GET /admin/shift-policies/:id
عرض سياسة معينة.
- **الصلاحية:** ADMIN, MANAGER

### POST /admin/shift-policies
إضافة سياسة دوام.
- **الصلاحية:** ADMIN فقط

**Request:**
```json
{
  "name": "صباحي",
  "startTime": "08:00",
  "endTime": "16:00",
  "graceMinutes": 10,
  "breakDuration": 60
}
```

| الحقل | النوع | إجباري | الوصف |
|-------|-------|--------|-------|
| name | string | ✅ | اسم السياسة |
| startTime | string | ✅ | وقت البداية (HH:mm) |
| endTime | string | ✅ | وقت النهاية (HH:mm) |
| graceMinutes | number | | هامش التأخير (default: 10) |
| breakDuration | number | | مدة الاستراحة دقيقة (default: 60) |

### PATCH /admin/shift-policies/:id
تعديل سياسة دوام.
- **الصلاحية:** ADMIN فقط

### DELETE /admin/shift-policies/:id
حذف سياسة دوام.
- **الصلاحية:** ADMIN فقط

---

## 5. 📱 مواقع QR (QR Locations)

### GET /admin/qr-locations
قائمة مواقع QR.
- **الصلاحية:** ADMIN, MANAGER

### GET /admin/qr-locations/:id
عرض موقع معين.
- **الصلاحية:** ADMIN, MANAGER

### POST /admin/qr-locations
إضافة موقع QR جديد.
- **الصلاحية:** ADMIN فقط

**Request:**
```json
{
  "locationName": "المدخل الرئيسي",
  "locationCode": "MAIN_GATE",
  "qrValue": "qr_main_gate_2026_xyz789",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "allowedNetworkSsid": "Company_WiFi",
  "isActive": true
}
```

### PATCH /admin/qr-locations/:id
تعديل موقع QR.
- **الصلاحية:** ADMIN فقط

### DELETE /admin/qr-locations/:id
حذف موقع QR.
- **الصلاحية:** ADMIN فقط

---

## 6. ✓ سجل الحضور (Attendance Sessions)

### GET /admin/attendance
سجل الحضور مع فلترة.
- **الصلاحية:** ADMIN, MANAGER

**Parameters:**
```
?page=1&limit=20&employeeId=1&date=2026-05-16&status=PRESENT
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "date": "2026-05-16",
      "checkInTime": "2026-05-16T08:00:00.000Z",
      "checkInMethod": "QR_DYNAMIC",
      "checkOutTime": "2026-05-16T17:00:00.000Z",
      "checkOutMethod": "QR_DYNAMIC",
      "status": "PRESENT",
      "calculatedHours": "8.00",
      "overtimeHours": "0.00",
      "notes": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

**حالات status:** `PRESENT`, `ABSENT`, `LATE`, `EARLY_LEAVE`, `VACATION`

### GET /admin/attendance/session/:id
عرض جلسة حضور معينة.
- **الصلاحية:** ADMIN, MANAGER

### PATCH /admin/attendance/session/:id
تعديل جلسة حضور.
- **الصلاحية:** ADMIN, MANAGER

**Request:**
```json
{
  "status": "LATE",
  "notes": "تأخر 15 دقيقة بعذر",
  "calculatedHours": 7.5
}
```
> **ملاحظة:** الـ `calculatedHours` عند الإرسال (PATCH) يُرسل بنظام 100 العشري (`7.50` = 7.5 ساعة). الاستجابة تكون بنظام 60 (`"7.30"`).

---

## 7. 📈 تقرير الحضور (Report)

### GET /admin/attendance/report
تقرير حضور شامل لكل موظف مع إحصائيات لكل يوم.
- **الصلاحية:** ADMIN, MANAGER
- **ملاحظة:** لا ينشئ سجلات — يحسب وقت الطلب من بيانات الحضور

**Parameters:**
```
?page=1&limit=100&employeeName=أحمد&startDate=2026-05-01&endDate=2026-05-31
```

| المعامل | النوع | افتراضي | الوصف |
|---------|-------|---------|-------|
| employeeId | number | - | معرف موظف محدد |
| employeeName | string | - | بحث باسم الموظف |
| startDate | string | أول الشهر | `YYYY-MM-DD` |
| endDate | string | اليوم | `YYYY-MM-DD` |
| page | number | 1 | رقم الصفحة |
| limit | number | 20 | حد أقصى 100 |

**Response:**
```json
{
  "startDate": "2026-05-01",
  "endDate": "2026-05-31",
  "totalDays": 31,
  "page": 1,
  "limit": 100,
  "totalPages": 1,
  "data": [
    {
      "employeeId": 1,
      "employeeName": "أحمد محمد",
      "present": 18,
      "late": 2,
      "absent": 1,
      "weeklyOff": 4,
      "publicHoliday": 4,
      "onLeave": 2,
      "totalHours": "152.30"
    }
  ],
  "days": [
    {
      "employeeId": 1,
      "employeeName": "أحمد محمد",
      "date": "2026-05-01",
      "dayName": "الجمعة",
      "type": "WEEKLY_OFF",
      "display": "🟢 إجازة أسبوعية",
      "reason": "إجازة أسبوعية (الجمعة)",
      "checkInTime": null,
      "checkOutTime": null,
      "calculatedHours": null
    }
  ]
}
```

**تصنيفات اليوم:**

| type | display | المعنى |
|------|---------|--------|
| PRESENT | ✅ حاضر | ضمن المهلة |
| LATE | ⚠️ متأخر | بعد المهلة |
| WEEKLY_OFF | 🟢 إجازة أسبوعية | ضمن offDays |
| PUBLIC_HOLIDAY | 🟣 عطلة رسمية | ضمن holidays |
| ON_LEAVE | 🔵 إجازة سنوية | طلب إجازة معتمد |
| ABSENT | ❌ غياب | بدون عذر |

---

## 8. 🎉 العطل الرسمية (Holidays)

### GET /admin/holidays
قائمة جميع العطل الرسمية.
- **الصلاحية:** ADMIN, MANAGER

### GET /admin/holidays/:id
عرض عطلة معينة.
- **الصلاحية:** ADMIN, MANAGER

### POST /admin/holidays
إضافة عطلة جديدة.
- **الصلاحية:** ADMIN فقط

**Request:**
```json
{
  "name": "عيد الفطر",
  "startDate": "2026-04-01",
  "endDate": "2026-04-04",
  "isRecurring": false
}
```

| الحقل | النوع | إجباري | الوصف |
|-------|-------|--------|-------|
| name | string | ✅ | اسم العطلة |
| startDate | string | ✅ | تاريخ البداية `YYYY-MM-DD` |
| endDate | string | ✅ | تاريخ النهاية `YYYY-MM-DD` |
| isRecurring | boolean | | هل تتكرر سنوياً (للأعياد) |

### PATCH /admin/holidays/:id
تعديل عطلة.
- **الصلاحية:** ADMIN فقط

### DELETE /admin/holidays/:id
حذف عطلة.
- **الصلاحية:** ADMIN فقط

**تأثيرها:** الموظف لا يستطيع تسجيل حضور في يوم عطلة رسمية، وتظهر في تقرير الحضور بتصنيف `PUBLIC_HOLIDAY`.

---

## 9. 📋 طلبات الإجازات (Leave Requests)

### GET /admin/leaves
جميع طلبات الإجازات.
- **الصلاحية:** ADMIN جميع الطلبات، MANAGER طلبات مرؤوسيه

### GET /admin/leaves/pending
الطلبات المعلقة فقط.
- **الصلاحية:** ADMIN, MANAGER

### PATCH /admin/leaves/:id/approve
الموافقة على طلب إجازة.
- **الصلاحية:** ADMIN, MANAGER

### PATCH /admin/leaves/:id/reject
رفض طلب إجازة.
- **الصلاحية:** ADMIN, MANAGER

---

## 10. 📝 سجل التدقيق (Audit Logs)

### GET /admin/audit-logs
سجل جميع عمليات النظام (للقراءة فقط).
- **الصلاحية:** ADMIN فقط

**Parameters:**
```
?page=1&limit=50&employeeId=1&action=LOGIN_SUCCESS
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "action": "LOGIN_SUCCESS",
      "details": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-05-16T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

**أمثلة actions:** `CHECK_IN`, `CHECK_OUT`, `GENERATE_QR_CHECK_IN`, `GENERATE_QR_CHECK_OUT`, `LOGIN_SUCCESS`, `LOGIN_FAILED`

### GET /admin/audit-logs/:id
عرض سجل معين.
- **الصلاحية:** ADMIN فقط

---

## 11. 🔐 جلسات المستخدمين (User Sessions)

### GET /admin/sessions
عرض جميع الجلسات النشطة.
- **الصلاحية:** ADMIN فقط

**Parameters:**
```
?page=1&limit=20
```

### DELETE /admin/sessions/:id
إنهاء جلسة مستخدم (Force Logout).
- **الصلاحية:** ADMIN فقط

---

## 12. ⚙️ الإعدادات (Settings)

### GET /admin/settings
عرض جميع الإعدادات.
- **الصلاحية:** ADMIN, MANAGER (قراءة فقط)

**Response:**
```json
[
  {
    "id": 1,
    "settingKey": "qr_token_expiry_seconds",
    "settingValue": "30",
    "description": "صلاحية رمز QR الديناميكي بالثواني"
  },
  {
    "id": 2,
    "settingKey": "allow_gps_outside",
    "settingValue": "false",
    "description": "السماح بتسجيل الحضور عبر GPS خارج نطاق الشركة؟"
  },
  {
    "id": 3,
    "settingKey": "default_shift_policy_id",
    "settingValue": "1",
    "description": "سياسة الدوام الافتراضية للموظفين الجدد"
  }
]
```

### PATCH /admin/settings/:key
تعديل إعداد معين.
- **الصلاحية:** ADMIN فقط

**Request:**
```json
{
  "value": "60"
}
```

---

## ملخص الصلاحيات

| المسار | ADMIN | MANAGER |
|--------|-------|---------|
| `POST /auth/login` | ✅ | ✅ |
| `POST /auth/logout` | ✅ | ✅ |
| `GET /auth/profile` | ✅ | ✅ |
| `PATCH /auth/password` | ✅ | ✅ |
| `GET /admin/dashboard/stats` | ✅ | ✅ |
| `GET /admin/dashboard/today` | ✅ | ✅ |
| `GET /employees` | ✅ | ✅ |
| `GET /employees/:id` | ✅ | ✅ (مرؤوسيه) |
| `POST /admin/employees` | ✅ | ✅ (EMPLOYEE فقط) |
| `PATCH /admin/employees/:id` | ✅ | ✅ (ليس ADMIN/MANAGER) |
| `DELETE /admin/employees/:id` | ✅ | ❌ |
| `PATCH /admin/employees/:id/toggle-active` | ✅ | ❌ |
| `PATCH /admin/employees/:id/password` | ✅ | ✅ (ليس ADMIN/MANAGER) |
| `GET /admin/departments` | ✅ | ✅ |
| `GET /admin/departments/:id` | ✅ | ✅ |
| `POST /admin/departments` | ✅ | ❌ |
| `PATCH /admin/departments/:id` | ✅ | ❌ |
| `DELETE /admin/departments/:id` | ✅ | ❌ |
| `GET /admin/shift-policies` | ✅ | ✅ |
| `GET /admin/shift-policies/:id` | ✅ | ✅ |
| `POST /admin/shift-policies` | ✅ | ❌ |
| `PATCH /admin/shift-policies/:id` | ✅ | ❌ |
| `DELETE /admin/shift-policies/:id` | ✅ | ❌ |
| `GET /admin/qr-locations` | ✅ | ✅ |
| `GET /admin/qr-locations/:id` | ✅ | ✅ |
| `POST /admin/qr-locations` | ✅ | ❌ |
| `PATCH /admin/qr-locations/:id` | ✅ | ❌ |
| `DELETE /admin/qr-locations/:id` | ✅ | ❌ |
| `GET /admin/attendance` | ✅ | ✅ |
| `GET /admin/attendance/session/:id` | ✅ | ✅ |
| `PATCH /admin/attendance/session/:id` | ✅ | ✅ |
| `GET /admin/attendance/report` | ✅ | ✅ |
| `POST /admin/attendance/generate-qr` | ✅ | ❌ |
| `GET /admin/attendance/qr-status/:id` | ✅ | ❌ |
| `GET /admin/leaves` | ✅ الكل | ✅ مرؤوسيه |
| `GET /admin/leaves/pending` | ✅ | ✅ |
| `PATCH /admin/leaves/:id/approve` | ✅ | ✅ |
| `PATCH /admin/leaves/:id/reject` | ✅ | ✅ |
| `GET /admin/audit-logs` | ✅ | ❌ |
| `GET /admin/audit-logs/:id` | ✅ | ❌ |
| `GET /admin/holidays` | ✅ | ✅ |
| `GET /admin/holidays/:id` | ✅ | ✅ |
| `POST /admin/holidays` | ✅ | ❌ |
| `PATCH /admin/holidays/:id` | ✅ | ❌ |
| `DELETE /admin/holidays/:id` | ✅ | ❌ |
| `GET /admin/sessions` | ✅ | ❌ |
| `DELETE /admin/sessions/:id` | ✅ | ❌ |
| `GET /admin/settings` | ✅ | ✅ |
| `PATCH /admin/settings/:key` | ✅ | ❌ |
