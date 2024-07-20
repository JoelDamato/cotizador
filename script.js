document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '5bc1cec6967623eb3dcfbc4a';
    const apiUrlUSD = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    const apiUrlARS = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/ARS`;
    const apiUrlDolarBlue = 'https://api.bluelytics.com.ar/v2/latest';

    const cotizacionesUSD = document.getElementById('cotizaciones-usd');
    const cotizacionesARS = document.getElementById('cotizaciones-ars');
    const dolarBlueDiv = document.getElementById('dolar-blue');
    const favoritasList = document.getElementById('favoritas-list');
    const convertirButton = document.getElementById('convertir');
    const resultadoDiv = document.getElementById('resultado');
    const montoInput = document.getElementById('monto');
    const monedaSelect = document.getElementById('moneda');

    const currencyNames = {
        'ARS': 'Peso Argentino',
        'USD': 'Dólar Estadounidense',
        'BRL': 'Real Brasileño',
        'CLP': 'Peso Chileno',
        'COP': 'Peso Colombiano',
        'MXN': 'Peso Mexicano',
        'PEN': 'Sol Peruano',
        'UYU': 'Peso Uruguayo',
        // Agrega otros nombres de monedas según sea necesario
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
        fetch(apiUrlUSD)
            .then(response => response.json())
            .then(data => {
                const rates = data.conversion_rates;
                Object.keys(favoritos).forEach(currency => {
                    const value = rates[currency];
                    favoritasList.innerHTML += `<p>${currencyNames[currency] || currency} (${currency}): ${value} 
                    <button onclick="eliminarFavorito('${currency}')">Eliminar</button></p>`;
                });
            })
            .catch(error => console.error('Error al obtener cotizaciones para favoritas:', error));
    }

    function toggleFavorito(currency) {
        if (favoritos[currency]) {
            delete favoritos[currency];
        } else {
            fetch(apiUrlUSD)
                .then(response => response.json())
                .then(data => {
                    const value = data.conversion_rates[currency];
                    favoritos[currency] = value;
                    localStorage.setItem('favoritos', JSON.stringify(favoritos));
                    actualizarFavoritas();
                })
                .catch(error => console.error('Error al obtener cotización de la moneda:', error));
        }
    }

    function eliminarFavorito(currency) {
        delete favoritos[currency];
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        actualizarFavoritas();
    }

    // Obtener y mostrar cotizaciones en relación al USD
    const monedasDeseadas = {
        'ARS': '1 USD (OFICIAL) ',
        'CLP': '1 USD ',
        'COP': '1 USD ',
        'MXN': '1 USD ',
        'PEN': '1 USD ',
        'UYU': '1 USD '
    };

    fetch(apiUrlUSD)
        .then(response => response.json())
        .then(data => {
            const rates = data.conversion_rates;
            cotizacionesUSD.innerHTML = '<h2>Cotizaciones en relación al USD</h2>';
            
            Object.keys(monedasDeseadas).forEach(currency => {
                if (rates[currency]) {
                    const checked = favoritos[currency] ? 'checked' : '';
                    cotizacionesUSD.innerHTML += `<p>${rates[currency]} (${currency}) = ${monedasDeseadas[currency]} 
                    <input type="checkbox" ${checked} onclick="toggleFavorito('${currency}')"></p>`;
                }
            });
        })
        .catch(error => console.error('Error al obtener cotizaciones en USD:', error));

    // Obtener y mostrar cotizaciones en relación al ARS
    fetch(apiUrlARS)
        .then(response => response.json())
        .then(data => {
            const rates = data.conversion_rates;
            cotizacionesARS.innerHTML = '<h2>Cotizaciones en relación al ARS</h2>';
            Object.keys(rates).forEach(currency => {
                const currencyName = currencyNames[currency] || currency;
                const checked = favoritos[currency] ? 'checked' : '';
                cotizacionesARS.innerHTML += `<p>${currencyName} (${currency}): ${rates[currency]} 
                <input type="checkbox" ${checked} onclick="toggleFavorito('${currency}')"></p>`;
            });
        })
        .catch(error => console.error('Error al obtener cotizaciones en ARS:', error));

    // Obtener y mostrar el precio del dólar blue en Argentina
    fetch(apiUrlDolarBlue)
        .then(response => response.json())
        .then(data => {
            const dolarBlueCompra = data.blue.value_buy;
            const dolarBlueVenta = data.blue.value_sell;
            dolarBlueDiv.innerHTML = `<h2>Precio del Dólar Blue en Argentina</h2>
                                      <p>Compra: ${dolarBlueCompra} ARS</p>
                                      <p>Venta: ${dolarBlueVenta} ARS</p>`;
        })
        .catch(error => console.error('Error al obtener el precio del dólar blue:', error));

    // Convertir monedas de USD Blue a ARS
    convertirButton.addEventListener('click', () => {
        const monto = montoInput.value;
        const moneda = monedaSelect.value;

        fetch(apiUrlDolarBlue)
            .then(response => response.json())
            .then(data => {
                const dolarBlueCompra = data.blue.value_buy;
                const dolarBlueVenta = data.blue.value_sell;
                let resultado;

                if (moneda === 'ARS') {
                    resultado = monto * dolarBlueVenta; // Convierte USD Blue a ARS
                    resultadoDiv.innerHTML = `<p>${monto} USD (USD Blue) equivale a ${resultado.toFixed(2)} ARS</p>`;
                } else if (moneda === 'USD') {
                    resultado = monto / dolarBlueVenta; // Convierte ARS a USD Blue
                    resultadoDiv.innerHTML = `<p>${monto} ARS equivale a ${resultado.toFixed(2)} USD (USD Blue)</p>`;
                }
            })
            .catch(error => console.error('Error al convertir moneda:', error));
    });

    actualizarFavoritas();
    showTab('todos');

    window.showTab = showTab;
    window.toggleFavorito = toggleFavorito;
    window.eliminarFavorito = eliminarFavorito;
});
