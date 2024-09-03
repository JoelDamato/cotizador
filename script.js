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
        'USDT': 'Dólar Cripto (USDT)',
        'EUR': 'Euro',
    };

    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};

    function showTab(tabName) {
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.style.display = 'none';
        });
        document.getElementById(tabName).style.display = 'block';
    }

    function actualizarFavoritas() {
        favoritasList.innerHTML = '';
        Object.keys(favoritos).forEach(currency => {
            const value = favoritos[currency];
            favoritasList.innerHTML += `<div class="cotizacion-item">
                                          <span>${value}  </span> 
                                          <button class="delete-favorite" onclick="eliminarFavorito('${currency}')">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                          </button>
                                        </div>`;
        });
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

        // Apagar el switch correspondiente
        const switchElement = document.querySelector(`input[type="checkbox"][onclick*="'${currency}'"]`);
        if (switchElement) {
            switchElement.checked = false;
        }
    }

    // Obtener y mostrar cotizaciones en relación al USD
    fetch(apiUrlUSD)
        .then(response => response.json())
        .then(data => {
            rates = data.conversion_rates;
            tasaCambioUSDARS = rates['ARS'];
            cotizacionesUSD.innerHTML = '<h2>Cotizaciones en relación al USD</h2>';
            
            Object.keys(currencyNames).forEach(currency => {
                if (rates[currency]) {
                    const checked = favoritos[currency] ? 'checked' : '';
                    cotizacionesUSD.innerHTML += `<div class="cotizacion-item">
                                                    <span> $${rates[currency]} ${currencyNames[currency]} = 1 USD </span> 
                                                    <label class="switch">
                                                      <input type="checkbox" ${checked} onclick="toggleFavorito('${currency}', '${currencyNames[currency]} (${currency}): ${rates[currency]}')">
                                                      <span class="slider"></span>
                                                    </label>
                                                  </div>`;
                }
            });
        })
        .catch(error => console.error('Error al obtener cotizaciones en USD:', error));

    // Obtener y mostrar el precio del dólar blue en Argentina desde CriptoYa
    fetch(apiUrlDolarBlue)
        .then(response => response.json())
        .then(data => {
            // Accedemos a los valores de compra y venta del dólar blue desde la nueva API
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


    // Obtener y mostrar el precio del dólar cripto en pesos argentinos desde CriptoYa
    fetch(apiUrlCriptoYa)
        .then(response => response.json())
        .then(data => {
            const dolarCriptoCompra = data.bid; // Precio de compra
            dolarCriptoVenta = data.ask; // Precio de venta
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

    // Función para convertir monedas entre USD, ARS, y otras monedas
    convertirButton.addEventListener('click', () => {
        const monto = parseFloat(montoInput.value);
        const monedaOrigen = monedaOrigenSelect.value;
        const monedaDestino = monedaDestinoSelect.value;
        let resultado;

        if (monedaOrigen === 'USD' && monedaDestino === 'ARS') {
            resultado = monto * dolarBlueVenta; // Usamos el valor del dólar blue
        } else if (monedaOrigen === 'ARS' && monedaDestino === 'USD') {
            resultado = monto / dolarBlueVenta; // Usamos el valor del dólar blue
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

    actualizarFavoritas();
    showTab('todos');

    window.showTab = showTab;
    window.toggleFavorito = toggleFavorito;
    window.eliminarFavorito = eliminarFavorito;
});
