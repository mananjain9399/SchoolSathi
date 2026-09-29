# SchoolSathi — Real School Management System & ERP Integration Guide

This document outlines the architecture, integration contracts, and security standards for connecting real school management software and ERP systems to **SchoolSathi**.

---

## 1. Data Source Architecture (`SchoolDataProvider`)

SchoolSathi treats school records as the **authoritative source of truth**. The Parent AI assistant communicates exclusively with the **`SchoolDataProvider`** abstraction:

```
┌────────────────────────────────────────────────────────┐
│             SchoolSathi Parent Voice AI                │
│    (Zero Knowledge of Storage or Network Layer)        │
└───────────────────────────┬────────────────────────────┘
                            │
            ▼───────────────┴───────────────▼
               SchoolDataProvider Interface
            ▲───────────────┬───────────────▲
                            │
       ┌────────────────────┼───────────────────┐
       │                    │                   │
┌──────┴──────────┐  ┌──────┴──────────┐ ┌──────┴──────────┐ ┌─────────────────┐
│ MockDataProvider│  │ RESTDataProvider│ │ CSVDataProvider │ │ FutureERPAdapter│
│ (Demo & Offline)│  │ (Direct API)    │ │ (File Fallback) │ │ (ShaalaDarpan)  │
└─────────────────┘  └─────────────────┘ └─────────────────┘ └─────────────────┘
```

The AI does not care whether data is fetched from an in-memory database, an HTTP REST endpoint, an uploaded CSV, or an enterprise school ERP.

---

## 2. Integration Approaches for Real Schools

Schools can integrate with SchoolSathi using one of four official methods:

### Option 1: Direct REST API Integration (Recommended for Modern ERPs)

Schools with modern web applications expose a secure REST API implementing the SchoolSathi contract.

#### Endpoint Contract:
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/students/:studentId` | Basic student details, section, roll number, and teacher |
| `GET` | `/students/:studentId/homework` | Active & upcoming homework assignments |
| `GET` | `/students/:studentId/exams` | Scheduled upcoming examinations and syllabus |
| `GET` | `/students/:studentId/attendance` | Attendance summary, present percentage, and daily log |
| `GET` | `/students/:studentId/progress` | Report card grades, subject scores, and teacher remarks |
| `GET` | `/students/:studentId/timetable` | Weekly classroom periods schedule |
| `GET` | `/students/:studentId/announcements`| School circulars and notices targeting the student's class |
| `GET` | `/school/holidays` | School holiday calendar and upcoming vacations |

#### Headers:
```http
GET /students/KV-2024-8841/homework HTTP/1.1
Host: api.schoolerp.gov.in
X-School-ID: sch-kv01
Authorization: Bearer <jwt_or_api_key>
X-Correlation-ID: req-1727600000-a8f9
Accept: application/json
```

---

### Option 2: Webhooks (Real-Time Push Synchronization)

Instead of continuous polling, the school ERP pushes real-time events to SchoolSathi's ingestion endpoint:

```
School ERP  ──(HTTPS Webhook)──▶  SchoolSathi Ingestion API  ──▶  Parent Voice AI
```

#### Supported Webhook Events:
1. `homework.updated` — Sent immediately when a teacher assigns or edits homework.
2. `exam.created` — Sent when examination datesheets are published.
3. `attendance.updated` — Sent when daily attendance register is marked.
4. `announcement.created` — Sent when school principals post an urgent notice.
5. `student.updated` — Sent on student class promotion or contact update.

#### Webhook Payload Schema:
```json
{
  "eventId": "evt-20260929-8819",
  "eventType": "homework.updated",
  "schoolId": "sch-kv01",
  "timestamp": "2026-09-29T08:30:00.000Z",
  "signature": "sha256=d2f1b4a9e5c704f76274b...",
  "sourceSystem": "ShaalaDarpan-KV",
  "data": {
    "studentId": "std-01",
    "classDisplayName": "6-B",
    "subject": "Mathematics",
    "title": "Exercise 4.2",
    "description": "Questions 1 to 5 from chapter Fractions",
    "dueDate": "Tomorrow"
  }
}
```

---

### Option 3: CSV Import Fallback (For Schools Without APIs)

For schools without IT departments or open API infrastructure, SchoolSathi provides an administrative CSV import workflow.

Administrators upload standard CSV files:
* `students.csv`: `student_id, student_name, class, section, roll_number, parent_mobile`
* `homework.csv`: `class, section, subject, title, description, due_date`
* `attendance.csv`: `student_id, date, status, reason`

The `CSVSchoolDataProvider` parses the files, performs row-by-row validation, and flags errors with line numbers before writing to the tenant database.

---

### Option 4: Secure Database Synchronization (Batch ETL)

> [!CAUTION]
> **Zero Direct Database Connections**:
> SchoolSathi **NEVER** connects directly to an unverified or arbitrary school production database. Doing so creates severe SQL injection, firewall, and data corruption risks.

For schools requiring database-level synchronization:
1. The school exports read-only sanitized replicas to an isolated cloud storage bucket (AWS S3 or Google Cloud Storage) or reads from a dedicated read-only replica.
2. A lightweight, signed **SchoolSathi Sync Agent** runs on a scheduled cron job (e.g., every 30 minutes) to push updates via the Admin Sync API.

---

## 3. School-Specific Tenancy & Data Isolation

```
┌──────────────────────────────────────────────┐
│                  SchoolSathi                 │
│               Multi-Tenant Core              │
└──────────────┬────────────────┬──────────────┘
               │                │
       ┌───────┴──────┐  ┌──────┴───────┐
       │   School A   │  │   School B   │
       │ (KV Cantt)   │  │  (DPS Sec 45)│
       ├──────────────┤  ├──────────────┤
       │ Students A   │  │ Students B   │
       │ Homework A   │  │ Homework B   │
       │ Exams A      │  │ Exams B      │
       └──────────────┘  └──────────────┘
```

* **Strict Tenancy Scoping**: Every query, cache entry, and database record is tagged with `schoolId`.
* **Zero Cross-Contamination**: Queries from parents of School A can never return data from School B.

---

## 4. Security & Privacy Architecture

| Principle | Implementation in SchoolSathi |
|---|---|
| **Authentication** | Bearer JWT tokens and cryptographically signed API keys for school systems. Mobile OTP for parents. |
| **Student-Level Access Control (SLAC)** | Parents can only query children linked to their verified mobile number. Unauthorized queries are blocked and audit-logged. |
| **Encrypted Transport** | HTTPS / TLS 1.3 enforced for all external API endpoints and webhooks. |
| **Environment Isolation** | API credentials stored strictly in environment variables (`VITE_SCHOOL_API_URL`, `VITE_SCHOOL_API_KEY`). Never committed to source code. |
| **Tamper-Evident Audit Logging** | All data queries, sync operations, and webhook deliveries are recorded with actor, timestamp, and status. |

---

## 5. Offline Fallback & Demo Mode

If an external school ERP is offline, experiencing maintenance, or not yet connected:
* The system falls back automatically to cached data or the `MockSchoolDataProvider`.
* Parents are never stranded with crash screens.
* SchoolSathi reports verified status accurately without hallucinating unverified information.
