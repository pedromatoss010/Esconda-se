let estado = "selecionando";
let esconderijoEscolhido = null;

let rotaAtual = [];
let waypointIndex = 0;
let posAtual = { x: 0, y: 0 };

const VELOCIDADE_PX_POR_SEGUNDO = 110;
let ultimoTimestamp = null;

let cronometroAcao = 0;
let cronometroSegundo = 0;
const CHANCE_POR_SEGUNDO = 0.8;

const monstro = document.getElementById("monstro")
const buttonStart = document.getElementById("btn-comecar")
const escondrijos = document.querySelectorAll(".hiding-spot");

buttonStart.addEventListener("click", iniciarJogo);

document.getElementById("btn-entendi").addEventListener("click", () => {
  document.getElementById("intro").style.display = "none";
  document.getElementById("musica-fundo").play();
});

const rotasPorEsconderijo = {
  1: [
    { x: 210, y: 425, acao: "andar",    duracao: 0 },
    { x: 210, y: 390, acao: "andar",    duracao: 0 },
    { x: 305, y: 200, acao: "procurar", duracao: 4000, esconderijoId: 1 },
    { x: 210, y: 390, acao: "andar",    duracao: 0 },
    { x: 210, y: 425, acao: "andar",    duracao: 0 },
  ],
  2: [
    { x: 590, y: 425, acao: "andar",    duracao: 0 },
    { x: 590, y: 390, acao: "andar",    duracao: 0 },
    { x: 465, y: 105, acao: "procurar", duracao: 3500, esconderijoId: 2 },
    { x: 590, y: 390, acao: "andar",    duracao: 0 },
    { x: 590, y: 425, acao: "andar",    duracao: 0 },
  ],
  3: [
    { x: 1060, y: 425, acao: "andar",    duracao: 0 },
    { x: 1060, y: 460, acao: "andar",    duracao: 0 },
    { x: 1060, y: 550, acao: "procurar", duracao: 4500, esconderijoId: 3 },
    { x: 1060, y: 460, acao: "andar",    duracao: 0 },
    { x: 1060, y: 425, acao: "andar",    duracao: 0 },
  ],
  4: [
    { x: 320, y: 425, acao: "andar",    duracao: 0 },
    { x: 320, y: 460, acao: "andar",    duracao: 0 },
    { x: 200, y: 650, acao: "andar",    duracao: 0 },
    { x: 67,  y: 680, acao: "procurar", duracao: 4000, esconderijoId: 4 },
    { x: 320, y: 460, acao: "andar",    duracao: 0 },
    { x: 320, y: 425, acao: "andar",    duracao: 0 },
  ],
  5: [
    { x: 780, y: 425, acao: "andar",    duracao: 0 },
    { x: 780, y: 460, acao: "andar",    duracao: 0 },
    { x: 750, y: 685, acao: "procurar", duracao: 3500, esconderijoId: 5 },
    { x: 780, y: 460, acao: "andar",    duracao: 0 },
    { x: 780, y: 425, acao: "andar",    duracao: 0 },
  ],
  6: [
    { x: 1060, y: 425, acao: "andar",    duracao: 0 },
    { x: 1060, y: 460, acao: "andar",    duracao: 0 },
    { x: 1060, y: 620, acao: "andar",    duracao: 0 },
    { x: 1110, y: 726, acao: "procurar", duracao: 4000, esconderijoId: 6 },
    { x: 1060, y: 620, acao: "andar",    duracao: 0 },
    { x: 1060, y: 460, acao: "andar",    duracao: 0 },
    { x: 1060, y: 425, acao: "andar",    duracao: 0 },
  ],
};


function sortearRotaDoMonstro() {
  const ids = Object.keys(rotasPorEsconderijo).map(Number); // [1,2,3,4,5,6]

  // embaralha (Fisher-Yates): percorre de trás pra frente trocando
  // cada posição por uma posição aleatória antes dela
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  const quantidade = 2 + Math.floor(Math.random() * 3); // 2, 3 ou 4
  const escolhidos = ids.slice(0, quantidade);

  let rota = [{ x: 100, y: 425, acao: "andar", duracao: 0 }]; // ponto inicial no corredor
  escolhidos.forEach((id) => {
    rota = rota.concat(rotasPorEsconderijo[id]);
  });

  return rota;
}


function iniciarJogo() {
  if (estado !== "selecionando" || !esconderijoEscolhido) return;

  estado = "jogando";
  rotaAtual = sortearRotaDoMonstro();
  waypointIndex = 0;
  posAtual = { x: rotaAtual[0].x, y: rotaAtual[0].y };

  document.getElementById("musica-fundo").play();

  requestAnimationFrame(loop); 
}



function AtualzarPosicao() {
    monstro.style.left = posAtual.x + "px";
    monstro.style.top = posAtual.y + "px";
}


function chegouNoWaypoint(alvo) {
  if (alvo.acao === "andar" || alvo.duracao <= 0) {
    waypointIndex++;
    return;
  }

  cronometroAcao = alvo.duracao;
  cronometroSegundo = 0;
}

function processarEsperaNoWaypoint(alvo, deltaMs) {
  cronometroAcao -= deltaMs;
  cronometroSegundo += deltaMs;

  if (alvo.acao === "procurar" && alvo.esconderijoId === esconderijoEscolhido) {
    while (cronometroSegundo >= 1000 && cronometroAcao > -1000) {
      cronometroSegundo -= 1000;
      if (Math.random() < CHANCE_POR_SEGUNDO) {
        monstroEncontrouJogador();
        return;
      }
    }
  }

  if (cronometroAcao <= 0) {
    cronometroAcao = 0;
    waypointIndex++;
  }
}

function loop(timestamp) {
  if (estado !== "jogando") return;

  const alvo = rotaAtual[waypointIndex];
  if (!alvo) {
    jogadorSobreviveu();
    return;
  }

  if (ultimoTimestamp === null) ultimoTimestamp = timestamp;
  const deltaMs = timestamp - ultimoTimestamp;
  ultimoTimestamp = timestamp;

    if (cronometroAcao > 0) {
    processarEsperaNoWaypoint(alvo, deltaMs);
  } else {
    moverEmDirecaoA(alvo, deltaMs);
  }

  if (estado === "jogando") requestAnimationFrame(loop);
}


escondrijos.forEach((el) => {
  el.addEventListener("click", () => {
    if (estado !== "selecionando") return;

    esconderijoEscolhido = Number(el.dataset.id);

    escondrijos.forEach((s) => {
      s.classList.toggle("active", s === el);
    });
  });
});


function moverEmDirecaoA(alvo, deltaMs) {
  const dx = alvo.x - posAtual.x;
  const dy = alvo.y - posAtual.y;
  const distancia = Math.hypot(dx, dy);
  const passo = VELOCIDADE_PX_POR_SEGUNDO * (deltaMs / 1000);

  if (distancia <= passo || distancia === 0) {
    posAtual = { x: alvo.x, y: alvo.y };
    chegouNoWaypoint(alvo)
  } else {
    posAtual = {
      x: posAtual.x + (dx / distancia) * passo,
      y: posAtual.y + (dy / distancia) * passo,
    };
  }
  AtualzarPosicao();
}

function monstroEncontrouJogador() {
  estado = "achou";
  document.getElementById("musica-fundo").pause();
  document.getElementById("status-jogo").textContent = "O monstro  lulu te encontrou!";
  document.getElementById("game-over-texto").textContent = "Você foi encontrado! Fim de jogo.";
  document.getElementById("game-over").style.display = "flex";
}


document.getElementById("btn-jogar-novamente").addEventListener("click", () => {
  document.getElementById("game-over").style.display = "none";
  document.getElementById("musica-fundo").play();
  estado = "selecionando";
  esconderijoEscolhido = null;
  document.getElementById("status-jogo").textContent = "Clique em um número no mapa pra escolher onde se esconder.";
  escondrijos.forEach((s) => s.classList.remove("active"));
});

function jogadorSobreviveu() {
  estado = "sobreviveu";
  document.getElementById("musica-fundo").pause();
  document.getElementById("status-jogo").textContent = "Você sobreviveu!";
  document.getElementById("game-over-texto").textContent = "O monstro Lulu terminou a ronda e não te encontrou!";
  document.getElementById("game-over").style.display = "flex";
}




 
