# Flowbrix – Digital Workforce Onboarding System

**Flowbrix** is a web-based, role-based onboarding workflow application designed to automate and simplify the employee onboarding process. It replaces manual paperwork with a structured digital platform ensuring seamless coordination between HR Administrators, Operations Managers, IT Support staff, and new Employees.

---

## 🚀 Key Features

* **3D User Interface**: Renders an ambient, interactive 3D particle starfield in the background powered by **React Three Fiber (Three.js)**.
* **Role-Based Access Control (RBAC)**: Personalized workspaces for Employees, HR Admins, Managers, and IT Support.
* **Sequential Onboarding Stages**:
  1. **Registration**: Account creation by HR.
  2. **Profile Completion**: Employee provides phone, address, and bank information.
  3. **Document Upload**: Employee uploads mock files for verification.
  4. **Document Verification**: HR approves or rejects document submissions.
  5. **Task Assignment**: Managers/HR assign check-off training or setup tasks.
  6. **Manager Approval**: Managers review and sign off on completed tasks.
  7. **Asset Allocation**: IT Support provisions hardware (e.g. MacBooks) and software access keys.
  8. **Onboarding Completion**: System generates a unique verification **QR Code Digital ID Badge** and logs a welcome email notification.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Vite, React Three Fiber, Three.js, Vanilla CSS Modules, Lucide Icons.
* **Backend**: Java 17, Spring Boot, Spring Data JPA.
* **Database**: H2 (In-memory development database) with PostgreSQL configuration templates ready.
* **QR Generation**: Google ZXing Library.

---

## 💻 Running the Project Locally

### 1. Start the Java Backend API
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Compile and run the Spring Boot server (uses port `8080`):
   ```bash
   # Ensure JAVA_HOME points to Java 17 JDK
   .\mvnw.cmd spring-boot:run
   ```

### 2. Start the React Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install packages and start the Vite dev server (uses port `5173`):
   ```bash
   npm install
   npm run dev
   ```
3. Open your browser to `http://localhost:5173`.

---

## 🔑 Demo Credentials

To test the role-based workflows, use the quick-fill buttons on the login page or enter:

| Workspace Role | Username | Password |
| :--- | :--- | :--- |
| **Employee** | `john` | `john123` |
| **HR Administrator** | `hr` | `hr123` |
| **Operations Manager** | `manager` | `manager123` |
| **IT Support Lead** | `it` | `it123` |

---

## 📄 License
This project is licensed under the MIT License.
