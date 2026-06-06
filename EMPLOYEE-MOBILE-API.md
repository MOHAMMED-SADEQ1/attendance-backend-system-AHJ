# 📱 توثيق API تطبيق الموظف
## Employee Mobile App — Full API Reference

> **آخر تحديث:** 2026-05-23  
> **Base URL:** `http://localhost:3000`  
> **الميزة الجديدة:** 🆗 **جلسات متعددة في اليوم** — حضور ← انصراف ← حضور ← انصراف (مسموح)
> **المنطقة الزمنية:** جميع التواريخ بتوقيت **آسيا/الرياض (+03:00)** وليس UTC 

---

## 📑 الفهرس

- [1. تسجيل الدخول (Login)](#1-تسجيل-الدخول-login)
- [2. الملف الشخصي (Profile)](#2-الملف-الشخصي-profile)
- [3. تسجيل حضور (Check-In)](#3-تسجيل-حضور-check-in)
- [4. تسجيل انصراف (Check-Out)](#4-تسجيل-انصراف-check-out)
- [5. حالة اليوم (Today)](#5-حالة-اليوم-today)
- [6. سجل الحضور (History)](#6-سجل-الحضور-history)
- [7. تسجيل الخروج (Logout)](#7-تسجيل-الخروج-logout)
- [8. تغيير كلمة المرور (Change Password)](#8-تغيير-كلمة-المرور-change-password)
- [9. تعديل البريد الإلكتروني (Update Email)](#9-تعديل-البريد-الإلكتروني-update-email)
- [10. طلبات الإجازات (Leave Requests)](#10-طلبات-الإجازات-leave-requests)
- [11. استخدام التوكن](#11-استخدام-التوكن)
- [12. Flow التطبيق كامل](#12-flow-التطبيق-كامل)
- [13. معالجة الأخطاء في Flutter](#13-معالجة-الأخطاء-في-flutter)

---

## 1. تسجيل الدخول (Login)

```
POST /auth/login
Content-Type: application/json
```

### الطلب (Request)
```json
{
  "email": "employee@example.com",
  "password": "123456"
}
```

| الحقل | النوع | مطلوب | الطول | الوصف |
|-------|-------|-------|-------|-------|
| `email` | string | ✅ | - | البريد الإلكتروني للموظف |
| `password` | string | ✅ | 6 أحرف كحد أدنى | كلمة المرور |

### الاستجابة عند النجاح (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "employee": {
    "id": 5,
    "employeeCode": "EMP005",
    "fullName": "أحمد محمد",
    "email": "employee@example.com",
    "role": "EMPLOYEE",
    "departmentId": 2
  }
}
```

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `access_token` | string | JWT Token — **دائم لا ينتهي أبداً** |
| `employee.id` | number | معرف الموظف (رقم فريد) |
| `employee.employeeCode` | string | كود الموظف (مثال: EMP005) |
| `employee.fullName` | string | الاسم الكامل |
| `employee.email` | string | البريد الإلكتروني |
| `employee.role` | string | `EMPLOYEE` أو `MANAGER` أو `ADMIN` |
| `employee.departmentId` | number/null | معرف القسم |

### الأخطاء

| كود HTTP | Response | السبب |
|----------|----------|-------|
| **401** | `{"message": "البريد الإلكتروني أو كلمة المرور غير صحيحة"}` | إيميل أو كلمة مرور خاطئة |
| **401** | `{"message": "الحساب موقوف، تواصل مع المسؤول"}` | الحساب غير نشط |

---

## 2. الملف الشخصي (Profile)

```
GET /auth/profile
Authorization: Bearer <access_token>
```

### الاستجابة عند النجاح (200 OK)
```json
{
  "id": 5,
  "employeeCode": "EMP005",
  "fullName": "أحمد محمد",
  "email": "employee@example.com",
  "phone": "0555123456",
  "role": "EMPLOYEE",
  "departmentId": 2,
  "shiftPolicyId": 1,
  "hireDate": "2025-01-15",
  "isActive": true
}
```

### PATCH /auth/profile
تعديل البريد الإلكتروني الشخصي.
- **الصلاحية:** أي مستخدم مسجل (ADMIN, MANAGER, EMPLOYEE)

**Request:**
```json
{
  "email": "newemail@example.com"
}
```

**Response 200:**
```json
{
  "message": "تم تحديث البريد الإلكتروني بنجاح"
}
```

**الأخطاء:**

| كود | `message` | السبب |
|-----|-----------|-------|
| **409** | `{"message": "البريد الإلكتروني مستخدم مسبقاً"}` | الإيميل مستخدم من قبل موظف آخر |

---

## 3. تسجيل حضور (Check-In)

```
POST /attendance/check-in
Content-Type: application/json
Authorization: Bearer <access_token>
```

### الطلب (Request)
```json
{
  "qrCode": "2c42b06a8e6089083714807eb2a8a418e0dc4416f879fd125b951c88b852fa5d"
}
```

| الحقل | النوع | مطلوب | الوصف |
|-------|-------|-------|-------|
| `qrCode` | string | ✅ | رمز الباركود الممسوح ضوئياً (64 حرف سداسي عشري) |

### الاستجابة عند النجاح (201 Created)
```json
{
  "message": "تم تسجيل الحضور بنجاح",
  "session": {
    "id": 15,
    "employeeId": 5,
    "date": "2026-05-16",
    "checkInTime": "2026-05-16T08:02:00.000+03:00",
    "checkInMethod": "QR_DYNAMIC",
    "checkInQrValue": "2c42b06a...",
    "checkOutTime": null,
    "checkOutMethod": null,
    "checkOutQrValue": null,
    "status": "PRESENT",
    "calculatedHours": null,
    "overtimeHours": "0.00",
    "notes": null
  }
}
```

| الحقل | النوع | المثال | الوصف |
|-------|-------|--------|-------|
| `status` | string | `"PRESENT"` | ضمن المهلة |
| | | `"LATE"` | بعد المهلة |
| `checkInMethod` | string | `"QR_DYNAMIC"` | طريقة تسجيل الحضور |
| `calculatedHours` | string/null | `null` | null قبل الانصراف |
| `overtimeHours` | string | `"0.00"` | ساعات إضافية (نظام 60) |

### الأخطاء

| كود | `message` | السبب |
|-----|-----------|-------|
| **400** | `رمز QR غير صالح` | الـ QR غير موجود في النظام |
| **400** | `تم استخدام رمز QR من قبل` | الـ QR استخدم سابقاً (مرة واحدة فقط) |
| **400** | `انتهت صلاحية رمز QR` | الـ QR عمره أكثر من 30 ثانية |
| **400** | `هذا الرمز مخصص للانصراف وليس الحضور` | مسحت QR انصراف بدلاً من حضور |
| **400** | `أنت مسجل حضور حالياً، يرجى تسجيل انصراف أولاً` | الموظف مسجل حضور ولم ينصرف بعد |

> 💡 **جلسات متعددة مسموحة:** يمكن للموظف تسجيل حضور وانصراف أكثر من مرة في اليوم الواحد (حضور ← انصراف ← حضور ← انصراف).

---

## 4. تسجيل انصراف (Check-Out)

```
POST /attendance/check-out
Content-Type: application/json
Authorization: Bearer <access_token>
```

### الطلب (Request)
```json
{
  "qrCode": "e03bd667beb0240c277ebfb1738fa63fddfa9885e56d39ced2f69b772bd51bcc"
}
```

### الاستجابة عند النجاح (201 Created)
```json
{
  "message": "تم تسجيل الانصراف بنجاح",
  "session": {
    "id": 15,
    "employeeId": 5,
    "date": "2026-05-16",
    "checkInTime": "2026-05-16T08:00:00.000+03:00",
    "checkInMethod": "QR_DYNAMIC",
    "checkInQrValue": "2c42b06a...",
    "checkOutTime": "2026-05-16T17:00:00.000+03:00",
    "checkOutMethod": "QR_DYNAMIC",
    "checkOutQrValue": "e03bd667...",
    "status": "PRESENT",
    "calculatedHours": "8.00",
    "overtimeHours": "0.00",
    "notes": null
  }
}
```

| الحقل | الوصف |
|-------|--------|
| `calculatedHours` | ساعات العمل بنظام 60 (مثال: `"8.30"` = 8 ساعات و30 دقيقة) |
| `checkOutMethod` | دائماً `QR_DYNAMIC` |

### الأخطاء

| كود | `message` | السبب |
|-----|-----------|-------|
| **400** | `رمز QR غير صالح` | الـ QR غير موجود |
| **400** | `تم استخدام رمز QR من قبل` | الـ QR استخدم سابقاً |
| **400** | `انتهت صلاحية رمز QR` | الـ QR انتهت صلاحيته |
| **400** | `هذا الرمز مخصص للحضور وليس الانصراف` | مسحت QR حضور بدلاً من انصراف |
| **400** | `يجب تسجيل الحضور أولاً` | الموظف لم يسجل حضور اليوم (أو سجل وانصرف بالفعل) |

---

## 5. حالة اليوم (Today)

```
GET /attendance/today
Authorization: Bearer <access_token>
```

> ⚠️ **هذا المسار يعيد أحدث جلسة لليوم.** في حالة وجود جلسات متعددة، سيعيد أحدثها.

### السيناريو 1 — لم يسجل حضور بعد
```json
200 OK
{
  "session": null
}
```
**حالة الزر:** حضور ← مفعل، انصراف ← معطل

### السيناريو 2 — سجل حضور فقط (لم ينصرف)
```json
200 OK
{
  "session": {
    "id": 15,
    "employeeId": 5,
    "date": "2026-05-19",
    "checkInTime": "2026-05-19T08:00:00.000+03:00",
    "checkOutTime": null,
    "status": "PRESENT",
    "calculatedHours": null,
    "overtimeHours": "0.00"
  }
}
```
**حالة الزر:** حضور ← معطل، انصراف ← مفعل

### السيناريو 3 — اكتمل اليوم (حضور + انصراف)
```json
200 OK
{
  "session": {
    "id": 18,
    "employeeId": 5,
    "date": "2026-05-19",
    "checkInTime": "2026-05-19T13:00:00.000+03:00",
    "checkOutTime": "2026-05-19T17:00:00.000+03:00",
    "status": "PRESENT",
    "calculatedHours": "4.00",
    "overtimeHours": "0.00"
  }
}
```
**حالة الزر:** حضور ← مفعل (يمكنه تسجيل حضور مرة أخرى)، انصراف ← معطل

> 💡 **الموظف يمكنه تسجيل أكثر من جلسة في اليوم.** فقط يشترط أن ينهي الجلسة الحالية (انصراف) قبل بدء جلسة جديدة (حضور).

---

## 6. سجل الحضور (History)

```
GET /attendance/history?page=1&limit=20
Authorization: Bearer <access_token>
```

### Parameters

| المعامل | النوع | الافتراضي | الوصف |
|---------|-------|-----------|-------|
| `page` | number | `1` | رقم الصفحة |
| `limit` | number | `20` | عدد السجلات لكل صفحة (1-100) |

### الاستجابة (200 OK)
```json
{
  "data": [
    {
      "id": 18,
      "employeeId": 5,
      "date": "2026-05-19",
      "checkInTime": "2026-05-19T13:00:00.000Z",
      "checkOutTime": "2026-05-19T17:00:00.000Z",
      "status": "PRESENT",
      "calculatedHours": "4.00",
      "overtimeHours": "0.00"
    },
    {
      "id": 17,
      "employeeId": 5,
      "date": "2026-05-19",
      "checkInTime": "2026-05-19T08:00:00.000Z",
      "checkOutTime": "2026-05-19T12:00:00.000Z",
      "status": "PRESENT",
      "calculatedHours": "4.00",
      "overtimeHours": "0.00"
    },
    {
      "id": 16,
      "employeeId": 5,
      "date": "2026-05-18",
      "checkInTime": "2026-05-18T08:00:00.000Z",
      "checkOutTime": "2026-05-18T17:00:00.000Z",
      "status": "PRESENT",
      "calculatedHours": "8.00",
      "overtimeHours": "0.00"
    }
  ],
  "total": 43,
  "page": 1,
  "limit": 20
}
```

> 💡 **جلسات متعددة:** يظهر التاريخ الواحد (مثلاً `2026-05-19`) أكثر من سجل إذا سجل الموظف أكثر من حضور وانصراف في نفس اليوم.
```

| الحقل | الوصف |
|-------|-------|
| `data` | مصفوفة السجلات لهذه الصفحة |
| `total` | إجمالي عدد السجلات |
| `page` | الصفحة الحالية |
| `limit` | عدد السجلات في الصفحة |

### قيم `status`

| القيمة | المعنى |
|--------|--------|
| `PRESENT` | ✅ حاضر (ضمن المهلة) |
| `ABSENT` | ❌ غائب |
| `LATE` | ⚠️ متأخر |
| `EARLY_LEAVE` | 🚶 انصراف مبكر |
| `VACATION` | 🏖️ إجازة |

---

## 7. تسجيل الخروج (Logout)

```
POST /auth/logout
Authorization: Bearer <access_token>
```

### الاستجابة (200 OK)
```json
{
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

## 8. تغيير كلمة المرور (Change Password)

```
PATCH /auth/password
Authorization: Bearer <access_token>
Content-Type: application/json
```

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

**الأخطاء:**

| كود | `message` | السبب |
|-----|-----------|-------|
| **401** | `{"message": "كلمة المرور الحالية غير صحيحة"}` | كلمة المرور الحالية خطأ |

---

## 9. تعديل البريد الإلكتروني (Update Email)

```
PATCH /auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "email": "newemail@example.com"
}
```

**Response 200:**
```json
{
  "message": "تم تحديث البريد الإلكتروني بنجاح"
}
```

**الأخطاء:**

| كود | `message` | السبب |
|-----|-----------|-------|
| **409** | `{"message": "البريد الإلكتروني مستخدم مسبقاً"}` | الإيميل مستخدم من قبل موظف آخر |

---

## 10. طلبات الإجازات (Leave Requests)

### GET /employees/leaves
عرض جميع طلبات الإجازات الخاصة بالموظف.
- **الصلاحية:** أي موظف مسجل

**Response 200:**
```json
[
  {
    "id": 1,
    "employeeId": 5,
    "leaveType": "ANNUAL",
    "startDate": "2026-06-10",
    "endDate": "2026-06-14",
    "reason": "إجازة سنوية",
    "status": "PENDING",
    "createdAt": "2026-05-23T..."
  }
]
```

### POST /employees/leaves
تقديم طلب إجازة جديد.
- **الصلاحية:** أي موظف مسجل

**Request:**
```json
{
  "leaveType": "ANNUAL",
  "startDate": "2026-06-10",
  "endDate": "2026-06-14",
  "reason": "إجازة سنوية"
}
```

| الحقل | النوع | إجباري | الوصف |
|-------|-------|--------|-------|
| `leaveType` | string | ✅ | `ANNUAL`, `SICK`, `EMERGENCY`, `UNPAID`, `OTHER` |
| `startDate` | string | ✅ | تاريخ البداية `YYYY-MM-DD` |
| `endDate` | string | ✅ | تاريخ النهاية `YYYY-MM-DD` |
| `reason` | string | | سبب الإجازة |

**Response 201:**
```json
{
  "id": 1,
  "employeeId": 5,
  "leaveType": "ANNUAL",
  "startDate": "2026-06-10",
  "endDate": "2026-06-14",
  "reason": "إجازة سنوية",
  "status": "PENDING",
  "createdAt": "2026-05-23T..."
}
```

### PATCH /employees/leaves/:id/cancel
إلغاء طلب إجازة (فقط إذا كان PENDING).
- **الصلاحية:** الموظف صاحب الطلب فقط

**Response 200:**
```json
{
  "id": 1,
  "employeeId": 5,
  "status": "CANCELLED"
}
```

**حالات status:**
| القيمة | المعنى |
|--------|--------|
| `PENDING` | ⏳ قيد المراجعة |
| `APPROVED` | ✅ تمت الموافقة |
| `REJECTED` | ❌ مرفوض |
| `CANCELLED` | 🔙 ملغي |

---

## 11. استخدام التوكن

### إرسال التوكن
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### صلاحية التوكن
| المستخدم | الصلاحية |
|----------|---------|
| `EMPLOYEE` / `MANAGER` | 🔄 **دائم (10 سنوات)** |

---

## 12. Flow التطبيق كامل

```
📱 تطبيق الموظف

1. شاشة الدخول
   ├── POST /auth/login
   └── حفظ access_token

2. الشاشة الرئيسية (حالة اليوم)
   ├── GET /attendance/today ← أحدث جلسة
   ├── session = null           → حضور مفعل، انصراف معطل
   ├── checkOutTime = null     → حضور معطل، انصراف مفعل
   └── checkOutTime موجود      → حضور مفعل، انصراف معطل

3. مسح QR للحضور
   ├── POST /attendance/check-in
   ├── نجاح → تحديث الواجهة (انصراف مفعل)
   └── خطأ → عرض رسالة الخطأ للمستخدم

4. مسح QR للانصراف
   ├── POST /attendance/check-out
   ├── نجاح → تحديث الواجهة + عرض ساعات العمل (حضور مفعل)
   └── خطأ → عرض رسالة الخطأ للمستخدم

5. يمكن تكرار (3 ← 4) عدة مرات في اليوم الواحد

6. سجل الحضور
   ├── GET /attendance/history?page=1
   └── عرض القائمة (infinite scroll) — جلسات متعددة لكل يوم

7. طلبات الإجازات
   ├── GET /employees/leaves ← عرض طلباتي
   ├── POST /employees/leaves ← تقديم طلب جديد
   └── PATCH /employees/leaves/:id/cancel ← إلغاء طلب

8. الملف الشخصي
   ├── GET /auth/profile ← عرض بياناتي
   ├── PATCH /auth/profile ← تعديل الإيميل
   ├── PATCH /auth/password ← تغيير كلمة المرور
   └── POST /auth/logout ← تسجيل الخروج
```

---

## 13. معالجة الأخطاء في Flutter

```dart
// ✅ استخراج رسالة الخطأ — من response.data['message']
String _extractError(dynamic e) {
  if (e is DioException && e.response?.data != null) {
    final msg = e.response!.data['message'];
    if (msg is String && msg.isNotEmpty) return msg;
  }
  if (e is DioException && e.type == DioExceptionType.connectionTimeout) {
    return 'لا يمكن الاتصال بالخادم';
  }
  if (e is DioException && e.type == DioExceptionType.connectionError) {
    return 'لا يمكن الاتصال بالخادم';
  }
  return 'حدث خطأ غير متوقع';
}
```

```dart
// ✅ Dio Interceptor مع Bearer token + معالجة 401
_api.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) {
    final token = storage.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  },
  onError: (error, handler) {
    if (error.response?.statusCode == 401) {
      storage.clearToken();
      Get.offAllNamed('/login');
    }
    handler.next(error);
  },
));
```

---

## ملاحظات عامة

| ملاحظة | التفاصيل |
|--------|----------|
| **التوكن دائم** | الموظف يسجل دخول مرة واحدة فقط |
| **صلاحية QR** | 30 ثانية فقط — استخدام واحد |
| **جلسات متعددة** | مسموح بجلسات حضور وانصراف متعددة في اليوم الواحد |
| **ترتيب اليوم** | `GET /today` يعيد أحدث جلسة لليوم (مرتبة بتنازلي حسب checkInTime) |
| **أسماء الحقول** | جميعها **camelCase** (`checkInTime` وليس `check_in_time`) |
| **معالجة الأخطاء** | استخدم `e.response!.data['message']` وليس `e.toString()` |
| **401 Unauthorized** | يحدث فقط في حالات نادرة — ارجع لشاشة الدخول |