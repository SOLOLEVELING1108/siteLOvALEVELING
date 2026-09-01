const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Lista de Jogos com seus respectivos App IDs oficiais da Steam
const jogosSteam = [
  { nome: 'gta-v', appId: '271590' },
  { nome: 'cyberpunk-2077', appId: '1091500' },
  { nome: 'elden-ring', appId: '1245620' },
  { nome: 'hogwarts-legacy', appId: '990080' },
  { nome: 'forza-horizon-5', appId: '1551360' },
  { nome: 'red-dead-redemption-2', appId: '1174180' }
];

async function baixarCapasSteam() {
  // Cria a pasta public/capas automaticamente se não existir
  const diretorio = path.join(__dirname, 'public', 'capas');
  if (!fs.existsSync(diretorio)) {
    fs.mkdirSync(diretorio, { recursive: true });
  }

  console.log('⚡ [SISTEMA] Iniciando conexão com os servidores da Steam...');

  for (const jogo of jogosSteam) {
    // URL oficial do CDN da Steam para a capa vertical (capsule_650x870)
    const urlCapa = `https://cdn.akamai.steamstatic.com/steam/apps/${jogo.appId}/library_600x900_2x.jpg`;
    const caminhoArquivo = path.join(diretorio, `${jogo.nome}.jpg`);

    try {
      const response = await fetch(urlCapa);
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar ID ${jogo.appId}`);
      }

      const buffer = await response.buffer();
      fs.writeFileSync(caminhoArquivo, buffer);
      console.log(`✅ [EXTRAÍDO] Capa da Steam salva: ${jogo.nome}.jpg`);
    } catch (erro) {
      console.error(`❌ [ERRO] Não foi possível baixar ${jogo.nome}:`, erro.message);
    }
  }

  console.log('⚡ [SISTEMA] Extração de capas concluída com sucesso!');
}

baixarCapasSteam();