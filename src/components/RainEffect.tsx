import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

interface RainEffectProps {
  backgroundImage?: string;
  width?: number;
  height?: number;
  rainIntensity?: number;
  className?: string;
}

interface Raindrop {
  x: number;
  y: number;
  size: number;
  speed: number;
  momentum: number;
  sprite: PIXI.Graphics;
  trail: Array<{ x: number; y: number; alpha: number }>;
  lastMoveTime: number;
}

const RainEffect: React.FC<RainEffectProps> = ({
  backgroundImage = 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1920',
  width = 800,
  height = 600,
  rainIntensity = 30,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const animationFrameRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize PixiJS Application
    const app = new PIXI.Application();
    appRef.current = app;

    const initApp = async () => {
      await app.init({
        width,
        height,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      // Create containers
      const backgroundContainer = new PIXI.Container();
      const rainContainer = new PIXI.Container();
      const glassContainer = new PIXI.Container();

      app.stage.addChild(backgroundContainer);
      app.stage.addChild(rainContainer);
      app.stage.addChild(glassContainer);

      // Load and setup background image
      try {
        const texture = await PIXI.Assets.load(backgroundImage);
        const background = new PIXI.Sprite(texture);

        // Scale to cover the canvas
        const scaleX = width / background.width;
        const scaleY = height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.scale.set(scale);

        // Center the background
        background.x = (width - background.width * scale) / 2;
        background.y = (height - background.height * scale) / 2;

        // Apply blur filter for background
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = 2;
        background.filters = [blurFilter];

        backgroundContainer.addChild(background);

        // Create displacement map for glass effect
        const displacementSprite = createDisplacementTexture(app, width, height);
        glassContainer.addChild(displacementSprite);

        const displacementFilter = new PIXI.DisplacementFilter({
          sprite: displacementSprite,
          scale: 30,
        });
        backgroundContainer.filters = [blurFilter, displacementFilter];

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load background image:', error);
        setIsLoading(false);
      }

      // Create initial raindrops
      for (let i = 0; i < rainIntensity; i++) {
        createRaindrop(app, rainContainer);
      }

      // Animation loop
      let lastTime = Date.now();
      const animate = () => {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        updateRaindrops(deltaTime, app, rainContainer);
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    initApp();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      raindropsRef.current = [];
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
      }
    };
  }, [backgroundImage, width, height, rainIntensity]);

  // Create displacement texture for glass distortion
  const createDisplacementTexture = (
    app: PIXI.Application,
    w: number,
    h: number
  ): PIXI.Sprite => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // Create noise pattern for glass texture
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 10 - 5;
      data[i] = 128 + noise; // R - X displacement
      data[i + 1] = 128 + noise; // G - Y displacement
      data[i + 2] = 128; // B
      data[i + 3] = 255; // A
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = PIXI.Texture.from(canvas);
    const sprite = new PIXI.Sprite(texture);
    sprite.alpha = 0.3;

    return sprite;
  };

  // Create a single raindrop
  const createRaindrop = (
    app: PIXI.Application,
    container: PIXI.Container
  ): void => {
    const size = Math.random() * 3 + 2;
    const x = Math.random() * width;
    const y = Math.random() * -height;
    const speed = Math.random() * 2 + 1;

    const raindrop: Raindrop = {
      x,
      y,
      size,
      speed,
      momentum: 0,
      sprite: new PIXI.Graphics(),
      trail: [],
      lastMoveTime: Date.now(),
    };

    // Draw raindrop
    drawRaindrop(raindrop);
    container.addChild(raindrop.sprite);
    raindropsRef.current.push(raindrop);
  };

  // Draw raindrop with gradient effect
  const drawRaindrop = (drop: Raindrop): void => {
    const g = drop.sprite;
    g.clear();

    // Main drop body with gradient effect
    const gradient = g.circle(0, 0, drop.size);
    gradient.fill({
      color: 0xffffff,
      alpha: 0.6,
    });

    // Highlight
    const highlight = g.circle(drop.size * 0.3, -drop.size * 0.3, drop.size * 0.4);
    highlight.fill({
      color: 0xffffff,
      alpha: 0.8,
    });

    // Shadow/refraction edge
    const edge = g.circle(0, 0, drop.size);
    edge.stroke({
      color: 0x88ccff,
      width: 0.5,
      alpha: 0.4,
    });

    g.x = drop.x;
    g.y = drop.y;
  };

  // Update all raindrops
  const updateRaindrops = (
    deltaTime: number,
    app: PIXI.Application,
    container: PIXI.Container
  ): void => {
    const currentTime = Date.now();

    raindropsRef.current.forEach((drop, index) => {
      // Gravity acceleration
      drop.momentum += 0.1;
      drop.y += (drop.speed + drop.momentum) * deltaTime * 60;

      // Add to trail
      if (currentTime - drop.lastMoveTime > 50) {
        drop.trail.push({ x: drop.x, y: drop.y, alpha: 0.4 });
        drop.lastMoveTime = currentTime;

        // Limit trail length
        if (drop.trail.length > 8) {
          drop.trail.shift();
        }
      }

      // Draw trail
      drop.sprite.clear();

      // Draw trail segments
      drop.trail.forEach((point, i) => {
        const trailSize = drop.size * (0.3 + (i / drop.trail.length) * 0.7);
        const trailAlpha = point.alpha * (i / drop.trail.length);

        const trailCircle = drop.sprite.circle(
          point.x - drop.x,
          point.y - drop.y,
          trailSize
        );
        trailCircle.fill({
          color: 0xaaddff,
          alpha: trailAlpha,
        });
      });

      // Redraw main drop
      const mainDrop = drop.sprite.circle(0, 0, drop.size);
      mainDrop.fill({
        color: 0xffffff,
        alpha: 0.6,
      });

      const highlight = drop.sprite.circle(
        drop.size * 0.3,
        -drop.size * 0.3,
        drop.size * 0.4
      );
      highlight.fill({
        color: 0xffffff,
        alpha: 0.8,
      });

      drop.sprite.x = drop.x;
      drop.sprite.y = drop.y;

      // Check collision with other drops (merging effect)
      raindropsRef.current.forEach((otherDrop, otherIndex) => {
        if (index !== otherIndex) {
          const dx = drop.x - otherDrop.x;
          const dy = drop.y - otherDrop.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < drop.size + otherDrop.size) {
            // Merge drops - increase size of larger drop
            if (drop.size >= otherDrop.size) {
              drop.size = Math.min(drop.size + otherDrop.size * 0.1, 10);
              drop.momentum += otherDrop.momentum * 0.5;
            }
          }
        }
      });

      // Gravity threshold - large drops fall faster
      if (drop.size > 6) {
        drop.speed += 0.5;
      }

      // Random drift
      drop.x += (Math.random() - 0.5) * 0.5;

      // Reset if off screen
      if (drop.y > height + 20) {
        drop.y = -20;
        drop.x = Math.random() * width;
        drop.size = Math.random() * 3 + 2;
        drop.speed = Math.random() * 2 + 1;
        drop.momentum = 0;
        drop.trail = [];
      }
    });

    // Maintain raindrop count
    if (raindropsRef.current.length < rainIntensity) {
      createRaindrop(app, container);
    }

    // Remove excess raindrops
    while (raindropsRef.current.length > rainIntensity) {
      const drop = raindropsRef.current.pop();
      if (drop) {
        container.removeChild(drop.sprite);
        drop.sprite.destroy();
      }
    }
  };

  return (
    <div className={`rain-effect-container ${className}`} style={{ position: 'relative' }}>
      <div ref={containerRef} />
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '18px',
          }}
        >
          Loading rain effect...
        </div>
      )}
    </div>
  );
};

export default RainEffect;
