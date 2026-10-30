# NeuroMate API v2 Documentation

## Overview

The NeuroMate API has been restructured to provide a more consistent, secure, and maintainable interface. The new v2 API maintains backward compatibility with existing endpoints while introducing improved patterns.

## Key Changes

### 1. **Consistent Endpoint Structure**
- All v2 endpoints use `/api/v1/` prefix
- Resource-based naming (e.g., `/patients`, `/users`, `/predictions`)
- Consistent HTTP methods and status codes

### 2. **Unified Response Format**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "error": null
}
```

### 3. **Role-Based Access Control**
- Consistent authorization patterns across all endpoints
- Proper data sanitization for different user roles
- Enhanced security checks

### 4. **Service Layer Architecture**
- Business logic separated from controllers
- Reusable service methods
- Better error handling and validation

## API Endpoints

### Authentication
```
POST /auth/signup    - User registration
POST /auth/signin    - User login
```

### Patients (v2)
```
GET    /api/v1/patients              - Get patients (role-based)
GET    /api/v1/patients/{id}          - Get specific patient
POST   /api/v1/patients/ct            - Create CT patient
POST   /api/v1/patients/coma          - Create coma patient
PATCH  /api/v1/patients/{id}/queue   - Update queue status
DELETE /api/v1/patients/{id}          - Delete patient
```

**Query Parameters for GET /api/v1/patients:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `patient_type` (string): Filter by type ("ct" or "coma")
- `in_queue` (boolean): Filter by queue status

### Users (v2)
```
GET    /api/v1/users/me               - Get current user
GET    /api/v1/users/doctors          - Get all doctors (admin)
GET    /api/v1/users/students         - Get all students (admin)
POST   /api/v1/users/                 - Create user (admin)
DELETE /api/v1/users/{id}             - Delete user (admin)
GET    /api/v1/users/{id}/patients    - Get user's patients
```

### Predictions (v2)
```
POST /api/v1/predictions/ct-risk                    - Predict CT risk
POST /api/v1/predictions/ct-risk/digital-twin      - CT risk with timeline
POST /api/v1/predictions/coma-outcome               - Predict coma outcome
GET  /api/v1/predictions/patient/{id}/ct-risk      - Predict for existing patient
GET  /api/v1/predictions/patient/{id}/digital-twin  - Digital twin for existing patient
GET  /api/v1/predictions/models/health              - Check model status
```

### Admin (v2)
```
GET    /api/v1/admin/dashboard          - Admin dashboard
GET    /api/v1/admin/users              - Get all users
GET    /api/v1/admin/patients           - Get all patients
POST   /api/v1/admin/users              - Create user
DELETE /api/v1/admin/users/{id}         - Delete user
GET    /api/v1/admin/system/health      - System health check
```

## Role-Based Access

### Doctors
- Can only access their own patients
- Full patient data access
- Can create, update, and delete patients
- Can use all prediction endpoints

### Students
- Can access all patients for educational purposes
- Limited/sanitized patient data (no personal info)
- Cannot see queue status or sensitive data
- Can use prediction endpoints for learning

### Admins
- Full system access
- Can manage all users and patients
- Can access system health and dashboard
- Can create/delete users

## Response Models

### Patient Response
```json
{
  "id": 1,
  "name": "John Doe",
  "age": 45,
  "patient_type": "ct",
  "in_queue": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### CT Patient Response (extends Patient)
```json
{
  "id": 1,
  "name": "John Doe",
  "age": 45,
  "patient_type": "ct",
  "sex": "male",
  "mechanism": "fall",
  "gcs": 15,
  "tbiSeverity": "mild",
  "risk_score": 0.15,
  "risk_level": "low",
  "needs_ct": false,
  "confidence": 0.92,
  "model_type": "xgboost",
  "prediction_date": "2024-01-15T10:30:00Z"
}
```

### Coma Patient Response (extends Patient)
```json
{
  "id": 2,
  "name": "Jane Smith",
  "age": 67,
  "patient_type": "coma",
  "cause_of_coma": "traumatic_brain_injury",
  "gcs_total": 8,
  "gcs_motor": 4,
  "conscious_state": "moderate_coma",
  "conscious_state_confidence": 0.85,
  "deterioration_risk": 0.3,
  "deterioration_level": "medium",
  "stability_score": 0.7,
  "stability_level": "stable"
}
```

## Migration Guide

### For Frontend Developers

1. **Update API calls to use v2 endpoints:**
   ```javascript
   // Old way
   const patients = await getDoctorPatients();
   
   // New way
   const patients = await getPatients();
   ```

2. **Use the new API files:**
   - `api/patients.js` - Patient operations
   - `api/predictions.js` - Prediction operations
   - `api/users.js` - User and admin operations
   - `api/students.js` - Student-specific operations

3. **Handle pagination:**
   ```javascript
   const patients = await getPatients({
     page: 1,
     per_page: 20,
     patient_type: 'ct',
     in_queue: true
   });
   ```

### For Backend Developers

1. **Use the service layer:**
   ```python
   from app.services.patient_service import PatientService
   
   patients = PatientService.get_patients_for_doctor(
       db, doctor_id, page=1, per_page=20
   )
   ```

2. **Follow the response schema:**
   ```python
   return APIResponse(
       success=True,
       message="Operation completed",
       data=result
   )
   ```

## Legacy Support

All existing endpoints remain functional for backward compatibility:
- `/doctor/patients` → `/api/v1/patients`
- `/student/cases` → `/api/v1/patients`
- `/predict` → `/api/v1/predictions`

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "error": "Patient not found",
  "detail": "Patient with ID 123 does not exist"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

1. **JWT Authentication** - All endpoints require valid token
2. **Role-Based Authorization** - Access control based on user role
3. **Data Sanitization** - Sensitive data filtered for students
4. **Input Validation** - Pydantic schemas for request validation
5. **SQL Injection Protection** - SQLAlchemy ORM usage

## Testing

### Example API Calls

```bash
# Get all patients (doctor)
curl -H "Authorization: Bearer <token>" \
     "http://localhost:8000/api/v1/patients"

# Create CT patient
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","age":45,"sex":"male","mechanism":"fall","gcs":15,"tbiSeverity":"mild"}' \
     "http://localhost:8000/api/v1/patients/ct"

# Predict CT risk
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"age":45,"sex":"male","mechanism":"fall","gcs":15}' \
     "http://localhost:8000/api/v1/predictions/ct-risk"
```

## Database Compatibility

The new API structure maintains full compatibility with the existing database schema. No database migrations are required. The changes are purely at the API layer and service layer architecture.
