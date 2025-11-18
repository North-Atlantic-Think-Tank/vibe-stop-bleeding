import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';

interface RainEffectAdvancedProps {
  backgroundImage?: string;
  width?: number;
  height?: number;
  rainIntensity?: number;
  windStrength?: number;
  glassDistortion?: number;
  className?: string;
  onLoad?: () => void;
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
  wind: number;
  stuck: boolean;
  stuckTime: number;
}

interface SmallDrop {
  x: number;
  y: number;
  size: number;
  alpha: number;
  graphics: PIXI.Graphics;
}

const RainEffectAdvanced: React.FC<RainEffectAdvancedProps> = ({
  backgroundImage = '',
  width = 800,
  height = 600,
  rainIntensity = 30,
  windStrength = 0,
  glassDistortion = 30,
  className = '',
  onLoad,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const smallDropsRef = useRef<SmallDrop[]>([]);
  const animationFrameRef = useRef<number>();
  const displacementFilterRef = useRef<PIXI.DisplacementFilter | null>(null);
  const isDestroyingRef = useRef(false);
  const initializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create displacement texture with perlin-like noise
  const createDisplacementTexture = useCallback(
    (app: PIXI.Application, w: number, h: number): PIXI.Sprite => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      // Create smooth noise pattern for glass texture
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;

          // Multi-octave noise for more natural glass texture
          const noise1 = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 10;
          const noise2 = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 20;
          const noise3 = Math.random() * 5;

          const totalNoise = noise1 + noise2 + noise3;

          data[i] = 128 + totalNoise; // R - X displacement
          data[i + 1] = 128 + totalNoise * 0.8; // G - Y displacement
          data[i + 2] = 128; // B
          data[i + 3] = 255; // A
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const texture = PIXI.Texture.from(canvas);
      const sprite = new PIXI.Sprite(texture);
      sprite.texture.source.scaleMode = 'linear';

      return sprite;
    },
    [],
  );

  // Create a raindrop with physics properties
  const createRaindrop = useCallback(
    (app: PIXI.Application, container: PIXI.Container): void => {
      const size = Math.random() * 4 + 1.5;
      const x = Math.random() * width;
      const y = Math.random() * -height - 100;
      const speed = Math.random() * 3 + 1;

      const raindrop: Raindrop = {
        x,
        y,
        size,
        speed,
        momentum: 0,
        sprite: new PIXI.Graphics(),
        trail: [],
        lastMoveTime: Date.now(),
        wind: (Math.random() - 0.5) * windStrength,
        stuck: false,
        stuckTime: 0,
      };

      container.addChild(raindrop.sprite);
      raindropsRef.current.push(raindrop);
    },
    [width, windStrength],
  );

  // Create small static drops on glass
  const createSmallDrops = useCallback(
    (container: PIXI.Container, count: number): void => {
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 2 + 0.5;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const alpha = Math.random() * 0.3 + 0.1;

        const graphics = new PIXI.Graphics();
        const circle = graphics.circle(0, 0, size);
        circle.fill({
          color: 0xffffff,
          alpha: alpha,
        });

        graphics.x = x;
        graphics.y = y;
        container.addChild(graphics);

        smallDropsRef.current.push({ x, y, size, alpha, graphics });
      }
    },
    [width, height],
  );

  // Draw raindrop with refraction effect
  const drawRaindrop = useCallback((drop: Raindrop): void => {
    if (isDestroyingRef.current || !drop.sprite || drop.sprite.destroyed)
      return;

    const g = drop.sprite;
    g.clear();

    // Draw trail with gradient fade
    drop.trail.forEach((point, i) => {
      const trailSize = drop.size * (0.2 + (i / drop.trail.length) * 0.8);
      const trailAlpha = point.alpha * (i / drop.trail.length) * 0.5;

      if (trailAlpha > 0.05) {
        const trail = g.circle(point.x - drop.x, point.y - drop.y, trailSize);
        trail.fill({
          color: 0xaaddff,
          alpha: trailAlpha,
        });
      }
    });

    // Main drop body with glass-like appearance
    const body = g.circle(0, 0, drop.size);
    body.fill({
      color: 0xffffff,
      alpha: 0.5,
    });

    // Inner reflection
    const innerCircle = g.circle(0, 0, drop.size * 0.7);
    innerCircle.fill({
      color: 0xe8f4ff,
      alpha: 0.3,
    });

    // Highlight for 3D effect
    const highlight = g.circle(
      drop.size * 0.25,
      -drop.size * 0.25,
      drop.size * 0.5,
    );
    highlight.fill({
      color: 0xffffff,
      alpha: 0.9,
    });

    // Edge refraction
    const edge = g.circle(0, 0, drop.size + 0.5);
    edge.stroke({
      color: 0x88bbee,
      width: 1,
      alpha: 0.6,
    });

    g.x = drop.x;
    g.y = drop.y;
  }, []);

  // Update raindrop physics
  const updateRaindrops = useCallback(
    (
      deltaTime: number,
      app: PIXI.Application,
      container: PIXI.Container,
    ): void => {
      if (isDestroyingRef.current) return;

      const currentTime = Date.now();

      raindropsRef.current.forEach((drop, index) => {
        if (drop.stuck) {
          // Drop is stuck on glass - slowly evaporate
          drop.stuckTime += deltaTime;
          drop.sprite.alpha = Math.max(0, 1 - drop.stuckTime / 3);

          if (drop.sprite.alpha <= 0) {
            if (!container.destroyed) {
              container.removeChild(drop.sprite);
            }
            if (!drop.sprite.destroyed) {
              drop.sprite.destroy();
            }
            raindropsRef.current.splice(index, 1);
          }
          return;
        }

        // Apply physics
        drop.momentum += 0.15 * deltaTime * 60;
        const gravitySpeed = (drop.speed + drop.momentum) * deltaTime * 60;
        drop.y += gravitySpeed;
        drop.x += drop.wind * deltaTime * 60;

        // Add trail points less frequently
        if (currentTime - drop.lastMoveTime > 100) {
          drop.trail.push({ x: drop.x, y: drop.y, alpha: 0.5 });
          drop.lastMoveTime = currentTime;

          if (drop.trail.length > 6) {
            drop.trail.shift();
          }
        }

        // Fade trail (simplified)
        for (let i = 0; i < drop.trail.length; i++) {
          drop.trail[i].alpha *= 0.9;
        }

        // Simplified collision detection (only check every few frames)
        if (index % 3 === 0 && currentTime % 5 === 0) {
          for (let i = index + 1; i < raindropsRef.current.length; i++) {
            const otherDrop = raindropsRef.current[i];
            if (!otherDrop.stuck && Math.abs(drop.y - otherDrop.y) < 40) {
              const dx = drop.x - otherDrop.x;
              const dy = drop.y - otherDrop.y;
              const distSq = dx * dx + dy * dy;
              const minDist = drop.size + otherDrop.size + 2;

              if (distSq < minDist * minDist) {
                // Merge drops
                if (drop.size >= otherDrop.size) {
                  drop.size = Math.min(drop.size + otherDrop.size * 0.15, 12);
                  drop.momentum += otherDrop.momentum * 0.3;

                  // Remove merged drop
                  if (!container.destroyed) {
                    container.removeChild(otherDrop.sprite);
                  }
                  if (!otherDrop.sprite.destroyed) {
                    otherDrop.sprite.destroy();
                  }
                  raindropsRef.current.splice(i, 1);
                  break;
                }
              }
            }
          }
        }

        // Large drops fall faster
        if (drop.size > 7) {
          drop.speed += 0.3 * deltaTime * 60;
        }

        // Random chance to stick to glass (reduced frequency)
        if (drop.size < 4 && Math.random() < 0.001) {
          drop.stuck = true;
          drop.stuckTime = 0;
          drop.momentum = 0;
        }

        // Slight drift (simplified, only update every other frame)
        if (index % 2 === 0) {
          drop.x += Math.sin(currentTime * 0.001 + index) * 0.2;
        }

        // Boundary check
        if (drop.x < -10) drop.x = width + 10;
        if (drop.x > width + 10) drop.x = -10;

        // Reset if off screen
        if (drop.y > height + 50) {
          drop.y = -Math.random() * 100 - 20;
          drop.x = Math.random() * width;
          drop.size = Math.random() * 4 + 1.5;
          drop.speed = Math.random() * 3 + 1;
          drop.momentum = 0;
          drop.trail = [];
          drop.wind = (Math.random() - 0.5) * windStrength;
        }

        drawRaindrop(drop);
      });

      // Maintain raindrop count
      while (raindropsRef.current.length < rainIntensity) {
        createRaindrop(app, container);
      }

      // Remove excess
      while (raindropsRef.current.length > rainIntensity) {
        const drop = raindropsRef.current.pop();
        if (drop) {
          if (!container.destroyed) {
            container.removeChild(drop.sprite);
          }
          if (!drop.sprite.destroyed) {
            drop.sprite.destroy();
          }
        }
      }
    },
    [rainIntensity, windStrength, createRaindrop, drawRaindrop, width, height],
  );

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) {
      return;
    }

    // Reset destroying flag and mark as initialized
    isDestroyingRef.current = false;
    initializedRef.current = true;

    if (!backgroundImage) {
      return;
    }

    const app = new PIXI.Application();
    appRef.current = app;

    const initApp = async () => {
      try {
        await app.init({
          width,
          height,
          backgroundColor: 0x1a1a2e,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!containerRef.current || isDestroyingRef.current) {
          return;
        }

        // Style the canvas to ensure it's visible
        app.canvas.style.display = 'block';
        app.canvas.style.width = '100%';
        app.canvas.style.height = '100%';
        app.canvas.style.objectFit = 'cover';

        containerRef.current.appendChild(app.canvas);
      } catch (error) {
        console.error('Failed to initialize PIXI app:', error);
        setIsLoading(false);
        return;
      }

      // Create layers
      const backgroundContainer = new PIXI.Container();
      const smallDropContainer = new PIXI.Container();
      const rainContainer = new PIXI.Container();

      app.stage.addChild(backgroundContainer);
      app.stage.addChild(smallDropContainer);
      app.stage.addChild(rainContainer);

      // Load background
      try {
        // Clear cache to avoid duplicate key warnings
        if (PIXI.Assets.cache.has(backgroundImage)) {
          PIXI.Assets.cache.remove(backgroundImage);
        }

        const texture = await PIXI.Assets.load(backgroundImage);
        const background = new PIXI.Sprite(texture);

        // const scaleX = width / background.width;
        // const scaleY = height / background.height;
        // const scale = Math.max(scaleX, scaleY);
        // background.scale.set(scale);
        // background.x = (width - background.width * scale) / 2;
        // background.y = (height - background.height * scale) / 2;

        // Background blur
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = 3;

        // Glass distortion
        const displacementSprite = createDisplacementTexture(
          app,
          width,
          height,
        );
        backgroundContainer.addChild(displacementSprite);

        const displacementFilter = new PIXI.DisplacementFilter({
          sprite: displacementSprite,
          scale: glassDistortion,
        });
        displacementFilterRef.current = displacementFilter;
        background.filters = [blurFilter, displacementFilter];
        backgroundContainer.addChild(background);

        // Create small static drops (reduced count)
        createSmallDrops(smallDropContainer, 50);

        // Create initial raindrops
        for (let i = 0; i < rainIntensity; i++) {
          setTimeout(() => {
            createRaindrop(app, rainContainer);
          }, i * 50);
        }

        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.error('Failed to load background:', error);
        setIsLoading(false);
      }

      // Animation loop with throttled frame rate (30 FPS instead of 60)
      let lastTime = Date.now();
      let lastFrameTime = Date.now();
      const targetFrameTime = 1000 / 30; // 30 FPS

      const animate = () => {
        if (isDestroyingRef.current) return;

        const currentTime = Date.now();
        const timeSinceLastFrame = currentTime - lastFrameTime;

        // Only update if enough time has passed (throttle to 30 FPS)
        if (timeSinceLastFrame >= targetFrameTime) {
          const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
          lastTime = currentTime;
          lastFrameTime = currentTime - (timeSinceLastFrame % targetFrameTime);

          updateRaindrops(deltaTime, app, rainContainer);
        }

        if (!isDestroyingRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animate();
    };

    initApp();

    return () => {
      // Set flag to prevent any further updates
      isDestroyingRef.current = true;

      // Cancel animation frame first
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }

      // Clean up raindrops manually
      raindropsRef.current.forEach((drop) => {
        try {
          if (drop.sprite && !drop.sprite.destroyed) {
            drop.sprite.destroy({ children: true });
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
      raindropsRef.current = [];

      // Clean up small drops
      smallDropsRef.current.forEach((drop) => {
        try {
          if (drop.graphics && !drop.graphics.destroyed) {
            drop.graphics.destroy({ children: true });
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
      smallDropsRef.current = [];

      // Destroy the app last
      if (appRef.current) {
        try {
          const app = appRef.current;
          appRef.current = null; // Clear reference first to prevent re-entry

          // Remove canvas from DOM first
          if (containerRef.current && app.canvas) {
            try {
              if (app.canvas.parentNode) {
                app.canvas.parentNode.removeChild(app.canvas);
              }
            } catch (e) {
              // Canvas already removed
            }
          }

          // Destroy the stage and renderer manually to avoid internal null reference errors
          try {
            if (app.stage) {
              app.stage.destroy({
                children: true,
                texture: false,
                textureSource: false,
              });
            }
          } catch (e) {
            // Stage already destroyed
          }

          try {
            if (app.renderer) {
              app.renderer.destroy();
            }
          } catch (e) {
            // Renderer already destroyed
          }
        } catch (e) {
          // Silently ignore cleanup errors
        }
      }

      // Clear cache
      try {
        if (PIXI.Assets.cache.has(backgroundImage)) {
          PIXI.Assets.cache.remove(backgroundImage);
        }
      } catch (e) {
        // Ignore cache cleanup errors
      }

      // Reset flags
      isDestroyingRef.current = false;
      initializedRef.current = false;
    };
  }, [backgroundImage]); // Only reinitialize when background image changes, not dimensions

  return (
    <div
      className={`rain-effect-advanced ${className}`}
      style={{
        position: 'relative',
        lineHeight: 0,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      />
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '16px',
            fontFamily: 'sans-serif',
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

export default RainEffectAdvanced;
