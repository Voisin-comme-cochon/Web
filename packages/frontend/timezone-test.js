// Test pour comprendre le problème de timezone
console.log("=== TEST TIMEZONE DEBUGGING ===");

// Simulation d'un message créé côté frontend à 18h40 heure française
const now = new Date();
console.log("1. Date actuelle côté frontend:", now);
console.log("   - ISO String:", now.toISOString());
console.log("   - Locale française:", now.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }));
console.log("   - UTC:", now.toUTCString());

// Simulation de ce que le backend pourrait recevoir
const messageData = {
    content: "Test message",
    groupId: 1,
    createdAt: now  // ou now.toISOString()
};

console.log("\n2. Données envoyées au backend:");
console.log(JSON.stringify(messageData, null, 2));

// Simulation du parsing côté backend
const parsedDate = new Date(messageData.createdAt);
console.log("\n3. Date après parsing côté backend:");
console.log("   - ISO String:", parsedDate.toISOString());
console.log("   - Locale française:", parsedDate.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }));

// Test avec formatMessageTime
const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const timeZone = 'Europe/Paris';
    
    return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone 
    });
};

console.log("\n4. Formatage avec formatMessageTime:");
console.log("   - Résultat:", formatMessageTime(now.toISOString()));

// Test avec différents formats de date
console.log("\n5. Tests avec différents formats:");

// Date avec offset français
const dateWithOffset = new Date();
console.log("   - Date locale:", dateWithOffset.toString());
console.log("   - ISO:", dateWithOffset.toISOString());
console.log("   - Format FR:", formatMessageTime(dateWithOffset.toISOString()));

// Date UTC explicite
const utcDate = new Date(Date.UTC(2024, 0, 1, 16, 40, 0)); // 16h40 UTC = 18h40 FR (hiver)
console.log("\n6. Date UTC 16h40 (= 18h40 FR):");
console.log("   - UTC:", utcDate.toISOString());
console.log("   - Format FR:", formatMessageTime(utcDate.toISOString()));

// Date locale française 18h40
const frDate = new Date(2024, 0, 1, 18, 40, 0); // 18h40 heure locale
console.log("\n7. Date locale 18h40:");
console.log("   - Local:", frDate.toString());
console.log("   - ISO:", frDate.toISOString());
console.log("   - Format FR:", formatMessageTime(frDate.toISOString()));