const fs = require('fs');
const path = require('path');
const https = require('https');

// Lista de jogos (automáticos via Steam e manuais)
const jogos = [
    // Jogos com download automático via Steam
    { name: "Elden Ring", appId: 1245620 },
    { name: "Cyberpunk 2077", appId: 1091500 },
    { name: "GTA V", appId: 271590 },
    { name: "Hogwarts Legacy", appId: 990080 },
    { name: "Crimson Desert", appId: 3321460 },
    { name: "Avatar Frontiers of Pandora", appId: 2840770 },
    { name: "Assassin's Creed Shadows", appId: 3159330 },

    // Jogos com capas adicionadas manualmente na pasta public/capas
    { name: "Forza Horizon 6", manual: true },
    { name: "007 First Light", manual: true },
    { name: "Assassin's Creed Black Flag Resynced", manual: true }
];

// Diretório de destino das capas
const outputDir = path.join(__dirname, 'public', 'capas');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Função para baixar via URL com suporte a redirecionamento
function tentarBaixar(url, filePath) {
    return new Promise((resolve) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filePath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                tentarBaixar(response.headers.location, filePath).then(resolve);
            } else {
                resolve(false);
            }
        }).on('error', () => {
            resolve(false);
        });
    });
}

// Execução principal
async function baixarCapas() {
    console.log("Iniciando o processamento das capas dos jogos...\n");
    
    for (const jogo of jogos) {
        const fileName = `${jogo.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`;
        const filePath = path.join(outputDir, fileName);

        if (jogo.manual) {
            console.log(`[Manual] ${jogo.name} -> Salve a imagem como: public/capas/${fileName}`);
            continue;
        }

        let baixou = false;
        const urlsParaTestar = [
            `https://cdn.akamai.steamstatic.com/steam/apps/${jogo.appId}/library_600x900_2x.jpg`,
            `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${jogo.appId}/library_600x900_2x.jpg`,
            `https://cdn.akamai.steamstatic.com/steam/apps/${jogo.appId}/library_600x900.jpg`,
            `https://cdn.akamai.steamstatic.com/steam/apps/${jogo.appId}/header.jpg`,
            `https://cdn.akamai.steamstatic.com/steam/apps/${jogo.appId}/capsule_650x870.jpg`
        ];

        for (const url of urlsParaTestar) {
            baixou = await tentarBaixar(url, filePath);
            if (baixou) break;
        }

        if (baixou) {
            console.log(`[Sucesso] Capa baixada: ${jogo.name}`);
        } else {
            console.log(`[Aviso] Falha automática para ${jogo.name}. Adicione manualmente em: public/capas/${fileName}`);
        }
    }
    console.log("\nProcesso finalizado!");
}

baixarCapas();