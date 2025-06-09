// Funções para efeitos visuais dos botões de música
function entrar(botao) {
    botao.style.backgroundColor = 'rgb(139, 33, 61)';
}

function sair(botao) {
    botao.style.backgroundColor = '#8a2be2';
}

// Funções para efeitos visuais do botão de enviar
function entrar2(botao) {
    botao.style.backgroundColor = '#0000ff';
}

function sair2(botao) {
    botao.style.backgroundColor ='#0088ff';
}

// Configuração de áudio
const audioConfig = {
    bgMusicVolume: 0.5,
    typingVolume: 0.2,
    volumeStep: 0.1,
    fadeDuration: 1000 // duração da transição de volume em ms
};

// Função que simula digitação com efeito sonoro
function typeWriter(texto, elemento, velocidade = 40) {
    let i = 0;
    elemento.value = '';

    const typingSound = document.getElementById('typingSound');
    typingSound.volume = audioConfig.typingVolume;

    const botaoEnviar = document.getElementById('botao');
    botaoEnviar.disabled = true;

    function typing() {
        if (i < texto.length) {
            elemento.value += texto.charAt(i);

            // Toca o som de digitação a cada 2 caracteres, sem sobreposição
            if (i % 2 === 1) {
                typingSound.currentTime = 0;
                typingSound.play().catch(() => {});
            }

            i++;
            setTimeout(typing, velocidade);
        } else {
            // Para o som de digitação ao terminar
            typingSound.pause();
            typingSound.currentTime = 0;
            botaoEnviar.disabled = false;
        }
    }

    typing();
}

// Função para alterar a expressão facial da Monika
function alterarSpriteMonika(estado) {
    const monika = document.getElementById('monika');
    const sprites = {
        feliz: '../imgs/feliz.webp',
        triste: '../imgs/triste.webp',
        refletindo: '../imgs/refletindo.webp',
        desconcertada: '../imgs/desconcertada.webp',
        sádica: '../imgs/sádica.webp',
        normal: '../imgs/normal.webp'
    };

    if (sprites[estado]) {
        monika.src = sprites[estado];
    } else {
        monika.src = sprites.normal;
    }
}

// Função principal que processa o clique no botão de enviar
async function clicou() {
    const input = document.getElementById('texto');
    const texto = input.value.trim();
    const bgMusic = document.getElementById('bgMusic');

    // Inicia a música de fundo se ainda não estiver tocando
    if (bgMusic.currentTime === 0) {
        bgMusic.play();
    }

    // Verifica se há texto para enviar
    if (!texto) {
        typeWriter("Monika diz: Por favor, digite algo...", input);
        alterarSpriteMonika('normal');
        return;
    }

    const botaoEnviar = document.getElementById('botao');
    botaoEnviar.disabled = true;

    try {
        await generateAIResponse(texto);
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        typeWriter("Monika diz: Ops! Tive um pequeno problema técnico. Pode tentar novamente?", input);
        alterarSpriteMonika('desconcertada');
    } finally {
        botaoEnviar.disabled = false;
    }
}

// Função para pausar a música de fundo
function pausar() {
    if(document.getElementById('bgMusic').paused) {
        document.getElementById('pausarmsc').textContent = 'Pausar Música';
        document.getElementById('bgMusic').play();
    } else {
        document.getElementById('bgMusic').pause();
        document.getElementById('pausarmsc').textContent = 'Tocar Música';
    }
}

// Função para aumentar o volume com limite
function aumentar() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic.volume < 1) {
        const novoVolume = Math.min(1, bgMusic.volume + audioConfig.volumeStep);
        bgMusic.volume = novoVolume;
        updateVolumeDisplay();
        
        if (novoVolume >= 1) {
            alert('Volume Máximo!');
        }
    }
}

// Função para diminuir o volume com limite
function diminuir() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic.volume > 0) {
        const novoVolume = Math.max(0, bgMusic.volume - audioConfig.volumeStep);
        bgMusic.volume = novoVolume;
        updateVolumeDisplay();
        
        if (novoVolume <= 0) {
            alert('Volume Mínimo!');
        }
    }
}

// Função para atualizar o display de volume
function updateVolumeDisplay() {
    const bgMusic = document.getElementById('bgMusic');
    const volumeDisplay = document.getElementById('volumeDisplay');
    if (volumeDisplay) {
        const volumePercent = Math.round(bgMusic.volume * 100);
        volumeDisplay.textContent = `Volume: ${volumePercent}%`;
    }
}

// Função para limpar recursos de áudio
function cleanupAudio() {
    const bgMusic = document.getElementById('bgMusic');
    const typingSound = document.getElementById('typingSound');
    
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
    
    if (typingSound) {
        typingSound.pause();
        typingSound.currentTime = 0;
    }
}

// Adiciona listener para limpar recursos quando a página for fechada
window.addEventListener('beforeunload', cleanupAudio);

/**
 * Inicialização da página e configuração de eventos
 * Esta função é executada quando a página termina de carregar
 * e configura todos os elementos necessários para o funcionamento do chat
 */
window.addEventListener('load', function () {
    // Elementos principais da interface
    const monika = document.getElementById('monika');
    const bgMusic = document.getElementById('bgMusic');
    const typingSound = document.getElementById('typingSound');

    // Configuração inicial do volume
    // Os volumes são carregados das configurações salvas
    bgMusic.volume = audioConfig.bgMusicVolume;
    typingSound.volume = audioConfig.typingVolume;
    updateVolumeDisplay();

    // Tratamento de erros para carregamento de recursos
    // Se uma imagem falhar, carrega a imagem padrão
    monika.onerror = function () {
        this.src = '../imgs/normal.webp';
        console.error('Erro ao carregar imagem da Monika');
    };

    // Tratamento de erros para áudio de fundo
    // Alerta o usuário se não conseguir carregar a música
    bgMusic.onerror = function () {
        console.error('Erro ao carregar música de fundo');
        alert('Não foi possível carregar a música de fundo. Verifique se o arquivo de áudio está disponível.');
    };

    // Tratamento de erros para som de digitação
    // Alerta o usuário se não conseguir carregar o som
    typingSound.onerror = function () {
        console.error('Erro ao carregar som de digitação');
        alert('Não foi possível carregar o som de digitação. Verifique se o arquivo de áudio está disponível.');
    };

    // Configuração do campo de texto
    // Permite enviar mensagem com Enter (sem Shift)
    const input = document.getElementById('texto');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            clicou();
        }
    });
});
