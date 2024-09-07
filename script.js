document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '5bc1cec6967623eb3dcfbc4a';
    const apiUrlUSD = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    const apiUrlARS = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/ARS`;
    const apiUrlDolarBlue = 'https://criptoya.com/api/dolar';
    const apiUrlCriptoYa = 'https://criptoya.com/api/binancep2p/USDT/ARS/1';

    const cotizacionesUSD = document.getElementById('cotizaciones-usd');
    const cotizacionesARS = document.getElementById('cotizaciones-ars');
    const dolarBlueDiv = document.getElementById('dolar-blue');
    const dolarCriptoDiv = document.getElementById('dolar-cripto');
    const favoritasList = document.getElementById('favoritas-list');
    const convertirButton = document.getElementById('convertir');
    const resultadoDiv = document.getElementById('resultado');
    const montoInput = document.getElementById('monto');
    const monedaOrigenSelect = document.getElementById('moneda-origen');
    const monedaDestinoSelect = document.getElementById('moneda-destino');
    const cursoSelect = document.getElementById('curso-select'); // Selector de cursos
    const cursoPreciosDiv = document.getElementById('curso-precios'); // Div donde se mostrarán los precios del curso

    let dolarBlueVenta, dolarCriptoVenta, tasaCambioUSDARS;
    let rates = {};

    const currencyNames = {
        'ARS': 'Peso Argentino',
        'BRL': 'Real Brasileño',
        'CLP': 'Peso Chileno',
        'COP': 'Peso Colombiano',
        'MXN': 'Peso Mexicano',
        'PEN': 'Sol Peruano',
        'UYU': 'Peso Uruguayo',
        'EUR': 'Euro',
    };

    const flagMapping = {
        'ARS': 'ar',
        'BRL': 'br',
        'CLP': 'cl',
        'COP': 'co',
        'MXN': 'mx',
        'PEN': 'pe',
        'UYU': 'uy',
        'EUR': 'eu',
    };

    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
    if (!favoritos || typeof favoritos !== 'object') {
        favoritos = {};
    }

    const cursos = [
        { nombre: "Master Fade", precios: { regularMasterFade: 47, regularCutting: 37, ofertaPorHoy: 66 } },
        { nombre: "Focus", precioUSD: 147 }
    ];

    function showTab(tabName) {
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.style.display = 'none';
        });
        document.getElementById(tabName).style.display = 'block';
    }

    function actualizarFavoritas() {
        favoritasList.innerHTML = '';

        if (Object.keys(favoritos).length === 0) {
            favoritasList.innerHTML = '<p>No tienes favoritos seleccionados</p>';
        } else {
            Object.keys(favoritos).forEach(currency => {
                const value = favoritos[currency];
                favoritasList.innerHTML += `<div class="cotizacion-item">
                                              <span>${value}</span> 
                                              <button class="delete-favorite" onclick="eliminarFavorito('${currency}')">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                              </button>
                                            </div>`;
            });
        }
    }

    function toggleFavorito(currency, value) {
        if (favoritos[currency]) {
            delete favoritos[currency];
        } else {
            favoritos[currency] = value;
        }
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        actualizarFavoritas();
    }

    function eliminarFavorito(currency) {
        delete favoritos[currency];
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        actualizarFavoritas();

        const switchElement = document.querySelector(`input[type="checkbox"][onclick*="'${currency}'"]`);
        if (switchElement) {
            switchElement.checked = false;
        }
    }

    function mostrarPreciosCursoSeleccionado() {
        const selectedCourse = cursoSelect.value;
        const curso = cursos.find(c => c.nombre === selectedCourse);

        if (!curso) {
            console.error('No se encontró el curso seleccionado.');
            return;
        }

        // Limpiamos el div donde mostraremos los precios
        cursoPreciosDiv.innerHTML = '';

        if (selectedCourse === "Master Fade") {
            let precioMasterFadeUSD = curso.precios.regularMasterFade;
            let precioCuttingUSD = curso.precios.regularCutting;
            let precioOfertaUSD = curso.precios.ofertaPorHoy;

            cursoPreciosDiv.innerHTML = `
            <div style="width: 100%;  color: white; padding: 10px; border-radius: 10px;">
                    <h3>${curso.nombre}</h3>
                    <p>Precio regular Master Fade: $${precioMasterFadeUSD} USD</p>
                    <p>Precio regular Cutting Mastery: $${precioCuttingUSD} USD</p>
                    <p>Precio oferta por hoy: $${precioOfertaUSD} USD</p>
                    <div id="precios-convertidos">`;

            Object.keys(currencyNames).forEach(moneda => {
                if (rates[moneda] && moneda !== 'USD' && moneda !== 'USDT') {  // Ignoramos USD y USDT
                    let precioEnMonedaMasterFade, precioEnMonedaCutting, precioEnMonedaOferta;

                    if (moneda === 'ARS') { // Precio fijo para Argentina
                        precioEnMonedaMasterFade = (47000).toFixed(2);
                        precioEnMonedaCutting = (37000).toFixed(2);
                        precioEnMonedaOferta = (66000).toFixed(2);
                    } else {
                        precioEnMonedaMasterFade = (precioMasterFadeUSD * rates[moneda]).toFixed(2);
                        precioEnMonedaCutting = (precioCuttingUSD * rates[moneda]).toFixed(2);
                        precioEnMonedaOferta = (precioOfertaUSD * rates[moneda]).toFixed(2);
                    }

                    const flagCode = flagMapping[moneda];

                    const textoParaCopiar = `- Precio regular Master Fade: $${precioEnMonedaMasterFade} ${moneda}\n` +
                                            `- Precio regular Cutting Mastery: $${precioEnMonedaCutting} ${moneda}\n` +
                                            `- Precio OFERTA DE HOY ! Master Fade + Cutting por: $${precioEnMonedaOferta} ${moneda}`;

                    cursoPreciosDiv.innerHTML += `
                        <div class="curso-precio" style="margin-bottom: 2px;">
                            <img src="https://flagcdn.com/16x12/${flagCode}.png" alt="${currencyNames[moneda]}" style="width: 20px; height: 14px; margin-right: 5px;">
                            <strong>${currencyNames[moneda]} (${moneda}):</strong><br>
                            - Precio regular Master Fade: $${precioEnMonedaMasterFade} ${moneda}<br>
                            - Precio regular Cutting Mastery: $${precioEnMonedaCutting} ${moneda}<br>
                            - Precio oferta por hoy: $${precioEnMonedaOferta} ${moneda}<br>
                            <button class="copy-btn" style="margin-top: 5px; padding: 5px 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;" data-precio="${textoParaCopiar}">
                                Copiar precios de ${currencyNames[moneda]}
                            </button>
                        </div>`;
                }
            });

            cursoPreciosDiv.innerHTML += '</div>';
        } else if (selectedCourse === "Focus") {
            let precioFocusUSD = curso.precioUSD;

            cursoPreciosDiv.innerHTML = `
                <div style="width: 100%;  color: white; padding: 10px; border-radius: 10px;">
                    <h3>${curso.nombre}</h3>
                    <p>Precio en USD: $${precioFocusUSD} USD</p>
                    <div id="precios-convertidos">`;

            Object.keys(currencyNames).forEach(moneda => {
                if (rates[moneda] && moneda !== 'USD' && moneda !== 'USDT') {
                    let precioEnMonedaFocus;

                    if (moneda === 'ARS') {
                        precioEnMonedaFocus = (97000).toFixed(2);
                    } else {
                        precioEnMonedaFocus = (precioFocusUSD * rates[moneda]).toFixed(2);
                    }

                    const flagCode = flagMapping[moneda];

                    const textoParaCopiar = `- Precio Focus: $${precioEnMonedaFocus} ${moneda}`;

                    cursoPreciosDiv.innerHTML += `
                        <div class="curso-precio" style="margin-bottom: 2px;">
                            <img src="https://flagcdn.com/16x12/${flagCode}.png" alt="${currencyNames[moneda]}" style="width: 20px; height: 14px; margin-right: 5px;">
                            <strong>${currencyNames[moneda]} (${moneda}):</strong><br>
                            - Precio Focus: $${precioEnMonedaFocus} ${moneda}<br>
                            <button class="copy-btn" style="margin-top: 5px; padding: 5px 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;" data-precio="${textoParaCopiar}">
                                Copiar precios de ${currencyNames[moneda]}
                            </button>
                        </div>`;
                }
            });

            cursoPreciosDiv.innerHTML += '</div>';
        }

        // Añadir funcionalidad para copiar texto
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const textoParaCopiar = event.target.getAttribute('data-precio');
                copiarTexto(textoParaCopiar);
            });
        });
    }

    function copiarTexto(texto) {
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('Texto copiado: \n' + texto);
        } catch (err) {
            console.error('Error al copiar el texto: ', err);
            alert('No se pudo copiar el texto. Por favor, copia manualmente.');
        }
        document.body.removeChild(textarea);
    }
    

    // Llenar el select de cursos al cargar la página
    function llenarSelectorCursos() {
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.nombre;
            option.textContent = curso.nombre;
            cursoSelect.appendChild(option);
        });
    }

    fetch(apiUrlUSD)
    .then(response => response.json())
    .then(data => {
        rates = data.conversion_rates;
        tasaCambioUSDARS = rates['ARS'];
        cotizacionesUSD.innerHTML = '<h2>Cotizaciones en relación al USD</h2>';

        Object.keys(currencyNames).forEach(currency => {
            if (rates[currency]) {
                const checked = favoritos[currency] ? 'checked' : '';
                
                // Agregamos la bandera utilizando el código del país
                const countryCode = currency.slice(0, 2).toLowerCase();  // Obtener los primeros 2 caracteres del código de moneda
                const flagUrl = `https://flagcdn.com/24x18/${countryCode}.png`;  // URL de la bandera

                cotizacionesUSD.innerHTML += `<div class="cotizacion-item">
                                                <img src="${flagUrl}" alt="Bandera de ${currencyNames[currency]}" width="24" height="18">
                                                <span> ${currencyNames[currency]} $${rates[currency]}  = 1 USD </span> 
                                                <label class="switch">
                                                  <input type="checkbox" ${checked} onclick="toggleFavorito('${currency}', '${currencyNames[currency]} (${currency}): ${rates[currency]}')">
                                                  <span class="slider"></span>
                                                </label>
                                              </div>`;
            }
        });

        llenarSelectorCursos(); // Llenar los cursos al cargar la página
    })
    .catch(error => console.error('Error al obtener cotizaciones en USD:', error));


    fetch(apiUrlDolarBlue)
        .then(response => response.json())
        .then(data => {
            dolarBlueCompra = data.blue ? data.blue.bid : 0;
            dolarBlueVenta = data.blue ? data.blue.ask : 0;

            const dolarBlueValue = `(BLUE) Compra: ${dolarBlueCompra} ARS | Venta: ${dolarBlueVenta} ARS`;
            const checked = favoritos['DolarBlue'] ? 'checked' : '';

            dolarBlueDiv.innerHTML = `<h2>Precio del Dólar Blue en Argentina</h2>
                                      <div class="cotizacion-item">
                                        <span>${dolarBlueValue}  </span>
                                        <label class="switch">
                                          <input type="checkbox" ${checked} onclick="toggleFavorito('DolarBlue', '${dolarBlueValue}')">
                                          <span class="slider"></span>
                                        </label>
                                      </div>`;
        })
        .catch(error => {
            console.error('Error al obtener el precio del dólar blue:', error);
            dolarBlueDiv.innerHTML = `<h2>Precio del Dólar Blue en Argentina</h2>
                                      <div class="cotizacion-item">
                                        <span>(BLUE) Compra: 0 ARS | Venta: 0 ARS</span>
                                      </div>`;
        });

    fetch(apiUrlCriptoYa)
        .then(response => response.json())
        .then(data => {
            const dolarCriptoCompra = data.bid;
            dolarCriptoVenta = data.ask;
            const dolarCriptoValue = `(USDT) Compra: ${dolarCriptoCompra} ARS | Venta: ${dolarCriptoVenta} ARS`;
            const checked = favoritos['DolarCripto'] ? 'checked' : '';

            dolarCriptoDiv.innerHTML = `<h2>Precio del Dólar Cripto (USDT) en Binance P2P</h2>
                                        <div class="cotizacion-item">
                                          <span>${dolarCriptoValue}  </span>
                                          <label class="switch">
                                            <input type="checkbox" ${checked} onclick="toggleFavorito('DolarCripto', '${dolarCriptoValue}')">
                                            <span class="slider"></span>
                                          </label>
                                        </div>`;
        })
        .catch(error => console.error('Error al obtener el precio del dólar cripto desde CriptoYa:', error));

    convertirButton.addEventListener('click', () => {
        const monto = parseFloat(montoInput.value);
        const monedaOrigen = monedaOrigenSelect.value;
        const monedaDestino = monedaDestinoSelect.value;
        let resultado;

        if (monedaOrigen === 'USD' && monedaDestino === 'ARS') {
            resultado = monto * dolarBlueVenta;
        } else if (monedaOrigen === 'ARS' && monedaDestino === 'USD') {
            resultado = monto / dolarBlueVenta;
        } else if (monedaOrigen === 'USD' && monedaDestino === 'USDT') {
            resultado = monto * (dolarBlueVenta / dolarCriptoVenta);
        } else if (monedaOrigen === 'USDT' && monedaDestino === 'ARS') {
            resultado = monto * dolarCriptoVenta;
        } else if (monedaOrigen === 'ARS' && monedaDestino === 'USDT') {
            resultado = monto / dolarCriptoVenta;
        } else if (monedaOrigen === 'EUR' && monedaDestino === 'ARS') {
            resultado = monto * (rates['USD'] * dolarBlueVenta / rates['EUR']);
        } else if (monedaOrigen === 'ARS' && monedaDestino === 'EUR') {
            resultado = monto / (rates['USD'] * dolarBlueVenta / rates['EUR']);
        } else if (rates[monedaOrigen] && rates[monedaDestino]) {
            resultado = monto * (rates[monedaDestino] / rates[monedaOrigen]);
        }

        if (resultado) {
            resultadoDiv.innerHTML = `<p>${monto} ${monedaOrigen} equivale a ${resultado.toFixed(2)} ${monedaDestino}</p>`;
        } else {
            resultadoDiv.innerHTML = `<p>No se pudo realizar la conversión</p>`;
        }
    });

    cursoSelect.addEventListener('change', mostrarPreciosCursoSeleccionado);

    actualizarFavoritas();
    showTab('todos');

    window.showTab = showTab;
    window.toggleFavorito = toggleFavorito;
    window.eliminarFavorito = eliminarFavorito;
});
