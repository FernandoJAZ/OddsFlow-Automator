# 📈 Scraper Automático de Cuotas a Google Sheets

Este proyecto automatiza la extracción de cuotas de apuestas deportivas directamente desde el navegador a una hoja de cálculo de Google Sheets en tiempo real.

## 🚀 Componentes

1.  **Google Apps Script**: Recibe los datos y los organiza en el Excel.
2.  **JS Scraper (Consola)**: Extrae la información de la web y gestiona los tiempos de envío.

---

## 🛠️ Configuración

### 1. Google Sheets
1. Crea una hoja de cálculo.
2. Anota el **ID de la hoja** (se encuentra en la URL: `https://docs.google.com/spreadsheets/d/TU_ID_AQUI/edit`).
3. Crea las pestañas necesarias: `Partido1`, `Partido2`, etc.

### 2. Google Apps Script
1. En tu hoja de cálculo, ve a **Extensiones > Apps Script**.
2. Pega el contenido de `codigo-gas.gs`.
3. Sustituye el ID del script por el tuyo en la línea:
   `const ss = SpreadsheetApp.openById('TU_ID_AQUI');`
4. Haz clic en **Desplegar > Nueva implementación**.
5. Selecciona **Tipo: Aplicación Web**.
6. Configura: 
   - **Ejecutar como**: Yo.
   - **Quién tiene acceso**: Cualquiera.
7. **IMPORTANTE**: Copia la URL de la aplicación web generada.

### 3. Consola de Firefox
1. Abre la web del partido.
2. Abre la consola (F12 o Ctrl+Shift+K).
3. Pega el contenido de `consola_firefox.js`.
4. **Configura las variables al inicio del script**:
   - `NOMBRE_PESTANA_EN_SHEET`: Nombre de la pestaña de destino.
   - `APPS_SCRIPT_WEB_APP_URL`: La URL que copiaste en el paso anterior.
5. Pulsa Enter.

---

## 📋 Características Especiales
- **Envío Masivo**: Envía todas las casas de apuestas detectadas en un solo paquete para evitar errores de saturación.
- **Detección de Fila Inteligente**: Solo busca el final de los datos en la Columna A, permitiendo que tengas fórmulas en las columnas J, K, L, etc., sin que el script salte filas.
- **Sincronización**: Los envíos se realizan cada 5 minutos, sincronizados con las horas en punto (ej. 12:05, 12:10, 12:15).

---

## ⚠️ Notas
- Si realizas cambios en el código de Google Apps Script, debes realizar un **Nuevo Despliegue** y seleccionar **Versión: Nueva** para que los cambios surtan efecto.
