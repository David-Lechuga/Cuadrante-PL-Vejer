let cuadrantes={};
let telefonos={};
let agenteSeleccionado={ nombre:"", turno:"", fecha:"" };

for(let i=1;i<=31;i++){document.getElementById("dia").innerHTML+=`<option value="${i}">${i}</option>`;}

async function cargarDatosOnline(){
try{
const response=await fetch("./data/cuadrantes.json?t=" + Date.now(), { cache: "no-store" });
const datos=await response.json();
cuadrantes=datos.cuadrantes||{};
if(document.getElementById("ultimaActualizacion")){document.getElementById("ultimaActualizacion").innerHTML=`Última sincronización: ${datos.actualizado||"Desconocida"}`;}
}catch(e){
document.getElementById("resultado").innerHTML='<div class="bg-red-100 text-red-700 p-4 rounded">Error cargando datos</div>';
}

try{
const responseTelefonos=await fetch("./data/telefonos.json?t=" + Date.now(), { cache: "no-store" });
const datosTelefonos=await responseTelefonos.json();
telefonos=datosTelefonos.telefonos||{};
}catch(e){
console.warn("No se pudo cargar telefonos.json");
    telefonos={};
}
}

function cerrarModalAgente(){
const modal=document.getElementById("modalAgente");
if(modal){
modal.classList.add("hidden");
modal.classList.remove("flex");
}
}

// Normaliza texto para comparar nombres de forma más robusta.
function normalizarTexto(texto){
return String(texto||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}

// Busca el teléfono del agente en el formato actual de telefonos.json.
function obtenerTelefonoAgente(nombre){
if(!nombre || !telefonos){return null;}
const nombreNormalizado=normalizarTexto(nombre);
const entrada=Object.entries(telefonos).find(([clave])=>normalizarTexto(clave)===nombreNormalizado);
return entrada ? String(entrada[1]).trim() : null;
}

function abrirMenuAgente(nombre, turno, fecha){
// Guarda los datos del agente para usarlos en los botones del modal.
agenteSeleccionado={ nombre: nombre || "", turno: turno || "", fecha: fecha || "" };
const modal=document.getElementById("modalAgente");
const nombreEl=document.getElementById("modalAgenteNombre");
if(modal){
modal.classList.remove("hidden");
modal.classList.add("flex");
}
if(nombreEl){
nombreEl.textContent=agenteSeleccionado.nombre || "Agente";
}
console.log({ nombre, turno, fecha });
}

function convertirTurnoTexto(turno){
const valor=String(turno||"").trim();
const mapa={
M:"Mañana",
N:"Noche",
PL:"Playa",
HM:"Horas Extra Mañana 12h",
HN:"Horas Extra Noche 12h",
Hm:"Horas Extra Mañana 8h",
Ht:"Horas Extra Tarde 8h",
Hn:"Horas Extra Noche 8h",
HPL:"Horas Extra Playa",
VA:"Vacaciones"
};
return mapa[valor] || valor || "Sin turno";
}

function enviarWhatsAppAgente(){
const telefono=obtenerTelefonoAgente(agenteSeleccionado.nombre);
if(!telefono){
alert(`No hay teléfono registrado para ${agenteSeleccionado.nombre}.`);
cerrarModalAgente();
return;
}
const turnoTexto=convertirTurnoTexto(agenteSeleccionado.turno);
const mensaje=`Hola ${agenteSeleccionado.nombre}, te escribo desde la app porque el día ${agenteSeleccionado.fecha} estamos juntos en el turno de ${turnoTexto}.`;
const numeroWhatsApp=String(telefono).replace(/\D/g,"");
const url=`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
window.open(url, "_blank", "noopener,noreferrer");
cerrarModalAgente();
}

function llamarAgente(){
const telefono=obtenerTelefonoAgente(agenteSeleccionado.nombre);
if(!telefono){
alert(`No hay teléfono registrado para ${agenteSeleccionado.nombre}.`);
cerrarModalAgente();
return;
}
const numeroLlamada=String(telefono).replace(/\s+/g,"");
window.location.href=`tel:${numeroLlamada}`;
cerrarModalAgente();
}

function crearCaja(titulo,lista,turnoCodigo){
const dia=document.getElementById("dia").value;
const mes=document.getElementById("mes").value;
const fecha=`${dia}/${mes}`;
const turnoEscapado=String(turnoCodigo||"").replace(/'/g,"\\'").replace(/"/g,'\\"');
const items=lista.map(x=>{
const nombreEscapado=String(x).replace(/'/g,"\\'").replace(/"/g,'\\"');
return `<li class="agent-item cursor-pointer rounded px-1 py-1 transition-colors hover:bg-gray-100" data-nombre="${nombreEscapado}" data-turno="${turnoEscapado}" data-fecha="${fecha}" style="-webkit-user-select:none; user-select:none; -webkit-tap-highlight-color:transparent; touch-action:manipulation;">• ${x}</li>`;
}).join("");
return `<div class="tarjeta">
<h3 class="text-lg font-bold text-[#0A2342] border-b pb-2 mb-3">${titulo}</h3>
${lista.length?`<ul class="space-y-1">${items}</ul>`:`<p class="text-gray-500">Sin agentes</p>`}
</div>`;
}

function activarEventosAgentes(){
const elementos=document.querySelectorAll(".agent-item");
let touchHandled=false;

elementos.forEach(elemento=>{
const abrir=()=>{
if(touchHandled){
return;
}
const nombre=elemento.getAttribute("data-nombre")||"";
const turno=elemento.getAttribute("data-turno")||"";
const fecha=elemento.getAttribute("data-fecha")||"";
abrirMenuAgente(nombre, turno, fecha);
};

elemento.addEventListener("click", (event)=>{
if(event.detail===0){
return;
}
abrir();
}, { passive: true });

elemento.addEventListener("touchend", (event)=>{
if(event.cancelable){
event.preventDefault();
}
touchHandled=true;
abrir();
setTimeout(()=>{touchHandled=false;}, 300);
}, { passive: false });

elemento.addEventListener("pointerup", (event)=>{
if(event.pointerType==="touch"){
if(event.cancelable){
event.preventDefault();
}
abrir();
}
}, { passive: false });
});
}

function buscarTurnos(){
const dia=parseInt(document.getElementById("dia").value);
const mesNumero=parseInt(document.getElementById("mes").value);
const nombres=["","ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
const nombreMes=nombres[mesNumero];
const datosMes=cuadrantes[nombreMes];

if(!datosMes){
document.getElementById("resultado").innerHTML='<div class="bg-red-100 text-red-700 p-4 rounded">No hay datos para este mes</div>';
return;
}

const manana=[],noche=[],playa=[],vacaciones=[];
const extraHM=[],extraHN=[],extraHm=[],extraHt=[],extraHn=[],extraHPL=[];

datosMes.forEach(item=>{
if(item.dia!==dia) return;
const turno=String(item.turno).trim();
if(turno==="M") manana.push(item.agente);
else if(turno==="N") noche.push(item.agente);
else if(turno==="PL") playa.push(item.agente);
else if(turno==="VA") vacaciones.push(item.agente);
else if(turno==="HM") extraHM.push(item.agente);
else if(turno==="HN") extraHN.push(item.agente);
else if(turno==="Hm") extraHm.push(item.agente);
else if(turno==="Ht") extraHt.push(item.agente);
else if(turno==="Hn") extraHn.push(item.agente);
else if(turno==="HPL") extraHPL.push(item.agente);
});

const refuerzoManana=extraHM.length+extraHm.length+extraHt.length;
const refuerzoNoche=extraHN.length+extraHn.length;

if(refuerzoManana>0){
manana.push(refuerzoManana===1?"+1 agente de horas extras":`+${refuerzoManana} agentes de horas extras`);
}

if(refuerzoNoche>0){
noche.push(refuerzoNoche===1?"+1 agente de horas extras":`+${refuerzoNoche} agentes de horas extras`);
}

let cajasExtras="";
if(extraHM.length) cajasExtras+=crearCaja("Mañana 12h",extraHM,"HM");
if(extraHN.length) cajasExtras+=crearCaja("Noche 12h",extraHN,"HN");
if(extraHm.length) cajasExtras+=crearCaja("Mañana 8h",extraHm,"Hm");
if(extraHt.length) cajasExtras+=crearCaja("Tarde 8h",extraHt,"Ht");
if(extraHn.length) cajasExtras+=crearCaja("Noche 8h",extraHn,"Hn");
if(extraHPL.length) cajasExtras+=crearCaja("Playa",extraHPL,"HPL");

const hayExtras=extraHM.length||extraHN.length||extraHm.length||extraHt.length||extraHn.length||extraHPL.length;

document.getElementById("resultado").innerHTML=`
<h2 class="text-3xl font-bold mb-6 text-[#0A2342]">Turnos del ${dia} de ${nombreMes}</h2>

<div class="grid md:grid-cols-2 gap-4">
${crearCaja("🌞 Mañana",manana,"M")}
${crearCaja("🌙 Noche",noche,"N")}
</div>

<div class="mt-6">
<div class="tarjeta">
<h3 class="text-2xl font-bold mb-6 text-center text-[#0A2342]">SERVICIOS EXTRAORDINARIOS</h3>
${hayExtras?`<div class="grid md:grid-cols-3 gap-4">${cajasExtras}</div>`:`<div class="text-center text-gray-500 italic py-6">Sin agentes</div>`}
</div>
</div>

<div class="grid md:grid-cols-2 gap-4 mt-6">
${crearCaja("🏖️ Playa",playa,"PL")}
${crearCaja("🏝️ Vacaciones",vacaciones,"VA")}
</div>`;

activarEventosAgentes();
}

function irAHoy(){
 const hoy=new Date();
 document.getElementById("dia").value=hoy.getDate();
 document.getElementById("mes").value=hoy.getMonth()+1;
 buscarTurnos();
}

cargarDatosOnline().then(()=>{
 const hoy=new Date();
 document.getElementById("dia").value=hoy.getDate();
 document.getElementById("mes").value=hoy.getMonth()+1;
 buscarTurnos();
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => console.log("Service Worker registrado"))
            .catch(err => console.log("Error SW:", err));
    });
}
