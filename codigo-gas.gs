function doPost(e) {
  if (!e || !e.postData) return ContentService.createTextOutput("No data");

  try {
    const dataArray = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById('ID_HOJA_DE_CALCULO_GOOGLE_SHEETS');
    
    const registros = Array.isArray(dataArray) ? dataArray : [dataArray];
    if (registros.length === 0) return ContentService.createTextOutput("Empty data");

    const nombrePestana = registros[0].partido || 'NoPartido';
    let sheet = ss.getSheetByName(nombrePestana);
    if (!sheet) sheet = ss.getSheetByName('NoPartido');

    // --- LÓGICA DE PRECISIÓN ABSOLUTA ---
    
    // Traemos los datos de la columna A hasta la última fila que TENGA ALGO (incluso fórmulas)
    const valoresA = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getValues();
    let ultimaFilaReal = 0;

    // Buscamos de arriba a abajo la primera celda REALMENTE vacía en la columna A
    // Usamos un bucle simple para encontrar el primer hueco
    for (let i = 0; i < valoresA.length; i++) {
      if (valoresA[i][0] === "" || valoresA[i][0] === null || valoresA[i][0] === undefined) {
        ultimaFilaReal = i; // Encontramos el índice del primer hueco
        break;
      }
    }
    
    // Si no encontró huecos (hoja llena), se va al final
    if (ultimaFilaReal === 0 && valoresA[0][0] !== "") {
        ultimaFilaReal = valoresA.length;
    }

    const filaInicio = ultimaFilaReal + 1;

    const bloqueParaEscribir = registros.map(reg => [
      new Date(),         
      reg.partido || '',  
      reg.casa || '',     
      reg.cuota1 || '',   
      reg.cuotaX || '',   
      reg.cuota2 || '',   
      reg.payout || ''    
    ]);

    // FORZAMOS la escritura en el hueco encontrado
    sheet.getRange(filaInicio, 1, bloqueParaEscribir.length, 7).setValues(bloqueParaEscribir);

    return ContentService.createTextOutput("OK - Escrito en fila " + filaInicio)
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader("Access-Control-Allow-Origin", "*");

  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}
