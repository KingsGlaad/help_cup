const localDate = "06/11/2026 13:00";
const d = new Date(localDate + " -0600");

console.log("Brazil Time:", d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
console.log("Time only:", d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }));
