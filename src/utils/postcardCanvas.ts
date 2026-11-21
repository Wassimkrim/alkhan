import { LOGO_SRC } from '../components/Ornaments';

export interface PostcardRenderOptions {
  photoSrc: string;
  titleText: string;
  subtitleText: string;
  scoreLine?: string;
}

export async function drawCanvasLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
): Promise<void> {
  const logoImg = new Image();
  logoImg.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    logoImg.onload = () => resolve();
    logoImg.onerror = () => reject(new Error('Logo load failed'));
    logoImg.src = LOGO_SRC;
  });

  const off = document.createElement('canvas');
  off.width = 256;
  off.height = 256;
  const octx = off.getContext('2d');
  if (!octx) return;

  const pad = Math.round(off.width * 0.12);
  octx.drawImage(logoImg, -pad, -pad, off.width + pad * 2, off.height + pad * 2);
  const imgData = octx.getImageData(0, 0, off.width, off.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    const alpha = Math.max(0, Math.min(255, Math.round((lum - 55) * 2.1)));
    d[i] = 255;
    d[i + 1] = 255;
    d[i + 2] = 255;
    d[i + 3] = alpha;
  }
  octx.putImageData(imgData, 0, 0);
  ctx.drawImage(off, cx - size / 2, cy - size / 2, size, size);
}

export async function renderElKhanPostcard(
  canvas: HTMLCanvasElement,
  options: PostcardRenderOptions
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = options.photoSrc;
  });

  const W = 900;
  const H = 1200;
  canvas.width = W;
  canvas.height = H;

  // Deep burgundy base
  ctx.fillStyle = '#3A111B';
  ctx.fillRect(0, 0, W, H);

  // Subtle inner hairline border
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // Pointed-arch clipped photo window
  const px = 80;
  const py = 86;
  const pw = W - 160;
  const ph = 755;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px, py + ph);
  ctx.lineTo(px, py + ph * 0.24);
  ctx.lineTo(px + pw * 0.14, py + ph * 0.11);
  ctx.lineTo(px + pw * 0.32, py + ph * 0.04);
  ctx.lineTo(px + pw * 0.5, py);
  ctx.lineTo(px + pw * 0.68, py + ph * 0.04);
  ctx.lineTo(px + pw * 0.86, py + ph * 0.11);
  ctx.lineTo(px + pw, py + ph * 0.24);
  ctx.lineTo(px + pw, py + ph);
  ctx.closePath();
  ctx.clip();

  const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
  ctx.restore();

  await drawCanvasLogo(ctx, W / 2, 932, 92);

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '800 36px "Noto Kufi Arabic", "Cairo", sans-serif';
  ctx.fillText(options.titleText, W / 2, 1044);

  if (options.scoreLine) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '600 22px "IBM Plex Sans Arabic", "Plus Jakarta Sans", sans-serif';
    ctx.fillText(options.scoreLine, W / 2, 1094);

    ctx.fillStyle = 'rgba(255,255,255,0.68)';
    ctx.font = '400 17px "Montserrat", sans-serif';
    ctx.fillText(options.subtitleText, W / 2, 1138);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '400 18px "Montserrat", sans-serif';
    ctx.fillText(options.subtitleText, W / 2, 1096);
  }
}

export async function shareOrDownloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  shareTitle: string,
  shareText: string
): Promise<void> {
  const triggerDownload = () => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  await new Promise<void>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        triggerDownload();
        resolve();
        return;
      }
      const file = new File([blob], filename, { type: 'image/png' });
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({
            title: shareTitle,
            text: shareText,
            files: [file],
          });
          resolve();
          return;
        } catch {
          // Fall back to direct download when share sheet is dismissed/unsupported
        }
      }
      triggerDownload();
      resolve();
    }, 'image/png');
  });
}
