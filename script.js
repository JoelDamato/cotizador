document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '5bc1cec6967623eb3dcfbc4a';
    const apiUrlUSD = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    const apiUrlARS = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/ARS`;
    const apiUrlDolarBlue = 'https://api.bluelytics.com.ar/v2/latest';
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

    const currencyNames = {
        'ARS': 'ARS',
        'BRL': 'Real Brasileño',
        'CLP': 'Peso Chileno',
        'COP': 'Peso Colombiano',
        'MXN': 'Peso Mexicano',
        'PEN': 'Sol Peruano',
        'UYU': 'Peso Uruguayo',
        'USDT': 'Dólar Cripto (USDT)',
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
                                          <span>${currencyNames[currency] || currency}: ${value}  </span> 
                                          <button onclick="eliminarFavorito('${currency}')">Eliminar</button>
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
    }

    // Obtener y mostrar cotizaciones en relación al USD
    fetch(apiUrlUSD)
        .then(response => response.json())
        .then(data => {
            const rates = data.conversion_rates;
            tasaCambioUSDARS = rates['ARS'];
            cotizacionesUSD.innerHTML = '<h2>Cotizaciones en relación al USD</h2>';
            
            Object.keys(currencyNames).forEach(currency => {
                if (rates[currency]) {
                    const checked = favoritos[currency] ? 'checked' : '';
                    cotizacionesUSD.innerHTML += `<div class="cotizacion-item">
                                                    <span> $${rates[currency]} ${currencyNames[currency]} = 1 USD </span> 
                                                    <input type="checkbox" ${checked} onclick="toggleFavorito('${currency}', '${currencyNames[currency]} (${currency}): ${rates[currency]}')">
                                                  </div>`;
                }
            });
        })
        .catch(error => console.error('Error al obtener cotizaciones en USD:', error));

    // Obtener y mostrar el precio del dólar blue en Argentina
    fetch(apiUrlDolarBlue)
        .then(response => response.json())
        .then(data => {
            const dolarBlueCompra = data.blue.value_buy;
            dolarBlueVenta = data.blue.value_sell;
            const dolarBlueValue = `Compra: ${dolarBlueCompra} ARS | Venta: ${dolarBlueVenta} ARS`;
            const checked = favoritos['DolarBlue'] ? 'checked' : '';

            dolarBlueDiv.innerHTML = `<h2>Precio del Dólar Blue en Argentina</h2>
                                      <div class="cotizacion-item">
                                        <span>${dolarBlueValue}</span>
                                        <input type="checkbox" ${checked} onclick="toggleFavorito('DolarBlue', '${dolarBlueValue}')">
                                      </div>`;
        })
        .catch(error => console.error('Error al obtener el precio del dólar blue:', error));

    // Obtener y mostrar el precio del dólar cripto en pesos argentinos desde CriptoYa
    fetch(apiUrlCriptoYa)
        .then(response => response.json())
        .then(data => {
            const dolarCriptoCompra = data.bid; // Precio de compra
            dolarCriptoVenta = data.ask; // Precio de venta
            const dolarCriptoValue = `Compra: ${dolarCriptoCompra} ARS | Venta: ${dolarCriptoVenta} ARS`;
            const checked = favoritos['DolarCripto'] ? 'checked' : '';

            dolarCriptoDiv.innerHTML = `<h2>Precio del Dólar Cripto (USDT) en Binance P2P</h2>
                                        <div class="cotizacion-item">
                                          <span>${dolarCriptoValue}</span>
                                          <input type="checkbox" ${checked} onclick="toggleFavorito('DolarCripto', '${dolarCriptoValue}')">
                                        </div>`;
        })
        .catch(error => console.error('Error al obtener el precio del dólar cripto desde CriptoYa:', error));

    // Función para convertir monedas entre USD, ARS, y USDT
    convertirButton.addEventListener('click', () => {
        const monto = parseFloat(montoInput.value);
        const monedaOrigen = monedaOrigenSelect.value;
        const monedaDestino = monedaDestinoSelect.value;
        let resultado;

        if (monedaOrigen === 'USD') {
            if (monedaDestino === 'ARS') {
                resultado = monto * tasaCambioUSDARS;
            } else if (monedaDestino === 'USDT') {
                resultado = monto * (tasaCambioUSDARS / dolarCriptoVenta);
            }
        } else if (monedaOrigen === 'ARS') {
            if (monedaDestino === 'USD') {
                resultado = monto / tasaCambioUSDARS;
            } else if (monedaDestino === 'USDT') {
                resultado = monto / dolarCriptoVenta;
            }
        } else if (monedaOrigen === 'USDT') {
            if (monedaDestino === 'ARS') {
                resultado = monto * dolarCriptoVenta;
            } else if (monedaDestino === 'USD') {
                resultado = monto * (dolarCriptoVenta / tasaCambioUSDARS);
            }
        }

        resultadoDiv.innerHTML = `<p>${monto} ${monedaOrigen} equivale a ${resultado.toFixed(2)} ${monedaDestino}</p>`;
    });

    actualizarFavoritas();
    showTab('todos');

    window.showTab = showTab;
    window.toggleFavorito = toggleFavorito;
    window.eliminarFavorito = eliminarFavorito;
});
