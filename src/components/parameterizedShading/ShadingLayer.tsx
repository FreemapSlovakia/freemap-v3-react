import { init } from '@bokuweb/zstd-wasm';
import { createTileLayerComponent } from '@react-leaflet/core';
import {
  Coords,
  DoneCallback,
  GridLayerOptions,
  Map as LeafletMap,
  GridLayer as LGridLayer,
  Util,
} from 'leaflet';
import { createWorkerPool, WorkerPool } from '../../workerPool.js';
import { DataWriter } from './DataWriter.js';
import { Color, Shading, SHADING_COMPONENT_TYPES } from './Shading.js';

type ShadingLayerOptions = GridLayerOptions & {
  url: string;
  zoomOffset?: number;
  shading: Shading;
  premiumFromZoom: number | undefined;
  premiumOnlyText: string | undefined;
};

type CanvasWithRender = HTMLCanvasElement & {
  render: (shading: Shading) => void;
};

class LShadingLayer extends LGridLayer {
  private _options: ShadingLayerOptions;

  private acm = new Map<string, AbortController>();

  private gpuPromise: Promise<[GPUDevice, GPURenderPipeline, GPUSampler]>;

  private textureFormat: GPUTextureFormat;

  private workerPool: WorkerPool;

  private shading: Shading;

  constructor(options: ShadingLayerOptions) {
    super(options);

    this._options = options;

    if (!navigator.gpu) {
      throw new Error('WebGPU not supported');
    }

    this.shading = options.shading;

    this.workerPool = createWorkerPool(
      () => new Worker(new URL('./shadingLayerWorker', import.meta.url)),
    );

    const textureFormat = navigator.gpu.getPreferredCanvasFormat();

    this.textureFormat = textureFormat;

    this.on('tileunload', ({ coords }: { coords: Coords }) => {
      const key = `${coords.x}/${coords.y}/${coords.z}`;

      const ac = this.acm.get(key);

      if (ac) {
        ac.abort();

        this.acm.delete(key);
      }
    });

    this.gpuPromise = (async () => {
      const initPromise = init();

      const adapter = await navigator.gpu.requestAdapter();

      if (!adapter) {
        throw new Error('No GPU adapter found');
      }

      const device = await adapter.requestDevice();

      const shaderCode = await (await fetch('/shading.wgsl')).text();

      const shaderModule = device.createShaderModule({ code: shaderCode });

      const info = await shaderModule.getCompilationInfo();

      if (info.messages.length > 0) {
        for (const msg of info.messages) {
          console.error(
            `[${msg.lineNum}:${msg.linePos}] ${msg.type}: ${msg.message}`,
          );
        }

        if (info.messages.some((m) => m.type === 'error')) {
          throw new Error('WGSL compilation failed');
        }
      }

      const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: { type: 'non-filtering' },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            texture: { sampleType: 'unfilterable-float' }, // for r32float!
          },
          {
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: { type: 'uniform' },
          },
        ],
      });

      const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      });

      const pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main',
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [{ format: textureFormat }],
        },
        primitive: { topology: 'triangle-list' },
      });

      const sampler = device.createSampler({
        magFilter: 'nearest',
        minFilter: 'nearest',
      });

      await initPromise;

      return [device, pipeline, sampler];
    })();
  }

  onRemove(map: LeafletMap): this {
    this.workerPool.destroy();

    return super.onRemove(map);
  }

  async createTileAsync(
    coords: Coords,
    canvas: HTMLCanvasElement,
  ): Promise<void> {
    const [device, pipeline, sampler] = await this.gpuPromise;

    const context = canvas.getContext('webgpu');

    if (!context) {
      throw new Error('error getting context');
    }

    context.configure({
      device,
      format: this.textureFormat,
      alphaMode: 'premultiplied',
    });

    const controller = new AbortController();

    const { x, y } = coords;

    const zoom = coords.z + (this._options.zoomOffset ?? 0);

    const key = `${x}/${y}/${zoom}`;

    this.acm.set(key, controller);

    const { signal } = controller;

    const res = await fetch(
      Util.template(this._options.url, { x, y, z: zoom }),
      {
        signal,
      },
    );

    this.acm.delete(key);

    if (res.status !== 200) {
      throw new Error('unexpected status ' + res.status);
    }

    const compressed = new Uint8Array(await res.arrayBuffer());

    const f32data = await this.workerPool.addJob<Float32Array>(() => [
      compressed,
      [compressed.buffer],
    ]);

    const tileSize = Math.sqrt(f32data.length);

    if (!Number.isInteger(tileSize)) {
      throw new Error('Tile is not square');
    }

    const texture = device.createTexture({
      size: [tileSize, tileSize],
      format: 'r32float',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.writeTexture(
      { texture },
      f32data,
      { bytesPerRow: tileSize * 4 },
      { width: tileSize, height: tileSize },
    );

    const shadingBuffer = device.createBuffer({
      size:
        8 * 4 + 8 /* MAX_COMPONENTS */ * 4 * (8 + 16 /* colors len */ * 8 * 8),
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: texture.createView() },
        { binding: 2, resource: { buffer: shadingBuffer } },
      ],
    });

    (canvas as CanvasWithRender).render = (shading: Shading) => {
      const shadingData = new ArrayBuffer(shadingBuffer.size);

      const dw = new DataWriter(shadingData);

      function writeColor(color: Color) {
        dw.f32(color[0] / 255);
        dw.f32(color[1] / 255);
        dw.f32(color[2] / 255);
        dw.f32(color[3]);
      }

      dw.u32(shading.components.length);
      dw.u32(zoom);
      dw.pad32(2);

      writeColor(shading.backgroundColor);

      for (const component of shading.components) {
        dw.u32(SHADING_COMPONENT_TYPES.indexOf(component.type));
        dw.f32(component.azimuth);
        dw.f32(component.elevation);
        dw.f32(component.contrast);
        dw.f32(component.brightness);
        dw.u32(component.colorStops.length);
        dw.pad32(2);

        const range =
          component.type === 'aspect'
            ? 2 * Math.PI
            : component.type === 'color-relief'
              ? 2660
              : 0;

        for (const colorStop of component.colorStops) {
          dw.f32(colorStop.value * range);
          dw.pad32(3);

          writeColor(colorStop.color);
        }

        dw.pad32(8 * (16 - component.colorStops.length));
      }

      device.queue.writeBuffer(shadingBuffer, 0, shadingData);

      const encoder = device.createCommandEncoder();

      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            storeOp: 'store',
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
          },
        ],
      });

      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(6, 1, 0, 0);
      pass.end();

      device.queue.submit([encoder.finish()]);

      // await device.queue.onSubmittedWorkDone();
    };

    // })
    // .catch((err) => {
    //   if (!String(err).includes('abort')) {
    //     console.error(err);
    //   }

    //   done(err);

    //   this._acm.delete(key);
    // });
  }

  createTile(coords: Coords, done: DoneCallback) {
    const isOnPremiumZoom =
      this._options.premiumFromZoom !== undefined &&
      coords.z >= this._options.premiumFromZoom;

    if (isOnPremiumZoom && (coords.x + coords.y * 2) % 4) {
      const div = document.createElement('div');

      div.className = 'fm-nonpremium-tile';

      if (this._options.premiumOnlyText) {
        div.innerHTML = '<div>' + this._options.premiumOnlyText + '</div>';
      }

      setTimeout(() => done(undefined, div));

      return div;
    }

    const size = this.getTileSize();

    const canvas = document.createElement('canvas');

    canvas.width = size.x * (1 << (this._options.zoomOffset ?? 0));

    canvas.height = size.y * (1 << (this._options.zoomOffset ?? 0));

    canvas.style.width = size.x + 'px';

    canvas.style.height = size.x + 'px';

    this.createTileAsync(coords, canvas).then(() => {
      (canvas as CanvasWithRender).render(this.shading);

      done(undefined, canvas);
    }, done);

    return canvas;
  }

  setShading(shading: Shading) {
    this.shading = shading;

    for (const tile in this._tiles) {
      (this._tiles[tile].el as CanvasWithRender).render?.(shading);
    }
  }
}

type Props = ShadingLayerOptions;

export const ShadingLayer = createTileLayerComponent<LShadingLayer, Props>(
  (props, context) => ({
    instance: new LShadingLayer(props),
    context,
  }),

  (instance, props, prevProps) => {
    if (
      (['shading'] as const).some(
        (p) => JSON.stringify(props[p]) !== JSON.stringify(prevProps[p]),
      )
    ) {
      instance.setShading(props.shading);
    }
  },
);

export default ShadingLayer;
