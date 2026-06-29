// API Service with Auto-Fallback to In-Browser Database (localStorage)
const API_BASE = "http://localhost:8080/api";

// Initialize Local Mock DB if not present
const initMockDb = () => {
  if (!localStorage.getItem("flowbrix_db")) {
    const initialDb = {
      users: [
        { id: 999, username: "hr", fullName: "HR Administrator", role: "HR_ADMIN", status: "ACTIVE", password: "hr123", email: "hr@flowbrix.com" },
        { id: 998, username: "manager", fullName: "Operations Manager", role: "MANAGER", status: "ACTIVE", password: "manager123", email: "manager@flowbrix.com" },
        { id: 997, username: "it", fullName: "IT Lead Support", role: "IT_SUPPORT", status: "ACTIVE", password: "it123", email: "it@flowbrix.com" },
        { id: 1, username: "john", fullName: "John Doe", role: "EMPLOYEE", status: "REGISTERED", password: "john123", email: "john.doe@flowbrix.com", phone: "", address: "", bankName: "", bankAccountNumber: "", qrCodeData: "" }
      ],
      documents: [],
      tasks: [],
      assets: []
    };
    localStorage.setItem("flowbrix_db", JSON.stringify(initialDb));
  }
};

const getMockDb = () => {
  initMockDb();
  return JSON.parse(localStorage.getItem("flowbrix_db"));
};

const saveMockDb = (db) => {
  localStorage.setItem("flowbrix_db", JSON.stringify(db));
};

// Check if real backend is available
let backendReachable = false;
const checkBackend = async () => {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isHttps = window.location.protocol === "https:";

  // If on HTTPS production site (like GitHub Pages), HTTP requests to localhost:8080 are blocked by Mixed Content.
  // We instantly skip to avoid browser connection hangs.
  if (!isLocalhost && isHttps) {
    backendReachable = false;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/hr/employees`, { method: "GET" });
    backendReachable = res.ok;
  } catch (e) {
    backendReachable = false;
  }
};

// Auto-run backend presence check on startup
checkBackend();

export const api = {
  isMock: () => !backendReachable,

  login: async (username, password) => {
    await checkBackend();
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }
      return res.json();
    } else {
      // Mock logic
      const db = getMockDb();
      const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (!user) throw new Error("Invalid username or password (mock mode)");
      return user;
    }
  },

  register: async (username, email, fullName, password) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, fullName, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }
      return res.json();
    } else {
      const db = getMockDb();
      if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error("Username already exists");
      }
      const newUser = {
        id: db.users.length + 1,
        username,
        email,
        fullName,
        password,
        role: "EMPLOYEE",
        status: "REGISTERED",
        phone: "", address: "", bankName: "", bankAccountNumber: "", qrCodeData: ""
      };
      db.users.push(newUser);
      saveMockDb(db);
      return newUser;
    }
  },

  getEmployeeDetails: async (userId) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/employee/${userId}/details`);
      if (!res.ok) throw new Error("Failed to fetch employee details");
      return res.json();
    } else {
      const db = getMockDb();
      const user = db.users.find(u => u.id === Number(userId));
      const documents = db.documents.filter(d => d.userId === Number(userId));
      const tasks = db.tasks.filter(t => t.userId === Number(userId));
      const assets = db.assets.filter(a => a.userId === Number(userId));
      return { user, documents, tasks, assets };
    }
  },

  completeProfile: async (userId, profileData) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/employee/${userId}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    } else {
      const db = getMockDb();
      const userIdx = db.users.findIndex(u => u.id === Number(userId));
      if (userIdx !== -1) {
        db.users[userIdx] = { ...db.users[userIdx], ...profileData };
        if (db.users[userIdx].status === "REGISTERED") {
          db.users[userIdx].status = "PROFILE_COMPLETED";
        }
        saveMockDb(db);
        return db.users[userIdx];
      }
      throw new Error("User not found");
    }
  },

  uploadDoc: async (userId, docData) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/employee/${userId}/upload-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docData)
      });
      if (!res.ok) throw new Error("Failed to upload document");
      return res.json();
    } else {
      const db = getMockDb();
      const user = db.users.find(u => u.id === Number(userId));
      if (!user) throw new Error("User not found");

      const newDoc = {
        id: db.documents.length + 1,
        name: docData.name,
        fileUrl: docData.fileUrl,
        status: "PENDING",
        uploadedAt: new Date().toISOString(),
        userId: Number(userId)
      };
      db.documents.push(newDoc);
      
      if (user.status === "PROFILE_COMPLETED") {
        user.status = "DOCS_UPLOADED";
      }
      saveMockDb(db);
      return newDoc;
    }
  },

  completeTask: async (taskId) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/employee/complete-task/${taskId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to complete task");
      return res.json();
    } else {
      const db = getMockDb();
      const taskIdx = db.tasks.findIndex(t => t.id === Number(taskId));
      if (taskIdx !== -1) {
        db.tasks[taskIdx].completed = true;
        db.tasks[taskIdx].completedAt = new Date().toISOString();
        saveMockDb(db);
        return db.tasks[taskIdx];
      }
      throw new Error("Task not found");
    }
  },

  getEmployees: async () => {
    await checkBackend();
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/hr/employees`);
      if (!res.ok) throw new Error("Failed to fetch employees list");
      return res.json();
    } else {
      const db = getMockDb();
      return db.users.filter(u => u.role === "EMPLOYEE");
    }
  },

  verifyDoc: async (docId, verifyData) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/hr/verify-doc/${docId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyData)
      });
      if (!res.ok) throw new Error("Failed to verify document");
      return res.json();
    } else {
      const db = getMockDb();
      const doc = db.documents.find(d => d.id === Number(docId));
      if (!doc) throw new Error("Document not found");

      doc.status = verifyData.status;
      if (verifyData.status === "REJECTED") {
        doc.rejectionReason = verifyData.rejectionReason;
      } else {
        doc.rejectionReason = null;
      }

      const employee = db.users.find(u => u.id === doc.userId);
      const userDocs = db.documents.filter(d => d.userId === doc.userId);
      const allApproved = userDocs.length > 0 && userDocs.every(d => d.status === "APPROVED");
      const anyRejected = userDocs.some(d => d.status === "REJECTED");

      if (employee) {
        if (allApproved) {
          employee.status = "VERIFIED";
        } else if (anyRejected) {
          employee.status = "PROFILE_COMPLETED";
        }
      }
      saveMockDb(db);
      return doc;
    }
  },

  assignTask: async (userId, taskData) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/hr/assign-task/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error("Failed to assign task");
      return res.json();
    } else {
      const db = getMockDb();
      const employee = db.users.find(u => u.id === Number(userId));
      if (!employee) throw new Error("Employee not found");

      const newTask = {
        id: db.tasks.length + 1,
        description: taskData.description,
        assignedBy: taskData.assignedBy,
        completed: false,
        userId: Number(userId)
      };
      db.tasks.push(newTask);

      if (employee.status === "VERIFIED") {
        employee.status = "TASKS_ASSIGNED";
      }
      saveMockDb(db);
      return newTask;
    }
  },

  approveOnboarding: async (userId) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/manager/approve/${userId}`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve onboarding");
      }
      return res.json();
    } else {
      const db = getMockDb();
      const employee = db.users.find(u => u.id === Number(userId));
      if (!employee) throw new Error("Employee not found");

      const userTasks = db.tasks.filter(t => t.userId === Number(userId));
      const allCompleted = userTasks.length > 0 && userTasks.every(t => t.completed);

      if (!allCompleted) {
        throw new Error("Cannot approve. Incomplete tasks remain.");
      }

      employee.status = "APPROVED";
      saveMockDb(db);
      return employee;
    }
  },

  allocateAsset: async (userId, assetData) => {
    if (backendReachable) {
      const res = await fetch(`${API_BASE}/it/allocate-asset/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetData)
      });
      if (!res.ok) throw new Error("Failed to allocate asset");
      return res.json();
    } else {
      const db = getMockDb();
      const employee = db.users.find(u => u.id === Number(userId));
      if (!employee) throw new Error("Employee not found");

      const newAsset = {
        id: db.assets.length + 1,
        assetName: assetData.assetName,
        serialNumber: assetData.serialNumber,
        allocatedAt: new Date().toISOString(),
        status: "ALLOCATED",
        userId: Number(userId)
      };
      db.assets.push(newAsset);

      if (employee.status === "APPROVED") {
        employee.status = "ASSETS_ALLOCATED";
      }

      // Auto-trigger completion in mock mode
      if (employee.status === "ASSETS_ALLOCATED") {
        // Generate simulated QR Code Base64
        // Use a simple static public QR code generator API or a simple mock image
        const qrPayload = encodeURIComponent(`FLOWBRIX IDENTITY:\nID: ${employee.id}\nName: ${employee.fullName}\nEmail: ${employee.email}\nStatus: Completed`);
        employee.qrCodeData = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrPayload}`;
        employee.status = "COMPLETED";
      }

      saveMockDb(db);
      return newAsset;
    }
  }
};
