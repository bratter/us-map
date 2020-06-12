import { GeoStream } from 'd3-geo';

export function multiplex(streams: GeoStream[]): GeoStream {
  return {
    point(x: number, y: number) { for (const s of streams) s.point(x, y); },
    sphere() { for (const s of streams) s.sphere(); },
    lineStart() { for (const s of streams) s.lineStart(); },
    lineEnd() { for (const s of streams) s.lineEnd(); },
    polygonStart() { for (const s of streams) s.polygonStart(); },
    polygonEnd() { for (const s of streams) s.polygonEnd(); },
  };
}
