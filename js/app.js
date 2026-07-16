let cuadrantes={};
let telefonos={};

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

function crearCaja(titulo,lista){
return `<div class="tarjeta">
<h3 class="text-lg font-bold text-[#0A2342] border-b pb-2 mb-3">${titulo}</h3>
${lista.length?`<ul class="space-y-1">${lista.map(x=>`<li>• ${x}</li>`).join("")}</ul>`:`<p class="text-gray-500">Sin agentes</p>`}
</div>`;
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
if(extraHM.length) cajasExtras+=crearCaja("Mañana 12h",extraHM);
if(extraHN.length) cajasExtras+=crearCaja("Noche 12h",extraHN);
if(extraHm.length) cajasExtras+=crearCaja("Mañana 8h",extraHm);
if(extraHt.length) cajasExtras+=crearCaja("Tarde 8h",extraHt);
if(extraHn.length) cajasExtras+=crearCaja("Noche 8h",extraHn);
if(extraHPL.length) cajasExtras+=crearCaja("Playa",extraHPL);

const hayExtras=extraHM.length||extraHN.length||extraHm.length||extraHt.length||extraHn.length||extraHPL.length;

document.getElementById("resultado").innerHTML=`
<h2 class="text-3xl font-bold mb-6 text-[#0A2342]">Turnos del ${dia} de ${nombreMes}</h2>

<div class="grid md:grid-cols-2 gap-4">
${crearCaja("🌞 Mañana",manana)}
${crearCaja("🌙 Noche",noche)}
</div>

<div class="mt-6">
<div class="tarjeta">
<h3 class="text-2xl font-bold mb-6 text-center text-[#0A2342]">SERVICIOS EXTRAORDINARIOS</h3>
${hayExtras?`<div class="grid md:grid-cols-3 gap-4">${cajasExtras}</div>`:`<div class="text-center text-gray-500 italic py-6">Sin agentes</div>`}
</div>
</div>

<div class="grid md:grid-cols-2 gap-4 mt-6">
${crearCaja("🏖️ Playa",playa)}
${crearCaja("🏝️ Vacaciones",vacaciones)}
</div>`;
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
