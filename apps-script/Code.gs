const SPREADSHEET_ID = "1dWJ6b9ml0x6-n145vEdt_JDpzmbEY6aAmGxXiDDYHCk";

const SHEETS = {
  settings: "설정",
  notices: "공지사항",
  trainings: "교육목록",
  materials: "교육자료",
  staff: "교직원명단",
  targets: "교육대상",
  history: "교육이력_VIEW",
  uploads: "이수증업로드",
  attendance: "교육참석",
  groupMappings: "묶음과정매핑"
};

const DRIVE_ROOT_FOLDER = "세화 교직원 교육센터";
const SIGNATURE_FOLDER = "전자서명";
const REPORT_FOLDER = "최종명단";

function doGet() {
  return jsonOutput({
    success: true,
    message: "세화 교직원 교육센터 API is running."
  });
}

function doPost(e) {
  try {
    const req = JSON.parse((e.postData && e.postData.contents) || "{}");
    const action = req.action;

    switch (action) {
      case "getAppConfig":
        return jsonOutput(getAppConfig());
      case "getNotices":
        return jsonOutput(getNotices());
      case "getTrainings":
        return jsonOutput(getTrainings(req));
      case "getTrainingDetail":
        return jsonOutput(getTrainingDetail(req));
      case "getGroupTrainings":
        return jsonOutput(getGroupTrainings(req));
      case "getMaterials":
      case "getMaterialsByEvent":
      case "getTrainingMaterials":
        return jsonOutput(getMaterials(req));
      case "findStaff":
        return jsonOutput(findStaff(req));
      case "getMyTrainingHistory":
        return jsonOutput(getMyTrainingHistory(req));
      case "getMyUploads":
        return jsonOutput(getMyUploads(req));
      case "checkAttendanceEligibility":
        return jsonOutput(checkAttendanceEligibility(req));
      case "submitQrAttendance":
        return jsonOutput(submitQrAttendance(req));
      case "uploadCertificate":
        return jsonOutput(uploadCertificate(req));
      case "getAttendanceSummary":
        return jsonOutput(getAttendanceSummary(req));
      case "downloadAttendanceReport":
        return jsonOutput(downloadAttendanceReport(req));
      default:
        return jsonOutput({
          success: false,
          message: "지원하지 않는 요청입니다."
        });
    }
  } catch (err) {
    return jsonOutput({
      success: false,
      message: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
      error: err.message
    });
  }
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Sheet not found: " + name);
  return sheet;
}

function getRows(sheetName) {
  const sheet = getSheet(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  return values
    .slice(1)
    .filter((row) => row.some((cell) => cell !== "" && cell !== null))
    .map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
}

function safeRows(sheetName) {
  try {
    return getRows(sheetName);
  } catch (err) {
    return [];
  }
}

function appendRow(sheetName, data) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const row = headers.map((header) => data[header] !== undefined ? data[header] : "");
  sheet.appendRow(row);
}

const STAFF_ID_KEYS = ["교직원ID", "교직원Id", "교직원아이디", "교직원번호", "교원번호", "직원번호", "직번", "교번", "사번", "ID", "id", "staffId", "staff_id", "teacherId", "teacher_id", "사용자ID", "사용자아이디", "식별번호"];
const STAFF_NAME_KEYS = ["성명", "이름", "성함", "교직원명", "교사명", "직원명", "이름(성명)", "name", "staffName", "teacherName"];
const DEPARTMENT_KEYS = ["소속부서", "소속 부서", "부서", "부서명", "소속", "소속부", "담당부서", "근무부서", "department", "dept"];
const POSITION_KEYS = ["직책", "직위", "직급", "직종", "직무", "구분", "교직원구분", "교원구분", "역할", "position", "role", "title"];
const SUBMISSION_TARGET_KEYS = ["제출대상", "제출 대상", "제출대상여부", "제출 여부", "교육제출대상", "교육대상여부", "연수대상", "연수대상여부", "이수대상", "이수대상여부", "대상여부", "대상자여부", "targetSubmission", "submissionTarget"];
const STAFF_STATUS_KEYS = ["재직상태", "재직 여부", "근무상태", "근무 여부", "상태", "status"];

function normalizeHeaderKey(value) {
  return String(value || "")
    .replace(/[\s_\-()[\]{}\/\\.·:：]/g, "")
    .toLowerCase();
}

function uniqueKeys(keys) {
  const seen = {};
  return keys.filter((key) => {
    const normalized = normalizeHeaderKey(key);
    if (!normalized || seen[normalized]) return false;
    seen[normalized] = true;
    return true;
  });
}

function aliasesForKeys(keys) {
  let expanded = keys.slice();
  const normalized = keys.map(normalizeHeaderKey);

  if (STAFF_ID_KEYS.some((key) => normalized.indexOf(normalizeHeaderKey(key)) >= 0)) expanded = expanded.concat(STAFF_ID_KEYS);
  if (STAFF_NAME_KEYS.some((key) => normalized.indexOf(normalizeHeaderKey(key)) >= 0)) expanded = expanded.concat(STAFF_NAME_KEYS);
  if (DEPARTMENT_KEYS.some((key) => normalized.indexOf(normalizeHeaderKey(key)) >= 0)) expanded = expanded.concat(DEPARTMENT_KEYS);
  if (POSITION_KEYS.some((key) => normalized.indexOf(normalizeHeaderKey(key)) >= 0)) expanded = expanded.concat(POSITION_KEYS);
  if (SUBMISSION_TARGET_KEYS.some((key) => normalized.indexOf(normalizeHeaderKey(key)) >= 0)) expanded = expanded.concat(SUBMISSION_TARGET_KEYS);
  if (STAFF_STATUS_KEYS.some((key) => normalized.indexOf(normalizeHeaderKey(key)) >= 0)) expanded = expanded.concat(STAFF_STATUS_KEYS);

  return uniqueKeys(expanded);
}

function valueOf(row, keys, fallback) {
  if (!row) return fallback || "";
  const candidates = aliasesForKeys(keys);

  for (let i = 0; i < candidates.length; i += 1) {
    const value = row[candidates[i]];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  const normalizedCandidates = candidates.map(normalizeHeaderKey);
  const rowKeys = Object.keys(row);
  for (let i = 0; i < rowKeys.length; i += 1) {
    const rowKey = rowKeys[i];
    if (normalizedCandidates.indexOf(normalizeHeaderKey(rowKey)) < 0) continue;
    const value = row[rowKey];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return fallback || "";
}

function stringOf(row, keys, fallback) {
  return String(valueOf(row, keys, fallback || "") || "").trim();
}

function normalizeStaffRow(row) {
  if (!row) return null;
  const normalized = Object.assign({}, row);
  normalized["교직원ID"] = stringOf(row, STAFF_ID_KEYS);
  normalized.staffId = normalized["교직원ID"];
  normalized["성명"] = stringOf(row, STAFF_NAME_KEYS);
  normalized.staffName = normalized["성명"];
  normalized["소속부서"] = stringOf(row, DEPARTMENT_KEYS);
  normalized.department = normalized["소속부서"];
  normalized["직책"] = stringOf(row, POSITION_KEYS);
  normalized.position = normalized["직책"];
  normalized["제출대상"] = stringOf(row, SUBMISSION_TARGET_KEYS);
  normalized.submissionTarget = normalized["제출대상"];
  normalized["재직상태"] = stringOf(row, STAFF_STATUS_KEYS, "재직");
  normalized.staffStatus = normalized["재직상태"];
  return normalized;
}

function getStaffRows() {
  return safeRows(SHEETS.staff)
    .map(normalizeStaffRow)
    .filter((row) => row && row["교직원ID"] && row["성명"]);
}

function normalizeTargetPersonRow(row) {
  const targetStaffId = stringOf(row, STAFF_ID_KEYS);
  const staff = targetStaffId ? getStaffById(targetStaffId) : null;
  const normalizedTarget = normalizeStaffRow(row) || {};
  const staffId = targetStaffId || stringOf(staff, STAFF_ID_KEYS);
  const staffName = stringOf(normalizedTarget, STAFF_NAME_KEYS) || stringOf(staff, STAFF_NAME_KEYS);
  const department = stringOf(normalizedTarget, DEPARTMENT_KEYS) || stringOf(staff, DEPARTMENT_KEYS);
  const position = stringOf(normalizedTarget, POSITION_KEYS) || stringOf(staff, POSITION_KEYS);

  return Object.assign({}, staff || {}, normalizedTarget, {
    "교직원ID": staffId,
    staffId,
    "성명": staffName,
    staffName,
    "소속부서": department,
    department,
    "직책": position,
    position
  });
}

function truthy(value) {
  const text = String(value || "").trim().toLowerCase();
  return ["true", "yes", "y", "1", "사용", "대상", "제외", "서명제외", "면제"].indexOf(text) >= 0;
}

function getAppConfig() {
  const rows = safeRows(SHEETS.settings);
  const config = {};
  rows.forEach((row) => {
    const key = stringOf(row, ["key", "설정키"]);
    if (key) config[key] = valueOf(row, ["value", "값"]);
  });
  return { success: true, data: config };
}

function getNotices() {
  const rows = safeRows(SHEETS.notices).filter((row) => {
    const enabled = stringOf(row, ["사용여부", "사용 여부", "enabled"], "사용");
    const top = stringOf(row, ["홈노출", "홈 노출", "showOnHome"], "사용");
    return enabled !== "미사용" && top !== "미사용";
  });
  return { success: true, data: rows };
}

function getTrainings(req) {
  let rows = safeRows(SHEETS.trainings).filter((row) => {
    const enabled = stringOf(row, ["사용여부", "사용 여부", "enabled"], "사용");
    return enabled !== "미사용" && enabled !== "FALSE";
  });

  if (req.year) {
    rows = rows.filter((row) => String(valueOf(row, ["교육연도", "연도", "year"], "")) === String(req.year));
  }

  return { success: true, data: rows };
}

function getTrainingDetail(req) {
  const eventId = String(req.eventId || "").trim();
  const event = getTrainingByEventId(eventId);

  if (!event) {
    return { success: false, message: "해당 교육을 찾을 수 없습니다." };
  }

  return {
    success: true,
    data: {
      event,
      targets: getTargetsForEvent(eventId),
      attendances: getAttendancesForEvent(eventId),
      materials: getMaterials({ eventId }).data,
      uploads: safeRows(SHEETS.uploads).filter((row) => stringOf(row, ["eventId", "교육ID"]) === eventId),
      completions: safeRows(SHEETS.history).filter((row) => stringOf(row, ["eventId", "교육ID"]) === eventId)
    }
  };
}

function getGroupTrainings(req) {
  const groupId = String(req.groupId || req.eventGroupId || "").trim();
  if (!groupId) return { success: false, message: "묶음 교육 ID가 필요합니다." };

  let rows = safeRows(SHEETS.groupMappings)
    .filter((row) => stringOf(row, ["groupId", "bundleId", "묶음ID", "그룹ID"]) === groupId)
    .sort((a, b) => Number(valueOf(a, ["sortOrder", "순서"], 0)) - Number(valueOf(b, ["sortOrder", "순서"], 0)))
    .map((row) => getTrainingByEventId(stringOf(row, ["eventId", "교육ID"])))
    .filter(Boolean);

  if (rows.length === 0) {
    rows = safeRows(SHEETS.trainings).filter((row) => {
      const rowGroupId = stringOf(row, ["eventGroupId", "groupId", "bundleId", "묶음ID", "그룹ID"]);
      const enabled = stringOf(row, ["사용여부", "사용 여부", "enabled"], "사용");
      return rowGroupId === groupId && enabled !== "미사용" && enabled !== "FALSE";
    });
  }

  return { success: true, data: rows, count: rows.length };
}

function getMaterials(req) {
  let rows = safeRows(SHEETS.materials).filter((row) => {
    const enabled = stringOf(row, ["사용여부", "사용 여부", "enabled"], "사용");
    return enabled !== "미사용" && enabled !== "FALSE";
  });

  if (req.eventId) {
    rows = rows.filter((row) => stringOf(row, ["eventId", "교육ID"]) === String(req.eventId));
  }

  return { success: true, data: rows };
}

function findStaff(req) {
  const name = String(req.name || req.staffName || "").trim();
  const department = String(req.department || "").trim();

  if (!name) {
    return { success: false, message: "성명을 입력해주세요." };
  }

  let rows = getStaffRows().filter((row) => {
    const staffId = stringOf(row, STAFF_ID_KEYS);
    const staffName = stringOf(row, STAFF_NAME_KEYS);
    return staffName === name || staffId === name;
  });

  if (department) {
    rows = rows.filter((row) => stringOf(row, DEPARTMENT_KEYS) === department);
  }

  return { success: true, data: rows, count: rows.length };
}

function getMyTrainingHistory(req) {
  const staffId = String(req.staffId || req.query || "").trim();
  if (!staffId) return { success: false, message: "교직원ID가 필요합니다." };

  const rows = safeRows(SHEETS.history).filter((row) => stringOf(row, STAFF_ID_KEYS) === staffId);
  return { success: true, data: rows };
}

function getMyUploads(req) {
  const staffId = String(req.staffId || req.query || "").trim();
  if (!staffId) return { success: false, message: "교직원ID가 필요합니다." };

  const rows = safeRows(SHEETS.uploads).filter((row) => stringOf(row, STAFF_ID_KEYS) === staffId);
  return { success: true, data: rows };
}

function checkAttendanceEligibility(req) {
  const mode = req.mode === "group" || req.groupId || req.eventIds ? "group" : "single";
  const staffId = String(req.staffId || req["교직원ID"] || "").trim();
  const eventIds = mode === "group" ? getSubmitEventIds(req) : [String(req.eventId || "").trim()].filter(Boolean);

  if (!staffId) {
    return { success: false, message: "교직원ID가 필요합니다." };
  }

  if (eventIds.length === 0) {
    return { success: false, message: "교육 정보를 찾을 수 없습니다." };
  }

  const results = eventIds.map((eventId) => decisionToEligibilityResult(getAttendanceDecision(eventId, staffId)));
  const canSignCount = results.filter((result) => result.status === "can_sign").length;
  const alreadyCount = results.filter((result) => result.status === "already_attended").length;
  const notTargetCount = results.filter((result) => result.status === "not_target").length;
  const excludedCount = results.filter((result) => result.status === "signature_excluded").length;
  const blockedCount = notTargetCount + excludedCount;
  const status = canSignCount > 0
    ? "can_sign"
    : alreadyCount > 0 && alreadyCount === results.length
      ? "already_attended"
      : excludedCount > 0 && excludedCount === results.length
        ? "signature_excluded"
        : notTargetCount > 0 && notTargetCount === results.length
          ? "not_target"
          : "not_target";
  const message = getEligibilityMessage(status, canSignCount, alreadyCount, blockedCount);

  return {
    success: true,
    message,
    data: {
      eligible: status === "can_sign",
      status,
      message,
      canSignCount,
      alreadyCount,
      notTargetCount,
      excludedCount,
      blockedCount,
      results
    }
  };
}

function decisionToEligibilityResult(decision) {
  const result = decision.result || {};
  const event = getTrainingByEventId(decision.eventId) || {};
  const title = stringOf(event, ["교육명", "제목", "title"], decision.eventId);

  if (decision.status === "ready") {
    return {
      eventId: decision.eventId,
      trainingTitle: title,
      eligible: true,
      status: "can_sign",
      message: "전자서명이 필요합니다."
    };
  }

  if (decision.status === "already") {
    return {
      eventId: decision.eventId,
      trainingTitle: title,
      eligible: false,
      status: "already_attended",
      attendanceId: result.attendanceId || "",
      message: "이미 출석 처리되었습니다."
    };
  }

  if (decision.status === "excluded") {
    return {
      eventId: decision.eventId,
      trainingTitle: title,
      eligible: false,
      status: "signature_excluded",
      message: "사전 서명 제외 대상입니다."
    };
  }

  return {
    eventId: decision.eventId,
    trainingTitle: title,
    eligible: false,
    status: "not_target",
    message: result.message || "이 교육의 대상자가 아닙니다."
  };
}

function getEligibilityMessage(status, canSignCount, alreadyCount, blockedCount) {
  if (status === "can_sign") {
    if (alreadyCount > 0 || blockedCount > 0) {
      return "전자서명이 필요한 교육만 출석 처리합니다.";
    }
    return "전자서명이 필요합니다.";
  }

  if (status === "already_attended") return "이미 출석 처리되었습니다.";
  if (status === "signature_excluded") return "사전 서명 제외 대상입니다.";
  return "이 교육의 대상자가 아닙니다.";
}

function submitQrAttendance(req) {
  const mode = req.mode === "group" ? "group" : "single";
  const staffId = String(req.staffId || req["교직원ID"] || "").trim();
  const eventIds = mode === "group" ? getSubmitEventIds(req) : [String(req.eventId || "").trim()].filter(Boolean);
  const signatureDataUrl = req.signatureDataUrl || req.signature;

  if (!staffId) return { success: false, message: "교직원ID가 필요합니다." };
  if (eventIds.length === 0) return { success: false, message: "교육 정보를 찾을 수 없습니다." };
  if (!signatureDataUrl) return { success: false, message: "서명을 입력해주세요." };

  const decisions = eventIds.map((eventId) => getAttendanceDecision(eventId, staffId));
  const needsSignature = decisions.some((decision) => decision.status === "ready");
  const signatureRecord = needsSignature ? saveSignatureImage(req, staffId, eventIds, signatureDataUrl) : {};
  const results = decisions.map((decision) => {
    if (decision.status !== "ready") return decision.result;
    return appendQrAttendance(req, decision.eventId, staffId, signatureRecord);
  });

  const completedCount = results.filter((result) => result.status === "completed").length;
  const skippedCount = results.filter((result) => result.status === "already").length;
  const blockedCount = results.filter((result) => result.status === "notTarget" || result.status === "excluded").length;

  if (mode === "group") {
    return {
      success: true,
      message: "출석 처리가 완료되었습니다.",
      data: {
        ok: true,
        completedCount,
        skippedCount,
        blockedCount,
        signatureId: signatureRecord.signatureId || "",
        signatureFileId: signatureRecord.signatureFileId || "",
        signatureImageUrl: signatureRecord.signatureImageUrl || "",
        results
      }
    };
  }

  const result = results[0];
  return {
    success: result.ok !== false,
    message: result.message,
    data: {
      completedCount,
      skippedCount,
      blockedCount,
      ...result
    }
  };
}

function getSubmitEventIds(req) {
  if (Array.isArray(req.eventIds) && req.eventIds.length > 0) {
    return Array.from(new Set(req.eventIds.map((eventId) => String(eventId || "").trim()).filter(Boolean)));
  }

  const groupId = String(req.groupId || req.eventGroupId || "").trim();
  if (!groupId) return [];

  return getGroupTrainings({ groupId }).data
    .map((row) => stringOf(row, ["eventId", "교육ID"]))
    .filter(Boolean);
}

function getAttendanceDecision(eventId, staffId) {
  const event = getTrainingByEventId(eventId);
  if (!event) {
    return {
      eventId,
      status: "notFound",
      result: {
        ok: false,
        eventId,
        status: "notFound",
        message: "해당 교육을 찾을 수 없습니다."
      }
    };
  }

  const targetRows = getTargetsForEvent(eventId);
  const target = targetRows.find((row) => stringOf(row, STAFF_ID_KEYS) === staffId);
  const staff = getStaffById(staffId) || {};

  if (!isEligibleTrainingTarget(event, targetRows, target, staff)) {
    return {
      eventId,
      status: "notTarget",
      result: {
        ok: true,
        eventId,
        status: "notTarget",
        message: "이 교육의 대상자가 아닙니다."
      }
    };
  }

  if (isSignatureExcluded(target)) {
    return {
      eventId,
      status: "excluded",
      result: {
        ok: true,
        eventId,
        status: "excluded",
        message: "사전에 서명 제외 처리되었습니다."
      }
    };
  }

  const existing = getAttendancesForEvent(eventId).find(
    (row) => stringOf(row, STAFF_ID_KEYS) === staffId
  );

  if (existing) {
    return {
      eventId,
      status: "already",
      result: {
        ok: true,
        status: "already",
        attendanceId: stringOf(existing, ["attendanceId", "출석ID"]),
        eventId,
        message: "이미 출석 처리된 교육입니다.",
        signatureId: stringOf(existing, ["signatureId"]),
        signatureFileId: stringOf(existing, ["signatureFileId"]),
        signatureImageUrl: stringOf(existing, ["signatureImageUrl"])
      }
    };
  }

  return { eventId, status: "ready" };
}

function appendQrAttendance(req, eventId, staffId, signatureRecord) {
  const now = new Date();
  const staff = getStaffById(staffId) || {};
  const event = getTrainingByEventId(eventId) || {};
  const groupId = req.groupId || req.eventGroupId || stringOf(event, ["eventGroupId", "groupId", "묶음ID"]);
  const attendanceId = "AT-" + Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMddHHmmssSSS") + "-" + eventId + "-" + staffId;

  const data = {
    attendanceId,
    "출석ID": attendanceId,
    eventId,
    "교육ID": eventId,
    groupId,
    eventGroupId: groupId,
    "묶음ID": groupId,
    "교직원ID": staffId,
    staffId,
    "성명": stringOf(staff, STAFF_NAME_KEYS) || req.staffName || req.name || "",
    "소속부서": stringOf(staff, DEPARTMENT_KEYS) || req.department || "",
    "직책": stringOf(staff, POSITION_KEYS) || req.position || "",
    "참석일시": now,
    "참석방법": "QR",
    "상태": "출석완료",
    signatureId: signatureRecord.signatureId || "",
    signatureFileId: signatureRecord.signatureFileId || "",
    signatureImageUrl: signatureRecord.signatureImageUrl || "",
    "비고": req.memo || ""
  };

  appendRow(SHEETS.attendance, data);

  return {
    ok: true,
    status: "completed",
    attendanceId,
    eventId,
    groupId,
    staffId,
    staffName: data["성명"],
    department: data["소속부서"],
    attendedAt: data["참석일시"],
    signatureId: data.signatureId,
    signatureFileId: data.signatureFileId,
    signatureImageUrl: data.signatureImageUrl,
    message: "출석 처리가 완료되었습니다."
  };
}

function saveSignatureImage(req, staffId, eventIds, signatureDataUrl) {
  const encoded = String(signatureDataUrl).indexOf(",") >= 0 ? String(signatureDataUrl).split(",").pop() : String(signatureDataUrl);
  const bytes = Utilities.base64Decode(encoded);
  const now = new Date();
  const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
  const year = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy");
  const firstEvent = getTrainingByEventId(eventIds[0]) || {};
  const targetKey = req.groupId || req.eventGroupId || eventIds[0];
  const signatureId = "SIG-" + staffId + "-" + targetKey + "-" + timestamp;
  const fileName = "signature_" + sanitizeFileName(staffId) + "_" + sanitizeFileName(targetKey) + "_" + timestamp + ".png";

  const folder = getOrCreateFolder(
    getOrCreateFolder(getOrCreateFolder(getDriveRootFolder(), SIGNATURE_FOLDER), year),
    sanitizeFileName(eventIds[0])
  );
  const blob = Utilities.newBlob(bytes, "image/png", fileName);
  const file = folder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    // Domain policies may block link sharing. The Drive URL is still saved for authorized users.
  }

  return {
    signatureId,
    signatureFileId: file.getId(),
    signatureImageUrl: file.getUrl()
  };
}

function getAttendanceSummary(req) {
  const eventId = String(req.eventId || "").trim();
  const event = getTrainingByEventId(eventId);

  if (!event) return { success: false, message: "해당 교육을 찾을 수 없습니다." };

  const targets = getTargetsForEvent(eventId);
  const attendanceRows = getAttendancesForEvent(eventId);
  const people = targets.length > 0
    ? targets.map((target) => ({ person: normalizeTargetPersonRow(target), target }))
    : getStaffRows().map((staff) => ({ person: staff, target: null }));
  const rows = people.map((entry, index) => {
    const person = entry.person;
    const target = entry.target;
    const staffId = stringOf(person, STAFF_ID_KEYS);
    const attendance = attendanceRows.find((row) => stringOf(row, STAFF_ID_KEYS) === staffId);
    const eligible = isEligibleTrainingTarget(event, targets, target, person);
    const excluded = eligible && target && isSignatureExcluded(target);
    const recognized = attendance && stringOf(attendance, ["상태", "status"]).indexOf("인정") >= 0;
    const status = !eligible ? "비대상" : excluded ? "서명제외" : recognized ? "인정완료" : attendance ? "출석완료" : "미출석";

    return {
      no: index + 1,
      eventId,
      staffId,
      staffName: stringOf(person, STAFF_NAME_KEYS),
      department: stringOf(person, DEPARTMENT_KEYS),
      position: stringOf(person, POSITION_KEYS),
      targetStatus: eligible ? "대상" : "비대상",
      attendanceStatus: status,
      attendedAt: attendance ? valueOf(attendance, ["참석일시", "attendedAt"]) : "",
      exceptionReason: !eligible ? "교육 대상자가 아닙니다." : excluded ? "사전에 서명 제외 처리" : "",
      signatureId: attendance ? stringOf(attendance, ["signatureId"]) : "",
      signatureFileId: attendance ? stringOf(attendance, ["signatureFileId"]) : "",
      signatureImageUrl: attendance ? stringOf(attendance, ["signatureImageUrl"]) : ""
    };
  });

  const attendedCount = rows.filter((row) => row.attendanceStatus === "출석완료").length;
  const absentCount = rows.filter((row) => row.attendanceStatus === "미출석").length;
  const excludedCount = rows.filter((row) => row.attendanceStatus === "서명제외").length;
  const recognizedCount = rows.filter((row) => row.attendanceStatus === "인정완료").length;
  const targetCount = rows.filter((row) => row.targetStatus === "대상").length;
  const attendanceRate = targetCount > 0 ? Math.round(((attendedCount + recognizedCount) / targetCount) * 1000) / 10 : 0;

  return {
    success: true,
    data: {
      eventId,
      trainingTitle: stringOf(event, ["교육명", "제목", "title"], eventId),
      targetCount,
      attendedCount,
      absentCount,
      excludedCount,
      recognizedCount,
      attendanceRate,
      rows
    }
  };
}

function downloadAttendanceReport(req) {
  const eventId = String(req.eventId || "").trim();
  const event = getTrainingByEventId(eventId);
  if (!event) return { success: false, message: "해당 교육을 찾을 수 없습니다." };

  const summaryResponse = getAttendanceSummary({ eventId });
  if (!summaryResponse.success) return summaryResponse;

  const summary = summaryResponse.data;
  const title = sanitizeFileName(summary.trainingTitle || eventId);
  const year = String(valueOf(event, ["교육연도", "연도", "year"], new Date().getFullYear()));
  const fileName = year + " " + title + "_최종명단.xlsx";
  const spreadsheet = SpreadsheetApp.create(year + " " + title + "_최종명단");
  const sheet = spreadsheet.getSheets()[0];
  sheet.setName("최종명단");

  const headers = ["번호", "소속부서", "성명", "교직원ID", "대상여부", "출석상태", "출석일시", "예외사유", "전자서명"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#EAF0F7");
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, 8, 120);
  sheet.setColumnWidth(9, 210);

  summary.rows.forEach((row, index) => {
    const sheetRow = index + 2;
    sheet.getRange(sheetRow, 1, 1, headers.length).setValues([[
      row.no,
      row.department,
      row.staffName,
      row.staffId,
      row.targetStatus,
      row.attendanceStatus,
      row.attendedAt,
      row.exceptionReason,
      row.signatureImageUrl || ""
    ]]);
    sheet.setRowHeight(sheetRow, 72);

    if (row.signatureFileId) {
      try {
        const imageBlob = DriveApp.getFileById(row.signatureFileId).getBlob();
        sheet.insertImage(imageBlob, 9, sheetRow).setWidth(180).setHeight(56);
      } catch (err) {
        sheet.getRange(sheetRow, 9).setValue(row.signatureImageUrl || "서명 이미지 확인 필요");
      }
    }
  });

  SpreadsheetApp.flush();
  const xlsxBlob = exportSpreadsheetAsXlsx(spreadsheet.getId(), fileName);
  const reportFolder = getOrCreateFolder(getOrCreateFolder(getDriveRootFolder(), REPORT_FOLDER), year);
  const xlsxFile = reportFolder.createFile(xlsxBlob);

  try {
    xlsxFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    // Domain policies may block link sharing.
  }

  try {
    DriveApp.getFileById(spreadsheet.getId()).setTrashed(true);
  } catch (err) {
    // Keep the temporary sheet if trashing is blocked.
  }

  return {
    success: true,
    data: {
      fileId: xlsxFile.getId(),
      fileUrl: xlsxFile.getUrl(),
      fileName
    }
  };
}

function exportSpreadsheetAsXlsx(spreadsheetId, fileName) {
  const url = "https://docs.google.com/spreadsheets/d/" + spreadsheetId + "/export?format=xlsx";
  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken()
    },
    muteHttpExceptions: true
  });

  if (response.getResponseCode() >= 400) {
    throw new Error("최종 명단 파일을 생성하지 못했습니다.");
  }

  return response.getBlob().setName(fileName);
}

function uploadCertificate(req) {
  const now = new Date();
  const uploadId = req.uploadId || "UP-" + now.getTime();
  const data = {
    uploadId,
    "업로드ID": uploadId,
    eventId: req.eventId || "",
    "교육ID": req.eventId || "",
    "업로드일시": now,
    "타임스탬프": now,
    "교직원ID": req.staffId || req["교직원ID"] || "",
    "성명": req.name || req.staffName || req["성명"] || "",
    "소속부서": req.department || req["소속부서"] || "",
    "연수명": req.trainingTitle || req["연수명"] || "",
    "이수증번호": req.certificateNumber || req["이수증번호"] || "",
    "이수기관": req.issuer || req["이수기관"] || "",
    "이수일자": req.completedAt || req["이수일자"] || "",
    "파일명": req.fileName || "",
    "파일링크": req.fileLink || req.fileUrl || "",
    "파일URL": req.fileUrl || req.fileLink || "",
    "상태": "제출완료",
    "AI추출상태": req.aiReviewStatus || "pending",
    "비고": req.memo || ""
  };

  appendRow(SHEETS.uploads, data);
  return {
    success: true,
    message: "이수증 제출이 완료되었습니다.",
    data
  };
}

function getTrainingByEventId(eventId) {
  return safeRows(SHEETS.trainings).find((row) => stringOf(row, ["eventId", "교육ID"]) === String(eventId || "").trim());
}

function getStaffById(staffId) {
  return getStaffRows().find((row) => stringOf(row, STAFF_ID_KEYS) === String(staffId || "").trim());
}

function getTargetsForEvent(eventId) {
  return safeRows(SHEETS.targets).filter((row) => stringOf(row, ["eventId", "교육ID"]) === String(eventId || "").trim());
}

function getAttendancesForEvent(eventId) {
  return safeRows(SHEETS.attendance).filter((row) => stringOf(row, ["eventId", "교육ID"]) === String(eventId || "").trim());
}

function isSignatureExcluded(target) {
  if (!target) return false;
  const direct = valueOf(target, ["서명제외", "서명제외여부", "signatureExcluded", "제외여부"]);
  const status = stringOf(target, ["상태", "대상상태", "예외사유", "비고"]);
  return truthy(direct) || status.indexOf("서명제외") >= 0 || status.indexOf("면제") >= 0;
}

function isExplicitTrainingTarget(target) {
  if (!target) return false;
  const status = stringOf(target, ["대상여부", "대상자여부", "대상상태", "상태", "비고"]);
  if (status.indexOf("비대상") >= 0 || status.indexOf("미대상") >= 0) return false;
  return true;
}

function isEligibleTrainingTarget(event, targetRows, target, staff) {
  if (target) return isExplicitTrainingTarget(target);
  if (!staff || !stringOf(staff, STAFF_ID_KEYS)) return false;

  const targetText = stringOf(event, ["대상", "교육대상", "target", "targetAudience"]);
  const normalizedTarget = targetText.replace(/\s/g, "");
  const department = stringOf(staff, DEPARTMENT_KEYS);
  const position = stringOf(staff, POSITION_KEYS);
  const staffStatus = stringOf(staff, STAFF_STATUS_KEYS, "재직");
  const submissionTarget = stringOf(staff, SUBMISSION_TARGET_KEYS, "대상");
  const isActive = staffStatus !== "퇴직" && staffStatus !== "퇴사";
  const isSubmissionTarget = submissionTarget === "" || submissionTarget === "대상" || submissionTarget.toLowerCase() === "true";
  const isTeacher = position.indexOf("교사") >= 0 || position.indexOf("교원") >= 0 || position.indexOf("보건교사") >= 0 || position.indexOf("기간제") >= 0;
  const isStaff = position.indexOf("행정") >= 0 || position.indexOf("공무직") >= 0 || position.indexOf("직원") >= 0 || position.indexOf("실무") >= 0;

  if (!targetText && targetRows.length === 0) return true;
  if (normalizedTarget.indexOf("전교직원") >= 0 || normalizedTarget.indexOf("전체") >= 0 || normalizedTarget.toLowerCase() === "all") {
    return isActive && isSubmissionTarget;
  }
  if (targetText.indexOf("교직원") >= 0) return isActive && isSubmissionTarget;
  if (targetText.indexOf("교원") >= 0) return isActive && isSubmissionTarget && isTeacher;
  if (targetText.indexOf("교사") >= 0) return isActive && isSubmissionTarget && isTeacher;
  if (targetText.indexOf("직원") >= 0) return isActive && isSubmissionTarget && isStaff;
  if (department && targetText.indexOf(department) >= 0) return true;

  return targetRows.length === 0;
}

function getDriveRootFolder() {
  return getOrCreateFolder(DriveApp.getRootFolder(), DRIVE_ROOT_FOLDER);
}

function getOrCreateFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}

function sanitizeFileName(value) {
  return String(value || "")
    .replace(/[\\/:*?"<>|#%{}~&]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
