import { init } from '@bokuweb/zstd-wasm';
import { createTileLayerComponent } from '@react-leaflet/core';
import { createWorkerPool, WorkerPool } from '@shared/workerPool.js';
import {
  Coords,
  DoneCallback,
  GridLayerOptions,
  Map as LeafletMap,
  GridLayer as LGridLayer,
  Util,
} from 'leaflet';
import { Messages } from '@/translations/messagesInterface.js';
import { Color, SHADING_COMPONENT_TYPES, Shading } from '../model/Shading.js';
import { DataWriter } from './DataWriter.js';
import classes from './ShadingLayer.module.css';
import shadingWgslResource from './shading.wgsl';

type ShadingLayerOptions = GridLayerOptions & {
  url: string;
  zoomOffset?: number;
  shading: Shading;
  premiumFromZoom: number | undefined;
  premiumOnlyText: string | undefined;
  gpuMessages?: Messages['gpu'];
  onPremiumClick?: () => void;
};

type CanvasEx = HTMLCanvasElement & {
  _render: (shading: Shading) => void;
  _gpuCleanup?: () => void;
  _gpuUnloaded?: boolean;
};

class TileNotFoundError extends Error {}

// Tile fetch cancelled because the tile unloaded (e.g. the user panned away).
// This is normal, not a failure — it must not surface the error overlay.
class TileAbortedError extends Error {}

class GpuError extends Error {
  private _kind: keyof Messages['gpu'];
  private _detail: string | undefined;

  constructor(kind: keyof Messages['gpu'], error?: unknown) {
    super(
      'GPU Error: ' +
        kind +
        (error instanceof Error
          ? ': ' + error.message
          : error
            ? ': ' + String(error)
            : ''),
    );

    this._kind = kind;

    if (error) {
      this._detail = error instanceof Error ? error.message : String(error);
    }
  }

  get kind() {
    return this._kind;
  }

  get detail() {
    return this._detail;
  }
}

class LShadingLayer extends LGridLayer {
  private _options: ShadingLayerOptions;

  private acm = new Map<string, AbortController>();

  private gpuObjectsPromise: Promise<
    readonly [GPUDevice, GPURenderPipeline, GPUSampler]
  >;

  private textureFormat: GPUTextureFormat | undefined;

  private workerPool: WorkerPool | undefined;

  private shading: Shading;

  private errorDiv: HTMLDivElement | undefined;

  constructor(options: ShadingLayerOptions) {
    super(options);

    this._options = options;

    this.shading = options.shading;

    this.handlePremiumClick = this.handlePremiumClick.bind(this);

    if (!navigator.gpu) {
      this.gpuObjectsPromise = Promise.reject(new GpuError('notSupported'));

      return;
    }

    this.workerPool = createWorkerPool(
      () => new Worker(new URL('./shadingLayerWorker.js', import.meta.url)),
    );

    const textureFormat = navigator.gpu.getPreferredCanvasFormat();

    this.textureFormat = textureFormat;

    this.on('tileunload', ({ coords, tile }) => {
      const key = `${coords.x}/${coords.y}/${coords.z}`;

      const ac = this.acm.get(key);

      if (ac) {
        ac.abort();

        this.acm.delete(key);
      }

      // Free this tile's GPU resources eagerly. Firefox/wgpu has a much
      // tighter GPU allocator budget than Chrome/Dawn and relies on explicit
      // destroy(), otherwise panning leaks textures/swapchains until OOM.
      const canvas = tile as HTMLElement as CanvasEx;

      canvas._gpuUnloaded = true;

      canvas._gpuCleanup?.();
      canvas._gpuCleanup = undefined;
    });

    const initGpuObjects = async () => {
      const initPromise = init();

      let adapter;

      try {
        adapter = await navigator.gpu.requestAdapter();
      } catch (err) {
        throw new GpuError('errorRequestingDevice', err);
      }

      if (!adapter) {
        throw new GpuError('noAdapter');
      }

      const device = await adapter.requestDevice();

      device.lost.then((e) => {
        this.showError(new GpuError('lost', e.message));
      });

      const shaderCode = await (await fetch(shadingWgslResource)).text();

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

      return [device, pipeline, sampler] as const;
    };

    this.gpuObjectsPromise = initGpuObjects();
  }

  onRemove(map: LeafletMap): this {
    this.workerPool?.destroy();

    if (this.errorDiv) {
      this._map.getContainer().removeChild(this.errorDiv);
    }

    return super.onRemove(map);
  }

  async createTileAsync(
    coords: Coords,
    canvas: HTMLCanvasElement,
  ): Promise<boolean | void> {
    const [device, pipeline, sampler] = await this.gpuObjectsPromise;

    const context = canvas.getContext('webgpu');

    if (!context) {
      throw new Error('Error getting WebGPU context');
    }

    context.configure({
      device,
      format: this.textureFormat!,
      alphaMode: 'premultiplied',
    });

    const { x, y } = coords;

    const zoom = coords.z + (this._options.zoomOffset ?? 0);

    // Key by the tile's own z (matching the tileunload handler), not the
    // zoomOffset-adjusted `zoom` which is only used for URL templating.
    const key = `${x}/${y}/${coords.z}`;

    const url = Util.template(this._options.url, { x, y, z: zoom });

    canvas.dataset['url'] = url;

    const controller = new AbortController();

    this.acm.set(key, controller);

    const { signal } = controller;

    let res;

    try {
      res = await fetch(url, { signal });
    } catch {
      if (signal.aborted) {
        throw new TileAbortedError();
      }

      throw new TileNotFoundError();
      // throw err;
    } finally {
      this.acm.delete(key);
    }

    if (res.status === 404) {
      throw new TileNotFoundError();
    }

    if (res.status !== 200) {
      throw new Error('unexpected status ' + res.status);
    }

    canvas.style.display = '';

    const compressed = new Uint8Array(await res.arrayBuffer());

    const f32data = await this.workerPool!.addJob<Float32Array<ArrayBuffer>>(
      () => [compressed, [compressed.buffer]],
    );

    const tileSize = Math.sqrt(f32data.length);

    if (!Number.isInteger(tileSize)) {
      throw new Error('Tile is not square');
    }

    const texture = device.createTexture({
      size: [tileSize, tileSize],
      format: 'r32float',
      // Sampled-only (binding 1) and filled via writeTexture (COPY_DST); it is
      // never a render target. RENDER_ATTACHMENT would force a renderable
      // r32float allocation, which Firefox/wgpu on Vulkan can fail to satisfy
      // (device lost / "out of memory"), while Chrome/Dawn tolerates it.
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
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

    const canvasEx = canvas as CanvasEx;

    canvasEx._gpuCleanup = () => {
      texture.destroy();

      shadingBuffer.destroy();

      try {
        context.unconfigure();
      } catch {
        // context may already be gone
      }
    };

    // The tile may have unloaded while we were fetching/decoding; if so, free
    // what we just allocated and skip rendering into a discarded canvas.
    if (canvasEx._gpuUnloaded) {
      canvasEx._gpuCleanup();
      canvasEx._gpuCleanup = undefined;

      return false;
    }

    canvasEx._render = (shading: Shading) => {
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
        dw.f32('azimuth' in component ? component.azimuth : NaN);
        dw.f32('elevation' in component ? component.elevation : NaN);
        dw.f32(component.contrast);
        dw.f32(component.brightness);
        dw.f32('exaggeration' in component ? component.exaggeration : 1.0);
        dw.u32(component.colorStops.length);
        dw.pad32(1);

        for (const colorStop of component.colorStops) {
          dw.f32(colorStop.value);
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

    return true;
  }

  handlePremiumClick(e: MouseEvent) {
    e.preventDefault();

    this._options.onPremiumClick?.();
  }

  createTile(coords: Coords, done: DoneCallback) {
    if (this.errorDiv) {
      done(new Error('already errored'));

      return document.createElement('div');
    }

    const isOnPremiumZoom =
      this._options.premiumFromZoom !== undefined &&
      coords.z >= this._options.premiumFromZoom;

    if (isOnPremiumZoom && (coords.x + coords.y * 2) % 4) {
      const div = document.createElement('div');

      div.className = 'fm-nonpremium-tile';

      if (this._options.premiumOnlyText) {
        const a = document.createElement('a');

        a.href = '#show=premium';
        a.target = '_blank';
        a.innerText = this._options.premiumOnlyText;
        a.onclick = this.handlePremiumClick;

        div.appendChild(a);
      }

      setTimeout(() => done(undefined, div));

      return div;
    }

    const size = this.getTileSize();

    const canvas = document.createElement('canvas');

    canvas.style.display = 'none';

    canvas.width = size.x * (1 << (this._options.zoomOffset ?? 0));

    canvas.height = size.y * (1 << (this._options.zoomOffset ?? 0));

    canvas.style.width = size.x + 'px';

    canvas.style.height = size.x + 'px';

    this.createTileAsync(coords, canvas).then(
      () => {
        (canvas as CanvasEx)._render?.(this.shading);

        done(undefined, canvas);
      },
      (err) => {
        if (
          !(err instanceof TileNotFoundError) &&
          !(err instanceof TileAbortedError)
        ) {
          this.showError(err);
        }

        done(err);
      },
    );

    return canvas;
  }

  setShading(shading: Shading) {
    this.shading = shading;

    for (const tile in this._tiles) {
      (this._tiles[tile].el as CanvasEx)._render?.(shading);
    }
  }

  private showError(err: unknown) {
    // The rejection handler can fire after the layer was detached (panned away,
    // HMR, or quick add/remove), at which point there's no container to attach
    // the overlay to.
    if (this.errorDiv || !this._map) {
      return;
    }

    // Surface the underlying error; the overlay only shows a localized summary.
    console.error('ShadingLayer error:', err);

    this.workerPool?.destroy();

    this.errorDiv = document.createElement('div');

    this.errorDiv.classList.add(classes.layerError);

    const errorTextDiv = document.createElement('div');

    const message =
      err instanceof GpuError
        ? (this._options.gpuMessages?.[err.kind] ?? '…') + (err.detail ?? '')
        : err instanceof Error
          ? err.message
          : String(err);

    errorTextDiv.innerHTML = `<p><span class=${classes.sad}>:(</span></p><p>${message}</p>`;

    this.errorDiv.appendChild(errorTextDiv);

    this._map.getContainer().appendChild(this.errorDiv);

    // to hide non-premium tiles
    for (const tile of Object.values(this._tiles)) {
      tile.el.style.display = 'none';
    }
  }
}

type Props = ShadingLayerOptions;

export default createTileLayerComponent<LShadingLayer, Props>(
  (props, context) => ({
    instance: new LShadingLayer(props),
    context,
  }),

  (instance, props, prevProps) => {
    if (JSON.stringify(props.shading) !== JSON.stringify(prevProps.shading)) {
      instance.setShading(props.shading);
    } else if (
      (
        [
          'url',
          'zoomOffset',
          'premiumFromZoom',
          'premiumOnlyText',
          'gpuMessages',
        ] as const
      ).some((p) => JSON.stringify(props[p]) !== JSON.stringify(prevProps[p]))
    ) {
      instance.redraw();
    }
  },
);
