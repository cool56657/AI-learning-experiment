const SPREADSHEET_ID = '1iooZZq2uNAtKr1_t8gaZrRgv2hciAxHBIo1L3pKXSBM';
const DRIVE_FOLDER_ID = '1xmMUUANabY7fHFlA71r7Py1U5DUc1SYU';

function doPost(e) {
  try {
    // text/plain과 application/json 둘 다 처리
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      payload = JSON.parse(e.parameter.data);
    } else {
      throw new Error('No data received');
    }

    const type = payload.type;
    const data = payload.data;

    if (type === 'csv') {
      saveToSpreadsheet(data);
    } else if (type === 'chat') {
      saveChatToFile(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // 오류 내용을 로그에 기록
    console.error('doPost error:', err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveToSpreadsheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('실험데이터');
  if (!sheet) {
    sheet = ss.insertSheet('실험데이터');
  }

  // 헤더가 없으면 첫 행에 추가
  if (sheet.getLastRow() === 0) {
    const headers = Object.keys(data);
    sheet.appendRow(headers);
  }

  // 헤더 기준으로 데이터 행 추가
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => {
    const val = data[h];
    return val !== undefined && val !== null ? String(val) : '';
  });
  sheet.appendRow(row);
}

function saveChatToFile(data) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const fileName = `${data.pid}_chat_${new Date().toISOString().slice(0,10)}.txt`;

  let content = `참가자: ${data.pid} | 조건: ${data.condLabel}\n`;
  content += `실험 시작: ${data.startTime}\n`;
  content += `실험 종료: ${data.endTime}\n\n`;
  content += '='.repeat(50) + '\n';
  content += `섹션 A 대화 내용 (총 ${data.chatCountA}회)\n`;
  content += '='.repeat(50) + '\n\n';

  if (data.chatA && data.chatA.length > 0) {
    data.chatA.forEach(m => {
      content += `[${m.role === 'user' ? '참가자' : 'ChatGPT'}]\n${m.content}\n\n`;
    });
  } else {
    content += '(대화 없음)\n\n';
  }

  content += '='.repeat(50) + '\n';
  content += `섹션 B 대화 내용 (총 ${data.chatCountB}회)\n`;
  content += '='.repeat(50) + '\n\n';

  if (data.chatB && data.chatB.length > 0) {
    data.chatB.forEach(m => {
      content += `[${m.role === 'user' ? '참가자' : 'ChatGPT'}]\n${m.content}\n\n`;
    });
  } else {
    content += '(대화 없음)\n\n';
  }

  folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: '스크립트가 정상 작동 중입니다.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
