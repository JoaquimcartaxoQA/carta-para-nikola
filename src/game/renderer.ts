/**
 * Nikola Race: A Grande Corrida
 * Renderizador 2D em HTML5 Canvas de alto desempenho e estilo cartunesco.
 */

import { CarState, RacerId, Obstacle, SceneryItem } from '../types/game';
import { TrackData } from './trackData';
import { RACER_PROFILES } from './physics';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private cameraZoom: number = 1.0;
  private timeSeconds: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d', { alpha: false })!;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    // Ajusta o zoom da câmera para manter boa visibilidade tanto em mobile quanto em telas grandes
    if (width < 640) {
      this.cameraZoom = 0.75;
    } else if (width < 1024) {
      this.cameraZoom = 0.88;
    } else {
      this.cameraZoom = 1.0;
    }
  }

  public render(
    trackData: TrackData,
    cars: Record<RacerId, CarState>,
    playerCar: CarState,
    delta: number
  ) {
    this.timeSeconds += delta;
    const ctx = this.ctx;
    if (!ctx) return;

    // 1. Atualizar Câmera suavemente centrada em Nikola
    const lookaheadX = Math.cos(playerCar.angle) * playerCar.speed * 12;
    const lookaheadY = Math.sin(playerCar.angle) * playerCar.speed * 12;
    const targetCamX = playerCar.x + lookaheadX;
    const targetCamY = playerCar.y + lookaheadY;

    // Interpolação suave (lerp)
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraY += (targetCamY - this.cameraY) * 0.12;

    // Limites da câmera para não sair do mapa
    const halfViewW = (this.width / 2) / this.cameraZoom;
    const halfViewH = (this.height / 2) / this.cameraZoom;
    this.cameraX = Math.max(halfViewW, Math.min(trackData.config.width - halfViewW, this.cameraX));
    this.cameraY = Math.max(halfViewH, Math.min(trackData.config.height - halfViewH, this.cameraY));

    // 2. Limpar viewport com cor de fundo do terreno
    ctx.save();
    ctx.fillStyle = trackData.config.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // 3. Aplicar transformação da câmera
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.cameraZoom, this.cameraZoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 4. Desenhar Terreno de Fundo decorativo (padrões de grama, dunas de areia)
    this.drawTerrainDetails(ctx, trackData);

    // 5. Desenhar Ponte (se floresta) por baixo da pista
    if (trackData.config.id === 'forest') {
      this.drawRiver(ctx);
    }

    // 6. Desenhar Pista de Corrida (Asfalto + Zebras + Linha de Chegada)
    this.drawTrack(ctx, trackData);

    // 7. Desenhar Marcas de Pneu / Skid Marks
    this.drawSkidMarks(ctx, cars);

    // 8. Desenhar Obstáculos e Boosts
    this.drawObstacles(ctx, trackData.obstacles);

    // 9. Desenhar Cenários ao redor (Árvores, Prédios, Cactos)
    this.drawScenery(ctx, trackData.scenery, trackData.config.id);

    // 10. Desenhar Linha de Chegada e Pórtico de Largada
    this.drawStartFinishBanner(ctx, trackData);

    // 11. Desenhar Carros dos Competidores
    // Renderiza primeiro os bots, depois Nikola por cima
    const renderOrder: RacerId[] = ['hevila', 'rafael', 'nikola'];
    renderOrder.forEach((id) => {
      this.drawCar(ctx, cars[id]);
    });

    // 12. Restaurar contexto
    ctx.restore();
  }

  private drawTerrainDetails(ctx: CanvasRenderingContext2D, trackData: TrackData) {
    const id = trackData.config.id;
    if (id === 'city') {
      // Grama com pequenas flores e textura
      ctx.fillStyle = '#059669';
      for (let i = 200; i < trackData.config.width; i += 400) {
        for (let j = 200; j < trackData.config.height; j += 400) {
          ctx.beginPath();
          ctx.arc(i, j, 45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (id === 'desert') {
      // Dunas de areia suaves
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      for (let x = 100; x < trackData.config.width; x += 300) {
        ctx.ellipse(x, 400, 140, 60, 0.2, 0, Math.PI * 2);
        ctx.ellipse(x + 150, 1800, 160, 70, -0.2, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (id === 'forest') {
      // Clareiras e folhas caídas
      ctx.fillStyle = '#166534';
      for (let i = 250; i < trackData.config.width; i += 350) {
        for (let j = 250; j < trackData.config.height; j += 350) {
          ctx.beginPath();
          ctx.arc(i, j, 60, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private drawRiver(ctx: CanvasRenderingContext2D) {
    // Rio cortando a pista na floresta
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(2700, 600);
    ctx.bezierCurveTo(2800, 1000, 2600, 1400, 2750, 1800);
    ctx.lineTo(2900, 1800);
    ctx.bezierCurveTo(2750, 1400, 2950, 1000, 2850, 600);
    ctx.closePath();
    ctx.fill();

    // Reflexo e espuma d'água
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(2730, 900);
    ctx.lineTo(2760, 930);
    ctx.moveTo(2700, 1300);
    ctx.lineTo(2740, 1340);
    ctx.stroke();
    ctx.restore();
  }

  private drawTrack(ctx: CanvasRenderingContext2D, trackData: TrackData) {
    const waypoints = trackData.waypoints;
    const roadWidth = trackData.roadWidth;

    // 1. Borda / Zebra Externa
    ctx.save();
    ctx.lineWidth = roadWidth + 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = trackData.config.curbColorA;
    this.traceTrackPath(ctx, waypoints);
    ctx.stroke();

    // 2. Zebra interna alternada
    ctx.lineWidth = roadWidth + 18;
    ctx.setLineDash([25, 25]);
    ctx.strokeStyle = trackData.config.curbColorB;
    this.traceTrackPath(ctx, waypoints);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Pista Principal (Asfalto / Terra)
    ctx.lineWidth = roadWidth;
    ctx.strokeStyle = trackData.config.roadColor;
    this.traceTrackPath(ctx, waypoints);
    ctx.stroke();

    // 4. Faixa Central Tracejada Branca / Amarela
    ctx.lineWidth = 6;
    ctx.setLineDash([30, 24]);
    ctx.strokeStyle = trackData.config.id === 'desert' ? '#facc15' : '#ffffff';
    this.traceTrackPath(ctx, waypoints);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  private traceTrackPath(ctx: CanvasRenderingContext2D, waypoints: Array<{ x: number; y: number }>) {
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.closePath();
  }

  private drawSkidMarks(ctx: CanvasRenderingContext2D, cars: Record<RacerId, CarState>) {
    ctx.save();
    Object.values(cars).forEach((car) => {
      car.driftTrail.forEach((point) => {
        ctx.fillStyle = `rgba(24, 24, 27, ${point.alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.restore();
  }

  private drawObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[]) {
    obstacles.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.type === 'boost') {
        // Bloco de Turbo com setas douradas animadas
        const pulse = Math.sin(this.timeSeconds * 6) * 4;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(-24 - pulse / 2, -24 - pulse / 2, 48 + pulse, 48 + pulse, 12);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Setas ">>>"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 0, 0);
      } else if (obs.type === 'cone') {
        // Cone de trânsito laranja e branco
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'hydrant') {
        // Hidrante vermelho
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (obs.type === 'puddle') {
        // Poça d'água brilhante
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, 0, obs.radius * 1.3, obs.radius * 0.9, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (obs.type === 'cactus') {
        // Cacto redondo
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.font = '16px Fredoka';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌵', 0, 0);
      } else if (obs.type === 'rock') {
        // Pedra chiseled
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d6d3d1';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (obs.type === 'log') {
        // Tronco de madeira
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(-22, -12, 44, 24, 6);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (obs.type === 'tumbleweed') {
        // Arbusto do deserto
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private drawScenery(ctx: CanvasRenderingContext2D, scenery: SceneryItem[], trackId: string) {
    scenery.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);

      if (item.type === 'building') {
        const sz = item.size || 150;
        // Prédio colorido
        const colors = ['#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'];
        const col = colors[(item.variant || 1) % colors.length];

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(-sz / 2, -sz / 2, sz, sz, 12);
        ctx.fill();

        // Teto estilizado
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.roundRect(-sz / 2 + 10, -sz / 2 + 10, sz - 20, sz - 20, 8);
        ctx.fill();

        // Janelas brilhantes
        ctx.fillStyle = '#fef08a';
        const winSize = 14;
        for (let wx = -sz / 2 + 25; wx < sz / 2 - 20; wx += 30) {
          for (let wy = -sz / 2 + 25; wy < sz / 2 - 20; wy += 30) {
            ctx.fillRect(wx, wy, winSize, winSize);
          }
        }
      } else if (item.type === 'tree') {
        const sz = item.size || 80;
        // Tronco
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, 0, 20, sz * 0.4);

        // Copa da árvore cartunesca verde
        ctx.fillStyle = trackId === 'forest' ? '#15803d' : '#22c55e';
        ctx.beginPath();
        ctx.arc(0, -10, sz * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(-sz * 0.15, -sz * 0.2, sz * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'cactus_large') {
        const sz = item.size || 80;
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.roundRect(-14, -sz / 2, 28, sz, 12);
        ctx.roundRect(-sz * 0.4, -sz * 0.2, sz * 0.8, 18, 8);
        ctx.fill();
      } else if (item.type === 'rock_large') {
        const sz = item.size || 120;
        ctx.fillStyle = '#a8a29e';
        ctx.beginPath();
        ctx.roundRect(-sz / 2, -sz * 0.35, sz, sz * 0.7, 18);
        ctx.fill();
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (item.type === 'flower') {
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'bridge') {
        // Pranchas de madeira da ponte
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-80, -30, 160, 60);
        ctx.fillStyle = '#b45309';
        for (let px = -70; px < 70; px += 20) {
          ctx.fillRect(px, -28, 4, 56);
        }
      }

      ctx.restore();
    });
  }

  private drawStartFinishBanner(ctx: CanvasRenderingContext2D, trackData: TrackData) {
    const sl = trackData.startLine;
    ctx.save();

    // Faixa quadriculada no chão
    const dx = sl.x2 - sl.x1;
    const dy = sl.y2 - sl.y1;
    const lineLen = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    ctx.translate(sl.x1, sl.y1);
    ctx.rotate(angle);

    const squareSize = 16;
    const count = Math.ceil(lineLen / squareSize);
    for (let i = 0; i < count; i++) {
      // 2 fileiras de quadrados pretos e brancos
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#18181b';
      ctx.fillRect(i * squareSize, -16, squareSize, 16);
      ctx.fillStyle = i % 2 === 0 ? '#18181b' : '#ffffff';
      ctx.fillRect(i * squareSize, 0, squareSize, 16);
    }

    // Pórtico de Chegada com Placa "NIKOLA RACE"
    ctx.restore();
    ctx.save();
    const midX = (sl.x1 + sl.x2) / 2;
    const midY = (sl.y1 + sl.y2) / 2;

    ctx.translate(midX, midY - 60);
    // Placa do Pórtico
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-100, -26, 200, 48, 12);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏁 NIKOLA RACE 🏁', 0, 0);

    ctx.restore();
  }

  private drawCar(ctx: CanvasRenderingContext2D, car: CarState) {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    const profile = RACER_PROFILES[car.id];

    // 1. Sombra projetada
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(3, 4, car.height * 0.55, car.width * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Fogo de Turbo no escapamento (se boost ativo)
    if (car.boostTimer > 0) {
      const flameLen = 22 + Math.random() * 12;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-car.height * 0.55, -8);
      ctx.lineTo(-car.height * 0.55 - flameLen, 0);
      ctx.lineTo(-car.height * 0.55, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-car.height * 0.55, -4);
      ctx.lineTo(-car.height * 0.55 - flameLen * 0.6, 0);
      ctx.lineTo(-car.height * 0.55, 4);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Rodas com calotas esportivas
    ctx.fillStyle = '#18181b';
    const wheelW = 14;
    const wheelH = 8;
    // Roda traseira esquerda
    ctx.fillRect(-car.height * 0.38, -car.width * 0.55, wheelW, wheelH);
    // Roda traseira direita
    ctx.fillRect(-car.height * 0.38, car.width * 0.55 - wheelH, wheelW, wheelH);
    // Roda dianteira esquerda
    ctx.fillRect(car.height * 0.25, -car.width * 0.55, wheelW, wheelH);
    // Roda dianteira direita
    ctx.fillRect(car.height * 0.25, car.width * 0.55 - wheelH, wheelW, wheelH);

    // 4. Carroceria Específica de Cada Piloto
    if (car.id === 'nikola') {
      // FALCÃO VELOZ #1 (Preto & Vermelho Esportivo, visual arrojado e travesso)
      ctx.fillStyle = profile.carColorPrimary; // #18181b
      ctx.beginPath();
      ctx.roundRect(-car.height * 0.45, -car.width * 0.45, car.height * 0.9, car.width * 0.9, 10);
      ctx.fill();

      // Spoiler Traseiro
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-car.height * 0.5, -car.width * 0.5, 8, car.width);

      // Listras Vermelhas Duplas Centrais
      ctx.fillStyle = profile.carColorSecondary;
      ctx.fillRect(-car.height * 0.4, -5, car.height * 0.8, 10);

      // Parabrisa
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(0, -car.width * 0.3, 14, car.width * 0.6, 4);
      ctx.fill();

      // Círculo com Número 1
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-car.height * 0.15, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.font = '900 12px Fredoka';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1', -car.height * 0.15, 0);

      // Faróis Amarelos brilhantes na frente
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(car.height * 0.45, -10, 4, 0, Math.PI * 2);
      ctx.arc(car.height * 0.45, 10, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (car.id === 'rafael') {
      // TRONCO TURBO 4x4 #2 (Madeira Rústica & Verde Aventura)
      ctx.fillStyle = profile.carColorPrimary; // Madeira
      ctx.beginPath();
      ctx.roundRect(-car.height * 0.45, -car.width * 0.48, car.height * 0.9, car.width * 0.96, 6);
      ctx.fill();

      // Detalhes de tábuas de madeira e capô verde aventura
      ctx.fillStyle = profile.carColorSecondary; // Verde
      ctx.fillRect(0, -car.width * 0.4, car.height * 0.4, car.width * 0.8);

      // Parabrisa robusto
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(-6, -car.width * 0.32, 10, car.width * 0.64);

      // Número 2
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-car.height * 0.2, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.font = '900 12px Fredoka';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('2', -car.height * 0.2, 0);
    } else {
      // ROSA RELÂMPAGO RETRÔ #3 (Mamãe Hevila: Rosa Elegante com Curvas Suaves)
      ctx.fillStyle = profile.carColorPrimary; // Rosa vibrante
      ctx.beginPath();
      ctx.roundRect(-car.height * 0.45, -car.width * 0.45, car.height * 0.9, car.width * 0.9, 14);
      ctx.fill();

      // Friso decorativo amarelo claro
      ctx.strokeStyle = profile.carColorAccent;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cockpit retrô aberto
      ctx.fillStyle = '#be185d';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Número 3
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(car.height * 0.2, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ec4899';
      ctx.font = '900 11px Fredoka';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('3', car.height * 0.2, 0);
    }

    ctx.restore();

    // 5. Etiqueta com Nome do Piloto flutuando acima do carro
    ctx.save();
    ctx.translate(car.x, car.y - 38);
    ctx.fillStyle = car.isPlayer ? '#dc2626' : '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-45, -12, 90, 24, 12);
    ctx.fill();
    ctx.strokeStyle = car.isPlayer ? '#fef08a' : '#94a3b8';
    ctx.lineWidth = car.isPlayer ? 2 : 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${profile.avatarEmoji} ${car.name.split(' ')[0]}`, 0, 0);
    ctx.restore();
  }
}
