/**
 * WEB QUẢN LÝ LỚP CHỦ NHIỆM - API BACKEND (FULL VERSION)
 * Tự động tạo bảng, tiêu đề và dữ liệu mẫu.
 */

const DB_CONFIG = {
  users: ["id", "username", "password", "fullName", "role", "relatedId", "createdAt"],
  classes: ["id", "className", "schoolYear", "homeroomTeacher", "note", "createdAt", "updatedAt"],
  students: ["id", "code", "fullName", "classId", "gender", "dob", "address", "status", "createdAt", "updatedAt"],
  parents: ["id", "fullName", "phone", "email", "relationship", "studentId", "createdAt"],
  attendance: ["id", "classId", "studentId", "date", "status", "note", "createdAt"],
  behavior: ["id", "studentId", "date", "type", "content", "points", "createdAt"],
  announcements: ["id", "classId", "title", "content", "author", "target", "pinned", "createdAt"],
  tasks: ["id", "classId", "title", "description", "dueDate", "requireReply", "createdAt"],
  taskReplies: ["id", "taskId", "studentId", "replyText", "attachmentsJson", "createdAt"],
  messageThreads: ["id", "threadKey", "participantsJson", "lastMessageAt"],
  messages: ["id", "threadId", "fromRole", "content", "createdAt"],
  documents: ["id", "classId", "title", "url", "category", "createdAt"],
  questions: ["id", "content", "optionsJson", "correctIndex", "createdAt"],
  settings: ["key", "value", "description"],
  logs: ["id", "timestamp", "userId", "action", "details"]
};

/**
 * API ENDPOINT: Xử lý các yêu cầu từ React App
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload || {};
    
    let result;
    
    switch (action) {
      case "login":
        result = handleLogin(payload.username, payload.password);
        break;
      case "getAll":
        result = getAll(payload.tab);
        break;
      case "list":
        result = listByField(payload.tab, payload.field, payload.value);
        break;
      case "create":
        payload.data.id = payload.data.id || Utilities.getUuid();
        payload.data.createdAt = new Date().toISOString();
        appendRow(payload.tab, payload.data);
        result = payload.data;
        break;
      case "update":
        payload.data.updatedAt = new Date().toISOString();
        updateRowById(payload.tab, payload.id, payload.data);
        result = { success: true };
        break;
      case "delete":
        deleteRowById(payload.tab, payload.id);
        result = { success: true };
        break;
      case "getReport":
        result = generateReport(payload.classId, payload.startDate, payload.endDate);
        break;
      default:
        throw new Error("Hành động không hợp lệ: " + action);
    }
    
    return createResponse({ ok: true, data: result });
  } catch (error) {
    return createResponse({ ok: false, error: error.message });
  }
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * XỬ LÝ ĐĂNG NHẬP
 */
function handleLogin(username, password) {
  const users = getAll("users");
  const user = users.find(u => u.username === String(username) && u.password === String(password));
  if (user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
  throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
}

/**
 * KHỞI TẠO DATABASE (Chạy hàm này đầu tiên)
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tạo các bảng và tiêu đề
  Object.keys(DB_CONFIG).forEach(tabName => {
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }
    ensureHeaders(sheet, DB_CONFIG[tabName]);
  });
  
  // 2. Tạo dữ liệu mẫu nếu bảng trống
  seedData();
  
  SpreadsheetApp.getUi().alert("✅ Đã khởi tạo cấu trúc dữ liệu và tài khoản admin thành công!");
}

function ensureHeaders(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
       .setBackground("#4a86e8")
       .setFontColor("#ffffff")
       .setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/**
 * TẠO DỮ LIỆU MẪU
 */
function seedData() {
  // Tạo tài khoản Admin mặc định
  const usersSheet = getSheet("users");
  if (usersSheet.getLastRow() < 2) {
    appendRow("users", {
      id: "admin-id",
      username: "admin",
      password: "123",
      fullName: "Giáo Viên Chủ Nhiệm",
      role: "admin",
      createdAt: new Date().toISOString()
    });
    // Tạo tài khoản phụ huynh mẫu
    appendRow("users", {
      id: "ph-id",
      username: "ph",
      password: "123",
      fullName: "Phụ Huynh Em Tèo",
      role: "app",
      relatedId: "student-1",
      createdAt: new Date().toISOString()
    });
  }

  // Tạo lớp học mẫu
  if (getSheet("classes").getLastRow() < 2) {
    appendRow("classes", {
      id: "class-1",
      className: "12A1",
      schoolYear: "2024-2025",
      homeroomTeacher: "Nguyễn Thị Thảo",
      createdAt: new Date().toISOString()
    });
  }

  // Tạo học sinh mẫu
  if (getSheet("students").getLastRow() < 2) {
    appendRow("students", {
      id: "student-1",
      code: "HS001",
      fullName: "Nguyễn Văn Tèo",
      classId: "class-1",
      gender: "Nam",
      dob: "2007-05-15",
      address: "Hà Nội",
      status: "Đang học",
      createdAt: new Date().toISOString()
    });
  }
}

/**
 * BÁO CÁO TỔNG HỢP
 */
function generateReport(classId, startDate, endDate) {
  const students = listByField("students", "classId", classId);
  const studentIds = students.map(s => s.id);
  
  const allAttendance = getAll("attendance").filter(a => a.classId === classId && a.date >= startDate && a.date <= endDate);
  const allBehaviors = getAll("behavior").filter(b => studentIds.includes(b.studentId) && b.date >= startDate && b.date <= endDate);
  const allReplies = getAll("taskReplies").filter(r => r.createdAt >= startDate && r.createdAt <= endDate);
  
  const attendanceRate = allAttendance.length > 0 
    ? (allAttendance.filter(a => a.status === "PRESENT").length / allAttendance.length) * 100 
    : 100;

  return {
    attendanceRate: Math.round(attendanceRate),
    absentCount: allAttendance.filter(a => a.status === "ABSENT").length,
    lateCount: allAttendance.filter(a => a.status === "LATE").length,
    praiseCount: allBehaviors.filter(b => b.type === "PRAISE").length,
    warnCount: allBehaviors.filter(b => b.type === "WARN").length,
    repliesCount: allReplies.length
  };
}

// --- TIỆN ÍCH CRUD ---

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Không tìm thấy bảng: " + name);
  return sheet;
}

function getAll(tabName) {
  const sheet = getSheet(tabName);
  if (sheet.getLastRow() < 2) return [];
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const headers = DB_CONFIG[tabName];
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function appendRow(tabName, obj) {
  const sheet = getSheet(tabName);
  const headers = DB_CONFIG[tabName];
  const rowData = headers.map(h => obj[h] || "");
  sheet.appendRow(rowData);
}

function updateRowById(tabName, id, updateObj) {
  const sheet = getSheet(tabName);
  const data = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  const headers = DB_CONFIG[tabName];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      const rowIndex = i + 1;
      headers.forEach((h, colIndex) => {
        if (updateObj.hasOwnProperty(h)) {
          sheet.getRange(rowIndex, colIndex + 1).setValue(updateObj[h]);
        }
      });
      return true;
    }
  }
  return false;
}

function deleteRowById(tabName, id) {
  const sheet = getSheet(tabName);
  const data = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function listByField(tabName, fieldName, value) {
  const all = getAll(tabName);
  if (!fieldName) return all;
  return all.filter(item => String(item[fieldName]) === String(value));
}