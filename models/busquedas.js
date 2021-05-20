const axios = require("axios");
const fs = require('fs')

class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        //TODO: Leer db si existe
        this.leerDB();

    }

    get HistorialCapitalizado(){
        //capitalizar cada palabra
        
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p =>p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }
    
    get paramsOpenWeather() {
        return {
            'cnt': 1,
            'appid': process.env.OPEN_WEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad(lugar = '',) {
        //peticion http
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });

            //regresar lugares que coincidan 
            const resp = await instance.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));


        } catch (error) {
            console.log("Error", error)
            return [];
        }
    }


    async clima(lat, lon) {

        try {
            //instance axios
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}`,
                params: this.paramsOpenWeather
            });

            //respuesta 
            const resp = await instance.get();
            const { weather, main } = resp.data.list[0];

            return {
                desc: weather[0].description,
                temp: main.temp,
                tmax: main.temp_max,
                tmin: main.temp_min,

            }
        } catch (error) {
            console.log(error)
        }

    }

    agregarHistorial(lugar = '') {
        //TODO: prevenir duplicados
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }
        this.historial.unshift(lugar.toLocaleLowerCase());

        //grabar en db
        this.guardarDB();
    }

    guardarDB() {

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    leerDB() {
        //comprobar si no existe el archivo
        if (!fs.existsSync(this.dbPath)){
            return;
        }

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);
        
        this.historial= data.historial;
    }


}

module.exports = Busquedas;