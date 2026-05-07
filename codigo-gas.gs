function doPost(e) {
  if (!e || !e.postData) return ContentService.createTextOutput("No data");

  try {
    const dataArray = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById('ESCRIBE_AQUI_TU_ID_DE_LA_HOJA_DE_CALCULO');
    
    const registros = Array.isArray(dataArray) ? dataArray : [dataArray];
    if (registros.length === 0) return ContentService.createTextOutput("Empty data");

    const nombrePestana = registros[0].partido || 'NoPartido';
    let sheet = ss.getSheetByName(nombrePestana);
    if (!sheet) sheet = ss.getSheetByName('NoPartido');

    // --- LÓGICA DE PRECISIÓN PARA LA COLUMNA A ---
    
    // Obtenemos todos los valores de la columna A para encontrar el final real
    const valoresA = sheet.getRange("A:A").getValues();
    let ultimaFilaConDatos = 0;

    // Recorremos de abajo hacia arriba para encontrar la última celda con contenido en A
    for (let i = valoresA.length - 1; i >= 0; i--) {
      if (valoresA[i][0] !== "" && valoresA[i][0] !== null) {
        ultimaFilaConDatos = i + 1;
        break;
      }
    }

    // La escritura empezará justo en la fila siguiente
    const filaInicio = ultimaFilaConDatos + 1;

    // Preparamos el bloque de datos (Columnas A hasta G)
    const bloqueParaEscribir = registros.map(reg => [
      new Date(),         // A: Timestamp
      reg.partido || '',  // B
      reg.casa || '',     // C
      reg.cuota1 || '',   // D
      reg.cuotaX || '',   // E
      reg.cuota2 || '',   // F
      reg.payout || ''    // G
    ]);

    // Escribimos el bloque: (Fila inicio, Columna 1, Número de filas, 7 columnas)
    sheet.getRange(filaInicio, 1, bloqueParaEscribir.length, 7).setValues(bloqueParaEscribir);

    return ContentService.createTextOutput("OK - Escritas " + registros.length + " filas desde la fila " + filaInicio)
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader("Access-Control-Allow-Origin", "*");

  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}
