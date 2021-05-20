require('dotenv').config();
const { leerInput, inquirerMenu, pause, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() =>{
    let opt;
    const busquedas = new Busquedas();

    do {
        console.clear()
        opt = await inquirerMenu();
        
        switch (opt) {
            case 1:
                //Mostrar mensaje
                const termino = await leerInput('Ciudad : ');
                
                //Buscar los lugares
                const lugares = await busquedas.ciudad(termino);
                
                //Seleccionar el lugar
                const id = await listarLugares(lugares);
                if (id === '0') continue;
                
                const seleccion = lugares.find(l => l.id === id);

                //guardar en db
                busquedas.agregarHistorial(seleccion.nombre)

        
                //Clima
                const clima = await busquedas.clima(seleccion.lat, seleccion.lng)
                
                //Mostrar resultados
                console.log('\nInformacion del lugar\n'.green);
                console.log('Ciudad :', seleccion.nombre);
                console.log('Latitud :', seleccion.lat);
                console.log('Longitud :', seleccion.lng);
                console.log('Temperatura :', clima.temp);
                console.log('Temp min :', clima.tmin);
                console.log('Temp max :', clima.tmax);
                console.log('Descripcion :',clima.desc);
                
                break;
            case 2:
                
                busquedas.HistorialCapitalizado.forEach((lugar,i) => {
                    const idx = `${i+1}.`.green
                    console.log(`${idx} ${lugar}`)
                });
                
                break;
                        
        }
                    
        console.log('\n');
        if (opt!==0) await pause();
                    
    } while (opt!==0);
        
}

main();