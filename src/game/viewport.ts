const BASE_VIEWPORT_WIDTH = 1024;
const BASE_VIEWPORT_HEIGHT = 768;
const MIN_CAMERA_ZOOM = 0.55;
const MAX_CAMERA_ZOOM = 1.15;
const MAX_PIXEL_RATIO = 2;

export function getResponsiveCameraZoom(width: number, height: number): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return 1;
  }

  const fitScale = Math.min(width / BASE_VIEWPORT_WIDTH, height / BASE_VIEWPORT_HEIGHT);
  return Math.max(MIN_CAMERA_ZOOM, Math.min(MAX_CAMERA_ZOOM, fitScale));
}

export function getCanvasPixelRatio(devicePixelRatio: number): number {
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) {
    return 1;
  }

  return Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
}
