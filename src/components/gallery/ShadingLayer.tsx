import { init } from '@bokuweb/zstd-wasm';
import { createTileLayerComponent } from '@react-leaflet/core';
import {
  Coords,
  DoneCallback,
  GridLayerOptions,
  Map as LeafletMap,
  LeafletMouseEvent,
  GridLayer as LGridLayer,
  Util,
} from 'leaflet';
import { createWorkerPool, WorkerPool } from '../../workerPool.js';

type ShadingLayerOptions = GridLayerOptions & {
  url: string;
  zoomOffset?: number;
};

class LShadingLayer extends LGridLayer {
  private _options: ShadingLayerOptions;

  private _acm = new Map<string, AbortController>();

  private _gpuPromise: Promise<[GPUDevice, GPURenderPipeline, GPUSampler]>;

  private format: GPUTextureFormat;

  private _workerPool: WorkerPool;

  private _light: [number, number, number];

  constructor(options: ShadingLayerOptions) {
    super(options);

    this._options = options;

    if (!navigator.gpu) {
      throw new Error('WebGPU not supported');
    }

    this._light = [0, 0, 1];

    this._workerPool = createWorkerPool(
      () => new Worker(new URL('./shadingLayerWorker', import.meta.url)),
    );

    const format = navigator.gpu.getPreferredCanvasFormat();

    this.format = format;

    this.on('tileunload', ({ coords }: { coords: Coords }) => {
      const key = `${coords.x}/${coords.y}/${coords.z}`;

      const ac = this._acm.get(key);

      if (ac) {
        ac.abort();

        this._acm.delete(key);
      }
    });

    this._gpuPromise = (async () => {
      const initPromise = init();

      const adapter = await navigator.gpu.requestAdapter();

      if (!adapter) {
        throw new Error('No GPU adapter found');
      }

      const device = await adapter.requestDevice();

      const shaderCode = await (await fetch('/horn.wgsl')).text();

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
          targets: [{ format }],
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

    this.handleMove = this.handleMove.bind(this);
  }

  handleMove(e: LeafletMouseEvent) {
    const size = this._map.getSize();

    this.setLight([
      2 * e.containerPoint.x - size.x,
      2 * e.containerPoint.y - size.y,
      size.x / 4,
    ]);
  }

  onAdd(map: LeafletMap): this {
    map.on('mousemove', this.handleMove);

    return super.onAdd(map);
  }

  onRemove(map: LeafletMap): this {
    this._workerPool.destroy();

    map.off('mousemove', this.handleMove);

    return super.onRemove(map);
  }

  async createTileAsync(
    coords: Coords,
    canvas: HTMLCanvasElement,
  ): Promise<void> {
    const [device, pipeline, sampler] = await this._gpuPromise;

    const context = canvas.getContext('webgpu');

    if (!context) {
      throw new Error('error getting context');
    }

    context.configure({
      device,
      format: this.format,
      alphaMode: 'opaque',
    });

    const controller = new AbortController();

    const { x, y } = coords;

    const z = coords.z + (this._options.zoomOffset ?? 0);

    const key = `${x}/${y}/${z}`;

    this._acm.set(key, controller);

    const { signal } = controller;

    const res = await fetch(Util.template(this._options.url, { x, y, z }), {
      signal,
    });

    this._acm.delete(key);

    if (res.status !== 200) {
      throw new Error('unexpected status ' + res.status);
    }

    const compressed = new Uint8Array(await res.arrayBuffer());

    const raw = await this._workerPool.addJob<Uint8Array<ArrayBufferLike>>(
      () => [compressed, [compressed.buffer]],
    );

    const f32data = new Float32Array(raw.buffer);

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

    const configBuffer = device.createBuffer({
      size: 4 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: texture.createView() },
        { binding: 2, resource: { buffer: configBuffer } },
      ],
    });

    (canvas as any).render = (light: [number, number, number]) => {
      const configData = new ArrayBuffer(4 * 4);

      const configView = new DataView(configData);

      let i = 0;

      for (const v of light) {
        configView.setFloat32(i * 4, v, true);

        i++;
      }

      configView.setUint32(i * 4, z, true);

      device.queue.writeBuffer(configBuffer, 0, configData);

      const encoder = device.createCommandEncoder();

      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            storeOp: 'store',
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
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
    const size = this.getTileSize();

    const canvas = document.createElement('canvas');

    canvas.width = size.x * (1 << (this._options.zoomOffset ?? 0));

    canvas.height = size.y * (1 << (this._options.zoomOffset ?? 0));

    canvas.style.width = size.x + 'px';

    canvas.style.height = size.x + 'px';

    this.createTileAsync(coords, canvas).then(() => {
      (canvas as any).render(this._light);

      done(undefined, canvas);
    }, done);

    return canvas;
  }

  setLight(light: [number, number, number]) {
    this._light = light;

    for (const tile in this._tiles) {
      (this._tiles[tile] as any).el.render?.(light);
    }
  }
}

type Props = ShadingLayerOptions;

export const ShadingLayer = createTileLayerComponent<LShadingLayer, Props>(
  (props, context) => ({
    instance: new LShadingLayer(props),
    context,
  }),

  // (instance, props, prevProps) => {
  // if (
  //   (['dirtySeq', 'filter', 'colorizeBy', 'myUserId'] as const).some(
  //     (p) => JSON.stringify(props[p]) !== JSON.stringify(prevProps[p]),
  //   )
  // ) {
  //   instance.redraw();
  // }
  // },
);

export default ShadingLayer;
