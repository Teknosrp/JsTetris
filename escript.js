//JsTetris es un clon del popular juego Tetris, programado en Javascript y partiendo de una tabla como base.
//El codigo no esta nada optimizado, ya que al tratarse de una toma de contacto con JS se ha priorizado la sencillez. 
//Aun asi, cualquier mejora es bienvenida :)


//Tetrominos. Gracias a:
//https://codeincomplete.com/posts/javascript-tetris/
var n = { blocks: [0x0F00, 0x2222, 0x00F0, 0x4444], color: 'cyan'   };
var s = { blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], color: 'blue'   };
var l = { blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], color: 'orange' };
var o = { blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00], color: 'yellow' };
var p = { blocks: [0x06C0, 0x8C40, 0x6C00, 0x4620], color: 'green'  };
var t = { blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], color: 'purple' };
var z = { blocks: [0x0C60, 0x4C80, 0xC600, 0x2640], color: 'red'    };

//Variables globales
var puntuacion = 0;
var x = 0;
var y = 0;
var tablero = new Array(200);
var siguientebloque;

//Tiempo
var tiempo;
var temporizador;

//Estados
var listaestilos = ["2px solid white", "1px solid black", "none"]
var estilo = 3;
//0: sin iniciar 1: en curso 2:pausa
var juego = 0;

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function cambiarestilo()
{
    if(estilo > 2) estilo = 0;
    var elementos = document.getElementsByTagName("td");
    for(var i = 0, total = elementos.length; i < total; i++) elementos[i].style.border=listaestilos[estilo];
    estilo++;
     
}

function DibujarCuadrado(y, x, color, fijar, tabla = "principal") {
    //fijar 0:solo pintar 1:fijar
    if ((fijar == 1)) tablero[y*10 + x] = color;
    document.getElementsByClassName(tabla)[y].getElementsByTagName("td")[x].style.backgroundColor=color;
}

function juegonuevo()
{
    if(juego == 1) {
        clearInterval(temporizador);
        document.getElementById("nuevo").innerHTML = "Continuar";
        juego = 2;
        return 0;
    }

    if(juego == 2) {
        temporizador = setInterval(bajar, tiempo);
        document.getElementById("nuevo").innerHTML = "Pausa";
        juego = 1;
        return 0;
    }

    //Inicializamos el tablero en blanco, puntuacion y tiempo
    for (var i = 0; i < 200; i++) tablero[i] = 'white';
    for (var i = 0; i < 200; i++) DibujarCuadrado(Math.floor(i/10), i%10, 'white', 1);
    puntuacion = 0;
    tiempo = 2100;
    juego = 1;
    document.getElementById("puntuacion").innerHTML = puntuacion;
    document.getElementById("nuevo").innerHTML = "Pausa";
    //Ponemos un bloque en pantalla
    Bloque();
    temporizador = setInterval(bajar, tiempo);
}


function dibujarbloque(y, x, tipo, orientacion, modo, fijar, tabla = "principal") {

    //modo 0:pintar bloque 1:borrar bloque 2:probar si es valido
    //fijar 0:solo pintar 1:fijar

    clases = [n, s, l, o, p, t, z];
    bloque = clases[tipo].blocks[orientacion];
    color = clases[tipo].color;

    for (var i = 0; i < 4; i++) {
        izquierda = x;
        for (var j = 0; j < 4; j++) {
            var mask = 1 << (15 - (i*4 + j));
            if ((mask & bloque) != 0) {
               if (modo == 0) DibujarCuadrado(y, izquierda, color, fijar, tabla); 
               if (modo == 1) DibujarCuadrado(y, izquierda, 'white', fijar);
               if (modo == 2) if ((tablero[y*10 + izquierda] != 'white') || (izquierda > 9) || (izquierda < 0) ) return 4;   
            } 
            izquierda++ ;
        }
        y++; 
    }

    return 0;

}

function Generarficha() {
    for (var i = 0; i < 16; i++) DibujarCuadrado(Math.floor(i/4), i%4, 'white', 0, "next");
    siguientebloque = [randomIntFromInterval(0,6), randomIntFromInterval(0,3)]
    dibujarbloque(0, 0, siguientebloque[0], siguientebloque[1], 0, 0, "next");
}

function Bloque() {
    tipo = siguientebloque[0];
    orientacion = siguientebloque[1];
    x = 3;
    y = 0;
    Generarficha();
    lineascompletas();

    if(dibujarbloque(y, x, tipo, orientacion, 2, 0) == 4) {
        juego = 0;
        document.getElementById("nuevo").innerHTML = "Nuevo juego";
        clearInterval(temporizador);
        alert("Perdiste. Recuerda que puedes iniciar un juego nuevo pulsando Espacio");
        return 0;
    }
    dibujarbloque(y, x, tipo, orientacion, 0, 0);
    
}

function lineascompletas() {
    var i = 0;
    var j = 0;
    var filasenteras = 0;

    for(i = 0; i < 20; i++) {
        for (j = 0; j < 10; j++) if (tablero[i*10 + j] == 'white') break;
        if (j == 10){
            tablero.splice(i*10, 10);
            tablero.splice(0, 0, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white');
            filasenteras++;
        }
    } 

    if(!filasenteras) return(0);

    //Si se ha completado alguna fila, actualizamos el juego asi como la puntuacion y el tiempo
    for (var i = 0; i < 200; i++) DibujarCuadrado(Math.floor(i/10), i%10, tablero[i], 1) ;

    puntuacion+=filasenteras;
    document.getElementById("puntuacion").innerHTML = puntuacion;
    if (tiempo > 200) tiempo -= filasenteras*20;
    if (tiempo < 200) tiempo = 200;
    clearInterval(temporizador);
    temporizador = setInterval(bajar, tiempo);
    
}

girar = function () {
    var siguiente = orientacion + 1;
    if (siguiente == 4) siguiente = 0;
    if(dibujarbloque(y, x, tipo, siguiente, 2, 0) == 4) return(0) ;
    dibujarbloque(y, x, tipo, orientacion, 1, 0);
    orientacion++;
    if (orientacion == 4) orientacion = 0;
    dibujarbloque(y, x, tipo, orientacion, 0, 0);
}

bajarfuerte = function () {
    dibujarbloque(y, x, tipo, orientacion, 1, 0);
    while (dibujarbloque(y, x, tipo, orientacion, 2, 0) != 4) y++ ;
    dibujarbloque(y - 1, x, tipo, orientacion, 0, 1);
    Bloque();
}

bajar = function () {
    if(dibujarbloque(y + 1, x, tipo, orientacion, 2, 0) == 4) {
        dibujarbloque(y, x, tipo, orientacion, 0, 1);
        Bloque();
        return(0);
    }
    dibujarbloque(y, x, tipo, orientacion, 1, 0);
    y++;
    dibujarbloque(y, x, tipo, orientacion, 0, 0);
}

derecha = function () {
    if(dibujarbloque(y, x + 1, tipo, orientacion, 2, 0) == 4) return(0) ;
    dibujarbloque(y, x, tipo, orientacion, 1, 0);
    x++;
    dibujarbloque(y, x, tipo, orientacion, 0, 0);
}

movizquierda = function () {
    if(dibujarbloque(y, x - 1, tipo, orientacion, 2, 0) == 4) return(0) ;
    dibujarbloque(y, x, tipo, orientacion, 1, 0);
    x--;
    dibujarbloque(y, x, tipo, orientacion, 0, 0);
}

acciones = function(tecla) {

    if(juego != 1 && tecla < 41 && tecla > 36) {
        alert("El juego no esta en curso");
        return 0;
    }

    switch(tecla) {
        case 32:
            juegonuevo();
            break;
        case 37:
            movizquierda();
            break;
        case 39:
            derecha();
            break;
        case 38:
            girar();
            break;
        case 40:
            bajarfuerte();
            break;
        default:  
            return 0;          
    }
}


//Lectura de teclado
window.addEventListener('keydown', function(event) {
    var keycode = event.keyCode;
    event.preventDefault();
    acciones(keycode);   
}, false);

//Iniciamos la primera ficha
Generarficha();


