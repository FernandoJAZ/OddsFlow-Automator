function iniciarEnvioCuotasAutomatico() {

    // --- CONFIGURACIÓN ESPECÍFICA PARA CADA PESTAÑA DEL NAVEGADOR ---
    const NOMBRE_PESTANA_EN_SHEET = 'Partido1'; // <--- ¡CAMBIA ESTO PARA CADA PARTIDO/PESTAÑA!
    const APPS_SCRIPT_WEB_APP_URL = 'ESCRIBE_AQUI_TU_URL_DE_GOOGLE_APPS_SCRIPT';

    // --- CONFIGURACIÓN ADICIONAL PARA LA EXTRACCIÓN DE DATOS ---
    const MIN_FILAS_ESPERADAS = 8; // Esperamos al menos 8 filas de cuotas
    const MAX_INTENTOS = 10;     // Número máximo de intentos para leer los datos
    const RETRASO_ENTRE_INTENTOS_MS = 1000; // 1 segundo de retraso entre intentos

    // Función para obtener las cuotas 1X2 de la página
    function obtenerCuotas1X2() {
        return new Promise((resolve, reject) => {
            let intentos = 0;

            const intentarObtener = () => {
                const filas = document.querySelectorAll('[data-testid="over-under-expanded-row"]');
                
                if (filas.length >= MIN_FILAS_ESPERADAS || intentos >= MAX_INTENTOS) {
                    const resultados = [];
                    filas.forEach(fila => {
                        const casaDiv = fila.querySelector('[provider-name]');
                        let nombreCasa = casaDiv ? casaDiv.innerText.trim().split('\n')[0] : 'Desconocido';

                        const cuotasDivs = fila.querySelectorAll('[data-testid="odd-container"]');
                        const cuota1 = cuotasDivs[0]?.innerText.trim() || '';
                        const cuotaX = cuotasDivs[1]?.innerText.trim() || '';
                        const cuota2 = cuotasDivs[2]?.innerText.trim() || '';

                        const payoutDiv = fila.querySelector('[data-testid="payout-container"]');
                        const payout = payoutDiv ? payoutDiv.innerText.trim() : '';

                        if (cuota1 || cuotaX || cuota2 || payout) {
                            resultados.push({
                                partido: NOMBRE_PESTANA_EN_SHEET,
                                casa: nombreCasa,
                                cuota1: cuota1,
                                cuotaX: cuotaX,
                                cuota2: cuota2,
                                payout: payout
                            });
                        }
                    });
                    
                    if (resultados.length >= MIN_FILAS_ESPERADAS) {
                        console.log(`✅ Datos encontrados (${resultados.length} filas) después de ${intentos + 1} intentos.`);
                        resolve(resultados);
                    } else if (intentos >= MAX_INTENTOS) {
                        console.warn(`⚠️ Máximo de intentos (${MAX_INTENTOS}) alcanzado. Se encontraron ${resultados.length} filas.`);
                        resolve(resultados);
                    } else {
                        intentos++;
                        console.log(`🔍 Intento ${intentos}: Se encontraron ${resultados.length} filas. Reintentando en ${RETRASO_ENTRE_INTENTOS_MS / 1000}s...`);
                        setTimeout(intentarObtener, RETRASO_ENTRE_INTENTOS_MS);
                    }
                } else {
                    intentos++;
                    console.log(`🔍 Intento ${intentos}: No se encontraron suficientes filas. Reintentando en ${RETRASO_ENTRE_INTENTOS_MS / 1000}s...`);
                    setTimeout(intentarObtener, RETRASO_ENTRE_INTENTOS_MS);
                }
            };
            intentarObtener();
        });
    }

    // NUEVA FUNCIÓN: Enviar EL BLOQUE COMPLETO de datos
    function enviarBloqueDatosAlSheet(listaDatos) {
        fetch(APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listaDatos) // Enviamos el array completo
        })
        .then(() => {
            console.log(`✔ Bloque de ${listaDatos.length} filas enviado correctamente a Google Sheets.`);
        })
        .catch(err => {
            console.error('❌ Error al enviar el bloque de datos:', err);
        });
    }

    // Orquesta la obtención y el envío (MODIFICADA PARA ENVÍO MASIVO)
    async function procesarYEnviarTodo() {
        console.log(`🔄 Iniciando proceso para ${NOMBRE_PESTANA_EN_SHEET}...`);
        try {
            const cuotas = await obtenerCuotas1X2();
            if (cuotas.length > 0) {
                // En lugar de un forEach, enviamos todo el array de una vez
                enviarBloqueDatosAlSheet(cuotas);
            } else {
                console.warn(`⚠️ No se extrajeron datos válidos para enviar.`);
            }
        } catch (error) {
            console.error(`❌ Error en el proceso:`, error);
        }
    }

    // --- LÓGICA DE INICIO Y INTERVALO ---

    console.log('🚀 Script activado. Esperando primer ciclo...');
    procesarYEnviarTodo();

    const ahora = new Date();
    const horaObjetivo = new Date();
    horaObjetivo.setHours(ahora.getHours(), ahora.getMinutes(), 0, 0);

    let minutosAjuste = 5 - (ahora.getMinutes() % 5);
    if (minutosAjuste === 5) minutosAjuste = 0;
    
    horaObjetivo.setMinutes(ahora.getMinutes() + minutosAjuste, 0, 0);

    if (horaObjetivo.getTime() <= ahora.getTime()) {
        horaObjetivo.setMinutes(horaObjetivo.getMinutes() + 5);
    }
    
    const tiempoHastaPrimerIntervalo = horaObjetivo.getTime() - ahora.getTime();

    if (tiempoHastaPrimerIntervalo > 0) {
        console.log(`⌛ Próximo envío programado a las ${horaObjetivo.toLocaleTimeString('es-ES')}`);
        setTimeout(() => {
            procesarYEnviarTodo();
            setInterval(procesarYEnviarTodo, 5 * 60 * 1000);
            console.log('🔄 Ciclo de 5 minutos iniciado.');
        }, tiempoHastaPrimerIntervalo);
    } else {
        console.log('🔄 Iniciando ciclo de 5 minutos inmediatamente.');
        setInterval(procesarYEnviarTodo, 5 * 60 * 1000);
    }
}

iniciarEnvioCuotasAutomatico();
