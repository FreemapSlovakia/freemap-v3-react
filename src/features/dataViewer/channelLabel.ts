import type { DataViewerMessages } from './translations/DataViewerMessages.js';

type ChannelKey = keyof DataViewerMessages['vertex']['channels'];

/** What a vertex value or a per-point channel is called; an unknown key as is. */
export function channelLabel(
  key: string,
  vm: DataViewerMessages | undefined,
): string {
  switch (key) {
    case 'lat':
      return vm?.vertex.latitude ?? '';
    case 'lon':
      return vm?.vertex.longitude ?? '';
    case 'ele':
      return vm?.vertex.elevation ?? '';
    case 'times':
      return vm?.vertex.time ?? '';
    default:
      return vm?.vertex.channels[key as ChannelKey] ?? key;
  }
}
